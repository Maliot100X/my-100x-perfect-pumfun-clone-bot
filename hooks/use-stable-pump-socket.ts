"use client"

import { useEffect, useCallback, useRef } from "react"
import { usePumpStore } from "@/lib/store"
import type { TokenData, EnrichedToken, TokenMetadata, TradeData } from "@/lib/types"

const WEBSOCKET_URL = "wss://pumpportal.fun/api/data"
const SOL_PRICE_USD = 175
const RECONNECT_DELAY = 3000 // 3 seconds

type ConnectionState = "connecting" | "connected" | "error"

export function useStablePumpSocket() {
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subscribedTokensRef = useRef<Set<string>>(new Set())
  const isIntentionalDisconnect = useRef(false)
  const connectionStartRef = useRef<number>(0)

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
      console.log("[v0] Subscribed to trades for:", mint.slice(0, 8))
    }
  }, [])

  const enrichToken = useCallback(async (token: TokenData): Promise<EnrichedToken> => {
    const marketCapUsd = token.marketCapSol * SOL_PRICE_USD
    const totalSupply = 1_000_000_000
    const tokensSold = totalSupply - token.vTokensInBondingCurve
    const bondingCurveProgress = (tokensSold / totalSupply) * 100

    let metadata: TokenMetadata | undefined
    if (token.uri) {
      try {
        const res = await fetch(token.uri)
        if (res.ok) metadata = await res.json()
      } catch {
        // Metadata fetch failed silently
      }
    }

    return {
      ...token,
      metadata,
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
    if (typeof window === "undefined") {
      console.log("[v0] SSR detected, skipping WebSocket connection")
      return
    }

    // Prevent duplicate connections
    const currentSocket = socketRef.current
    if (currentSocket?.readyState === WebSocket.OPEN || currentSocket?.readyState === WebSocket.CONNECTING) {
      console.log("[v0] Already connected or connecting, skipping...")
      return
    }

    isIntentionalDisconnect.current = false

    try {
      console.log("[v0] Attempting WebSocket connection to:", WEBSOCKET_URL)
      setConnectionStatus(false, "connecting")
      addLog("WS", "Establishing secure uplink...")

      connectionStartRef.current = Date.now()
      const ws = new WebSocket(WEBSOCKET_URL)

      ws.onopen = () => {
        const latency = Date.now() - connectionStartRef.current
        console.log("[v0] WebSocket CONNECTED! Latency:", latency, "ms")
        setLatency(latency)

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }

        setConnectionStatus(true, null)
        addLog("WS", `SYSTEM ONLINE | Latency: ${latency}ms`)

        // Subscribe to new tokens immediately
        ws.send(JSON.stringify({ method: "subscribeNewToken" }))
        console.log("[v0] Subscribed to new token events")

        // Re-subscribe to all position tokens
        subscribedTokensRef.current.clear()
        openPositions.forEach((p) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: "subscribeTokenTrade", keys: [p.token.mint] }))
            subscribedTokensRef.current.add(p.token.mint)
          }
        })
      }

      ws.onmessage = async (event) => {
        incrementPackets()

        try {
          const data = JSON.parse(event.data)

          // New token creation
          if (data.txType === "create" || (data.mint && !data.txType)) {
            console.log("[v0] New token received:", data.symbol || data.mint?.slice(0, 8))
            const enrichedToken = await enrichToken(data as TokenData)
            addToken(enrichedToken)
          }

          // Trade events
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
          // Parse error - ignore malformed messages
        }
      }

      ws.onerror = (error) => {
        console.log("[v0] WebSocket ERROR:", error)
        setConnectionStatus(false, "error")
        addLog("WS", "Connection error occurred")
      }

      ws.onclose = (event) => {
        console.log("[v0] WebSocket CLOSED. Code:", event.code, "Reason:", event.reason)
        socketRef.current = null

        if (!isIntentionalDisconnect.current) {
          console.log(`[v0] Unintentional disconnect - Retrying in ${RECONNECT_DELAY / 1000}s...`)
          setConnectionStatus(false, "error")
          addLog("WS", `CONNECTION LOST. Retrying in ${RECONNECT_DELAY / 1000}s...`)

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("[v0] Reconnection attempt starting...")
            connect()
          }, RECONNECT_DELAY)
        } else {
          setConnectionStatus(false, null)
        }
      }

      socketRef.current = ws
    } catch (e) {
      console.log("[v0] Failed to create WebSocket:", e)
      setConnectionStatus(false, "error")
      addLog("WS", "Failed to establish connection")

      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, RECONNECT_DELAY)
    }
  }, [
    enrichToken,
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
  ])

  const disconnect = useCallback(() => {
    console.log("[v0] Intentional disconnect initiated")
    isIntentionalDisconnect.current = true

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }

    subscribedTokensRef.current.clear()
    setConnectionStatus(false, null)
  }, [setConnectionStatus])

  const forceReconnect = useCallback(() => {
    console.log("[v0] FORCE RECONNECT triggered by user")
    addLog("WS", "FORCE RECONNECT initiated...")
    disconnect()
    setTimeout(() => {
      isIntentionalDisconnect.current = false
      connect()
    }, 100)
  }, [connect, disconnect, addLog])

  useEffect(() => {
    // Double-check SSR guard inside useEffect
    if (typeof window === "undefined") return

    console.log("[v0] useEffect mount - initiating connection")
    connect()

    return () => {
      console.log("[v0] useEffect cleanup - disconnecting")
      disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to new position tokens
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
