"use client"

import { TokenCard } from "./token-card"
import { Loader2 } from "lucide-react"
import { usePumpStore } from "@/lib/store"
import type { EnrichedToken } from "@/lib/types"

interface LiveTokenGridProps {
  onBuyClick?: (token: EnrichedToken) => void
}

export function LiveTokenGrid({ onBuyClick }: LiveTokenGridProps) {
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

  if (tokens.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-primary">LIVE</span>
        </div>
        <p className="text-muted-foreground">Waiting for new token creations...</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Tokens appear here in real-time as they are created on Solana
        </p>
      </div>
    )
  }

  const isAnyBotActive =
    botConfigs.godMode.enabled ||
    botConfigs.liquiditySniper.enabled ||
    botConfigs.copyTrader.enabled ||
    botConfigs.mempoolWatcher.enabled ||
    botConfigs.graduationBot.enabled

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tokens.map((token) => (
        <div key={token.mint} className="animate-fade-in-down">
          <TokenCard token={token} isSniping={isAnyBotActive} onBuyClick={onBuyClick} />
        </div>
      ))}
    </div>
  )
}
