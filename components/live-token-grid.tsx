"use client"

import { useState } from "react"
import { TokenCard } from "./token-card"
import { Loader2 } from "lucide-react"
import { usePumpStore } from "@/lib/store"
import type { EnrichedToken } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface LiveTokenGridProps {
  onBuyClick?: (token: EnrichedToken) => void
}

export function LiveTokenGrid({ onBuyClick }: LiveTokenGridProps) {
  const [activeTab, setActiveTab] = useState<"new" | "graduating" | "graduated">("new")
  const { tokens, isConnected, error, botConfigs } = usePumpStore()

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <p className="font-mono text-destructive">{error}</p>
        <p className="mt-2 text-sm text-muted-foreground">Attempting to reconnect...</p>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 font-mono text-muted-foreground">Connecting to PumpPortal...</p>
      </div>
    )
  }

  const newTokens = tokens.filter((t) => t.bondingCurveProgress < 75)
  const graduatingTokens = tokens.filter(
    (t) => t.bondingCurveProgress >= 75 && t.bondingCurveProgress < 100 && t.vSolInBondingCurve >= 30,
  )
  const graduatedTokens = tokens.filter((t) => t.bondingCurveProgress >= 100)

  const TABS = [
    { key: "new" as const, label: "🆕 New Creation", count: newTokens.length },
    { key: "graduating" as const, label: "🎓 Graduating (30+ SOL)", count: graduatingTokens.length },
    { key: "graduated" as const, label: "👑 Graduated (Pump.fun)", count: graduatedTokens.length },
  ]

  const currentTokens =
    activeTab === "new" ? newTokens : activeTab === "graduating" ? graduatingTokens : graduatedTokens

  const isAnyBotActive =
    botConfigs.godMode.enabled ||
    botConfigs.liquiditySniper.enabled ||
    botConfigs.copyTrader.enabled ||
    botConfigs.mempoolWatcher.enabled ||
    botConfigs.graduationBot.enabled

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t-lg font-mono text-xs font-bold transition-all ${
              activeTab === tab.key
                ? "bg-primary/20 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            {tab.label}{" "}
            <Badge variant="secondary" className="ml-2 text-[10px]">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {currentTokens.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="font-mono text-primary">LIVE</span>
          </div>
          <p className="text-muted-foreground">
            {activeTab === "new" && "Waiting for new token creations..."}
            {activeTab === "graduating" && "No tokens near graduation yet..."}
            {activeTab === "graduated" && "No graduated tokens yet..."}
          </p>
        </div>
      ) : activeTab === "new" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentTokens.map((token) => (
            <div key={token.mint} className="animate-fade-in-down">
              <TokenCard token={token} isSniping={isAnyBotActive} onBuyClick={onBuyClick} />
            </div>
          ))}
        </div>
      ) : activeTab === "graduating" ? (
        <div className="space-y-2">
          {currentTokens.map((token) => (
            <div
              key={token.mint}
              className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => onBuyClick?.(token)}
            >
              <div className="flex-1">
                <div className="font-mono font-bold text-sm">{token.symbol}</div>
                <div className="text-xs text-muted-foreground">{token.name}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Progress value={token.bondingCurveProgress} className="flex-1 h-2" />
                  <span className="font-mono text-xs text-cyan-400 min-w-[40px]">
                    {token.bondingCurveProgress.toFixed(0)}%
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {token.vSolInBondingCurve.toFixed(1)} SOL in bonding curve
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-green-400">${token.volume24h.toFixed(0)}</div>
                <div className="text-[10px] text-muted-foreground">Vol (5m)</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {currentTokens.map((token) => (
            <div
              key={token.mint}
              className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-green-500/10 border border-yellow-500/50 hover:border-yellow-500 transition-all cursor-pointer"
              onClick={() => onBuyClick?.(token)}
            >
              <div className="flex-1">
                <div className="font-mono font-bold text-sm text-yellow-400">{token.symbol}</div>
                <div className="text-xs text-muted-foreground">{token.name}</div>
                <div className="text-[8px] text-green-400 mt-1">✓ PUMP.FUN GRADUATED</div>
              </div>
              <div className="text-center">
                <div className="font-mono text-sm text-green-400">${(token.marketCapSol * 1000).toFixed(0)}</div>
                <div className="text-[10px] text-muted-foreground">Bonding Curve Complete</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-yellow-400">${token.marketCapUsd.toFixed(0)}</div>
                <div className="text-[10px] text-muted-foreground">MCap</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
