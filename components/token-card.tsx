"use client"

import { useState, useEffect } from "react"
import { TrendingUp, ExternalLink, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { usePumpStore } from "@/lib/store"
import type { EnrichedToken } from "@/lib/types"

interface TokenCardProps {
  token: EnrichedToken
  isSniping?: boolean
  onBuyClick?: (token: EnrichedToken) => void
}

export function TokenCard({ token, isSniping, onBuyClick }: TokenCardProps) {
  const [timeAgo, setTimeAgo] = useState("")
  const { simulateBuy, isLiveMode } = usePumpStore()

  useEffect(() => {
    const updateTime = () => {
      const seconds = Math.floor((Date.now() - token.createdAt) / 1000)
      if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`)
      } else if (seconds < 3600) {
        setTimeAgo(`${Math.floor(seconds / 60)}m ago`)
      } else {
        setTimeAgo(`${Math.floor(seconds / 3600)}h ago`)
      }
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [token.createdAt])

  const formatMarketCap = (cap: number) => {
    if (cap >= 1000000) return `$${(cap / 1000000).toFixed(2)}M`
    if (cap >= 1000) return `$${(cap / 1000).toFixed(2)}K`
    return `$${cap.toFixed(2)}`
  }

  const handleSnipe = () => {
    if (onBuyClick) {
      onBuyClick(token)
    } else if (!isLiveMode) {
      simulateBuy(token, 0.5, "MANUAL")
    }
  }

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:border-primary/50 ${
        isSniping ? "animate-shake border-primary animate-pulse-glow" : ""
      }`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-secondary">
              {token.metadata?.image ? (
                <img
                  src={token.metadata.image || "/placeholder.svg"}
                  alt={token.symbol}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted-foreground">
                  {token.symbol?.slice(0, 2) || "??"}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-primary">${token.symbol || "UNKNOWN"}</span>
                <a
                  href={`https://pump.fun/${token.mint}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="max-w-[120px] truncate text-xs text-muted-foreground">{token.name || "Unknown Token"}</p>
            </div>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            <Clock className="mr-1 h-3 w-3" />
            {timeAgo}
          </Badge>
        </div>

        {/* Stats */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-secondary/50 p-2">
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="font-mono text-sm font-bold text-foreground">{formatMarketCap(token.marketCapUsd)}</p>
          </div>
          <div className="rounded-md bg-secondary/50 p-2">
            <p className="text-xs text-muted-foreground">SOL</p>
            <p className="font-mono text-sm font-bold text-primary">{token.marketCapSol?.toFixed(4) || "0.0000"}</p>
          </div>
        </div>

        {/* Bonding Curve Progress */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Bonding Curve</span>
            <span className="font-mono text-primary">{token.bondingCurveProgress?.toFixed(1) || "0.0"}%</span>
          </div>
          <Progress value={token.bondingCurveProgress || 0} className="h-1.5 bg-secondary" />
        </div>

        {/* Snipe Button */}
        <Button onClick={handleSnipe} className="w-full font-mono text-xs" size="sm">
          SNIPE [0.5 SOL]
          <TrendingUp className="ml-2 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
