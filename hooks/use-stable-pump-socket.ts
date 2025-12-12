"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { usePumpStore } from "@/lib/store"
import type { TokenData, EnrichedToken, TradeData } from "@/lib/types"

const WEBSOCKET_URL = "wss://pumpportal.fun/api/data"
const SOL_PRICE_USD = 175
const RECONNECT_DELAY = 500 // Reduced reconnect delay from 5000ms to 500ms for faster recovery
const MAX_TOKENS = 50

export function useStablePumpSocket() {
  const [status, setStatus] = useState<"initializing" | "connecting" | "online" | "offline">("initializing")
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subscribedTokensRef = useRef<Set<string>>(new Set())
  const isConnecting = useRef(false)
  const retryCountRef = useRef(0)
  const isMountedRef = useRef(true)

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
    if (!isMountedRef.current) return

    if (isConnecting.current) {
      console.log("[v0] Already connecting, skipping...")
      return
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log("[v0] Already connected, skipping...")
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
    console.log("[v0] Attempting WebSocket connection...")

    try {
      const connectionStart = Date.now()
      const ws = new WebSocket(WEBSOCKET_URL)
      socketRef.current = ws

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log("[v0] Connection timeout, closing socket...")
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
        console.log("[v0] WebSocket connected successfully!")

        ws.send(JSON.stringify({ method: "subscribeNewToken" }))
        console.log("[v0] Subscribed to new tokens")

        subscribedTokensRef.current.clear()
        openPositions.forEach((p) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: "subscribeTokenTrade", keys: [p.token.mint] }))
            subscribedTokensRef.current.add(p.token.mint)
          }
        })
      }

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return
        incrementPackets()
        try {
          const data = JSON.parse(event.data)

          if (data.txType === "create" || (data.mint && !data.txType)) {
            const enrichedToken = enrichToken(data as TokenData)
            addToken(enrichedToken)
          }

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
        clearTimeout(connectionTimeout)
        console.error("[v0] WebSocket error occurred - this is often a CORS or network issue")
        console.error("[v0] Error details:", JSON.stringify(err))
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        console.log("[v0] WebSocket closed, code:", event.code, "reason:", event.reason)
        isConnecting.current = false
        socketRef.current = null

        if (!isMountedRef.current) return

        setStatus("offline")
        setConnectionStatus(false, "error")
        retryCountRef.current += 1

        const delay = Math.min(RECONNECT_DELAY * Math.pow(1.5, retryCountRef.current - 1), 30000)
        addLog("WS", `Reconnecting in ${Math.round(delay / 1000)}s...`)
        console.log("[v0] Will reconnect in", delay, "ms")

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) connect()
        }, delay)
      }
    } catch (error) {
      console.error("[v0] Failed to create WebSocket:", error)
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
  ])

  const disconnect = useCallback(() => {
    console.log("[v0] Disconnecting WebSocket...")
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
    retryCountRef.current = 0
    setStatus("offline")
    setConnectionStatus(false, null)
  }, [setConnectionStatus])

  const forceReconnect = useCallback(() => {
    addLog("WS", "FORCE RECONNECT initiated...")
    console.log("[v0] Force reconnect requested")
    retryCountRef.current = 0
    disconnect()
    setTimeout(() => {
      if (isMountedRef.current) connect()
    }, 100)
  }, [connect, disconnect, addLog])

  useEffect(() => {
    if (typeof window === "undefined") return

    isMountedRef.current = true
    console.log("[v0] Hook mounted, starting connection...")
    connect()

    return () => {
      console.log("[v0] Hook unmounting, cleaning up...")
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
