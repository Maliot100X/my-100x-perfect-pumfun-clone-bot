"use client"

import { useEffect, useCallback, useRef } from "react"
import { usePumpStore } from "@/lib/store"
import type { TokenData, EnrichedToken, TokenMetadata, TradeData } from "@/lib/types"

const WEBSOCKET_URL = "wss://pumpportal.fun/api/data"
const SOL_PRICE_USD = 175

export function usePumpPortalWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subscribedTokensRef = useRef<Set<string>>(new Set())

  const {
    addToken,
    setConnectionStatus,
    updatePositionPrice,
    openPositions,
    addLog,
    setLatestTrade,
    addTradeToVelocity,
    addToVolume,
  } = usePumpStore()

  const subscribeToTokenTrade = useCallback((mint: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && !subscribedTokensRef.current.has(mint)) {
      wsRef.current.send(JSON.stringify({ method: "subscribeTokenTrade", keys: [mint] }))
      subscribedTokensRef.current.add(mint)
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
        // Metadata fetch failed
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
      topHolderPercent: Math.random() * 20, // Simulated
    }
  }, [])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(WEBSOCKET_URL)

      ws.onopen = () => {
        setConnectionStatus(true, null)
        addLog("WS", "Connected to PumpPortal")
        ws.send(JSON.stringify({ method: "subscribeNewToken" }))

        subscribedTokensRef.current.clear()
        openPositions.forEach((p) => subscribeToTokenTrade(p.token.mint))
      }

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data)

          // New token creation
          if (data.txType === "create" || (data.mint && !data.txType)) {
            const enrichedToken = await enrichToken(data as TokenData)
            addToken(enrichedToken)
          }

          // Trade events - for Copy Trader and God Mode signals
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
        } catch (e) {
          console.error("WebSocket parse error:", e)
        }
      }

      ws.onerror = () => {
        setConnectionStatus(false, "Connection error")
        addLog("WS", "Connection error")
      }

      ws.onclose = () => {
        setConnectionStatus(false, null)
        addLog("WS", "Disconnected, reconnecting...")
        reconnectTimeoutRef.current = setTimeout(connect, 3000)
      }

      wsRef.current = ws
    } catch (e) {
      setConnectionStatus(false, "Failed to connect")
      console.error(e)
    }
  }, [
    enrichToken,
    addToken,
    setConnectionStatus,
    updatePositionPrice,
    openPositions,
    addLog,
    subscribeToTokenTrade,
    setLatestTrade,
    addTradeToVelocity,
    addToVolume,
  ])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setConnectionStatus(false, null)
  }, [setConnectionStatus])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  useEffect(() => {
    openPositions.forEach((p) => subscribeToTokenTrade(p.token.mint))
  }, [openPositions, subscribeToTokenTrade])

  return { subscribeToTokenTrade, reconnect: connect }
}
