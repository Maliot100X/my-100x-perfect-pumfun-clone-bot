"use client"

import { useEffect, useCallback, useRef } from "react"
import { usePumpStore } from "@/lib/store"
import type { TokenData, EnrichedToken, TradeData } from "@/lib/types"

const WEBSOCKET_URL = "wss://pumpportal.fun/api/data"
const SOL_PRICE_USD = 175
const RECONNECT_DELAY = 5000
const MAX_TOKENS = 50

export function useStablePumpSocket() {
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subscribedTokensRef = useRef<Set<string>>(new Set())
  const isConnecting = useRef(false)

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

  const subscribeToTokenTrade = useCallback((mint: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN && !subscribedTokensRef.current.has(mint)) {
      socketRef.current.send(JSON.stringify({ method: "subscribeTokenTrade", keys: [mint] }))
      subscribedTokensRef.current.add(mint)
    }
  }, [])

  const enrichToken = useCallback((token: TokenData): EnrichedToken => {
    const marketCapUsd = token.marketCapSol * SOL_PRICE_USD
    const totalSupply = 1_000_000_000
    const tokensSold = totalSupply - token.vTokensInBondingCurve
    const bondingCurveProgress = (tokensSold / totalSupply) * 100

    return {
      ...token,
      metadata: undefined,
      createdAt: Date.now(),
      marketCapUsd,
      bondingCurveProgress,
      priceHistory: [token.marketCapSol],
      volume24h: token.vSolInBondingCurve || 0,
      tradeCount: 0,
      topHolderPercent: Math.random() * 20,
    }
  }, [])

  const connect = useCallback(() => {
    if (typeof window === "undefined") return

    if (isConnecting.current || socketRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    isConnecting.current = true
    setConnectionStatus(false, "connecting")
    addLog("WS", "Connecting...")

    try {
      const connectionStart = Date.now()
      const ws = new WebSocket(WEBSOCKET_URL)
      socketRef.current = ws

      ws.onopen = () => {
        const latency = Date.now() - connectionStart
        setLatency(latency)
        isConnecting.current = false
        setConnectionStatus(true, null)
        addLog("WS", `Connected | Latency: ${latency}ms`)

        // Subscribe to new tokens
        ws.send(JSON.stringify({ method: "subscribeNewToken" }))

        // Resubscribe to any open position trades
        subscribedTokensRef.current.clear()
        openPositions.forEach((p) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: "subscribeTokenTrade", keys: [p.token.mint] }))
            subscribedTokensRef.current.add(p.token.mint)
          }
        })
      }

      ws.onmessage = (event) => {
        incrementPackets()
        try {
          const data = JSON.parse(event.data)

          // New token creation
          if (data.txType === "create" || (data.mint && !data.txType)) {
            const enrichedToken = enrichToken(data as TokenData)
            addToken(enrichedToken)
          }

          // Trade events for live PnL
          if (data.txType === "buy" || data.txType === "sell") {
            const tradeData: TradeData = {
              mint: data.mint,
              traderPublicKey: data.traderPublicKey,
              solAmount: Math.abs(data.vSolInBondingCurve || data.initialBuy || 0),
              isBuy: data.txType === "buy",
              timestamp: Date.now(),
            }
            setLatestTrade(tradeData)
            addTradeToVelocity(data.mint)
            if (tradeData.isBuy) addToVolume(data.mint, tradeData.solAmount)
            updatePositionPrice(data.mint, data.marketCapSol)
          }
        } catch {
          // Ignore malformed messages
        }
      }

      ws.onerror = (err) => {
        console.error("[WS] Error", err)
        ws.close()
      }

      ws.onclose = () => {
        console.log("[WS] Closed")
        isConnecting.current = false
        socketRef.current = null

        setConnectionStatus(false, "error")
        addLog("WS", `Reconnecting in ${RECONNECT_DELAY / 1000}s...`)

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        reconnectTimeoutRef.current = setTimeout(() => connect(), RECONNECT_DELAY)
      }
    } catch (error) {
      isConnecting.current = false
      setConnectionStatus(false, "error")
      addLog("WS", "Failed to establish connection")

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      reconnectTimeoutRef.current = setTimeout(() => connect(), RECONNECT_DELAY)
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
  ])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }

    subscribedTokensRef.current.clear()
    isConnecting.current = false
    setConnectionStatus(false, null)
  }, [setConnectionStatus])

  const forceReconnect = useCallback(() => {
    addLog("WS", "FORCE RECONNECT initiated...")
    disconnect()
    setTimeout(() => {
      connect()
    }, 100)
  }, [connect, disconnect, addLog])

  useEffect(() => {
    if (typeof window === "undefined") return

    connect()

    return () => {
      disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === "undefined") return
    openPositions.forEach((p) => subscribeToTokenTrade(p.token.mint))
  }, [openPositions, subscribeToTokenTrade])

  return {
    subscribeToTokenTrade,
    forceReconnect,
    disconnect,
  }
}
