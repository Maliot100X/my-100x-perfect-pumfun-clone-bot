"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { usePumpStore } from "@/lib/store"
import type { TokenData, EnrichedToken, TradeData } from "@/lib/types"

const WEBSOCKET_URL = "wss://pumpportal.fun/api/data"
const SOL_PRICE_USD = 175
const RECONNECT_DELAY = 500
const MAX_TOKENS = 50
const BATCH_INTERVAL = 1000 // Update React state only once per second

export function useStablePumpSocket() {
  const [status, setStatus] = useState<"initializing" | "connecting" | "online" | "offline">("initializing")
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subscribedTokensRef = useRef<Set<string>>(new Set())
  const isConnecting = useRef(false)
  const retryCountRef = useRef(0)
  const isMountedRef = useRef(true)

  const tokenBufferRef = useRef<EnrichedToken[]>([])
  const tradeBufferRef = useRef<TradeData[]>([])
  const batchIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const {
    addToken,
    setConnectionStatus,
    updatePositionPrice,
    openPositions,
    addLog,
    setLatestTrade,
    addTradeToVelocity,
    addToVolume,
    incrementPackets,
    setLatency,
  } = usePumpStore()

  const fetchTokenMetadata = useCallback(async (uri: string) => {
    try {
      const response = await fetch(uri)
      if (!response.ok) return null
      const metadata = await response.json()
      return {
        name: metadata.name || "Unknown",
        symbol: metadata.symbol || "???",
        image: metadata.image,
        description: metadata.description,
      }
    } catch {
      return null
    }
  }, [])

  const subscribeToTokenTrade = useCallback((mint: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN && !subscribedTokensRef.current.has(mint)) {
      socketRef.current.send(JSON.stringify({ method: "subscribeTokenTrade", keys: [mint] }))
      subscribedTokensRef.current.add(mint)
    }
  }, [])

  const enrichToken = useCallback(
    async (token: TokenData): Promise<EnrichedToken> => {
      const marketCapUsd = token.marketCapSol * SOL_PRICE_USD
      const totalSupply = 1_000_000_000
      const tokensSold = totalSupply - token.vTokensInBondingCurve
      const bondingCurveProgress = (tokensSold / totalSupply) * 100

      let metadata = undefined
      if (token.uri) {
        metadata = await fetchTokenMetadata(token.uri)
      }

      return {
        ...token,
        name: metadata?.name || token.name || "Unknown Token",
        symbol: metadata?.symbol || token.symbol || "???",
        metadata,
        createdAt: Date.now(),
        marketCapUsd,
        bondingCurveProgress,
        priceHistory: [token.marketCapSol],
        volume24h: token.vSolInBondingCurve || 0,
        tradeCount: 0,
        topHolderPercent: Math.random() * 20,
      }
    },
    [fetchTokenMetadata],
  )

  const flushBatches = useCallback(() => {
    if (!isMountedRef.current) return

    // Flush token buffer
    if (tokenBufferRef.current.length > 0) {
      const tokensToAdd = [...tokenBufferRef.current]
      tokenBufferRef.current = []
      tokensToAdd.forEach((token) => addToken(token))
    }

    // Flush trade buffer
    if (tradeBufferRef.current.length > 0) {
      const tradesToProcess = [...tradeBufferRef.current]
      tradeBufferRef.current = []
      tradesToProcess.forEach((trade) => {
        setLatestTrade(trade)
        addTradeToVelocity(trade.mint)
        if (trade.isBuy) addToVolume(trade.mint, trade.solAmount)

        // Update position prices for open positions
        const position = openPositions.find((p) => p.token.mint === trade.mint)
        if (position) {
          // Estimate new price based on trade
          const newPrice = position.currentPrice * (trade.isBuy ? 1.01 : 0.99)
          updatePositionPrice(trade.mint, newPrice)
        }
      })
    }
  }, [addToken, setLatestTrade, addTradeToVelocity, addToVolume, updatePositionPrice, openPositions])

  const connect = useCallback(() => {
    if (typeof window === "undefined") return
    if (!isMountedRef.current) return

    if (isConnecting.current) {
      return
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    if (socketRef.current) {
      try {
        socketRef.current.close()
      } catch {
        // Ignore close errors
      }
      socketRef.current = null
    }

    isConnecting.current = true
    setStatus("connecting")
    setConnectionStatus(false, "connecting")
    addLog("WS", `Connecting... (attempt ${retryCountRef.current + 1})`)

    try {
      const connectionStart = Date.now()
      const ws = new WebSocket(WEBSOCKET_URL)
      socketRef.current = ws

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close()
        }
      }, 10000)

      ws.onopen = () => {
        clearTimeout(connectionTimeout)
        if (!isMountedRef.current) return

        const latency = Date.now() - connectionStart
        setLatency(latency)
        isConnecting.current = false
        retryCountRef.current = 0
        setStatus("online")
        setConnectionStatus(true, null)
        addLog("WS", `Connected | Latency: ${latency}ms`)

        ws.send(JSON.stringify({ method: "subscribeNewToken" }))

        subscribedTokensRef.current.clear()
        openPositions.forEach((p) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: "subscribeTokenTrade", keys: [p.token.mint] }))
            subscribedTokensRef.current.add(p.token.mint)
          }
        })

        if (batchIntervalRef.current) clearInterval(batchIntervalRef.current)
        batchIntervalRef.current = setInterval(flushBatches, BATCH_INTERVAL)
      }

      ws.onmessage = async (event) => {
        if (!isMountedRef.current) return
        incrementPackets()

        try {
          const data = JSON.parse(event.data)

          if (data.txType === "create") {
            const enrichedToken = await enrichToken(data as TokenData)
            tokenBufferRef.current.push(enrichedToken)
          }

          if (data.txType === "buy" || data.txType === "sell") {
            const tradeData: TradeData = {
              mint: data.mint,
              traderPublicKey: data.traderPublicKey,
              solAmount: Math.abs(data.vSolInBondingCurve || data.initialBuy || 0),
              isBuy: data.txType === "buy",
              timestamp: Date.now(),
            }
            tradeBufferRef.current.push(tradeData)
          }
        } catch {
          // Ignore malformed messages
        }
      }

      ws.onerror = () => {
        clearTimeout(connectionTimeout)
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        isConnecting.current = false
        socketRef.current = null

        if (batchIntervalRef.current) {
          clearInterval(batchIntervalRef.current)
          batchIntervalRef.current = null
        }

        if (!isMountedRef.current) return

        setStatus("offline")
        setConnectionStatus(false, "error")
        retryCountRef.current += 1

        const delay = Math.min(RECONNECT_DELAY * Math.pow(1.5, retryCountRef.current - 1), 30000)
        addLog("WS", `Reconnecting in ${Math.round(delay / 1000)}s...`)

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) connect()
        }, delay)
      }
    } catch (error) {
      isConnecting.current = false
      setStatus("offline")
      setConnectionStatus(false, "error")
      addLog("WS", "Failed to establish connection")

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) connect()
      }, RECONNECT_DELAY)
    }
  }, [
    enrichToken,
    setConnectionStatus,
    updatePositionPrice,
    openPositions,
    addLog,
    setLatestTrade,
    addTradeToVelocity,
    addToVolume,
    incrementPackets,
    setLatency,
    addToken,
    flushBatches,
  ])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current)
      batchIntervalRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }

    subscribedTokensRef.current.clear()
    isConnecting.current = false
    retryCountRef.current = 0
    setStatus("offline")
    setConnectionStatus(false, null)
  }, [setConnectionStatus])

  const forceReconnect = useCallback(() => {
    addLog("WS", "FORCE RECONNECT initiated...")
    retryCountRef.current = 0
    disconnect()
    setTimeout(() => {
      if (isMountedRef.current) connect()
    }, 100)
  }, [connect, disconnect, addLog])

  useEffect(() => {
    if (typeof window === "undefined") return

    isMountedRef.current = true
    connect()

    return () => {
      isMountedRef.current = false
      disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === "undefined") return
    openPositions.forEach((p) => subscribeToTokenTrade(p.token.mint))
  }, [openPositions, subscribeToTokenTrade])

  return {
    status,
    subscribeToTokenTrade,
    forceReconnect,
    disconnect,
  }
}
