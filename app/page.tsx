"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { LiveTokenGrid } from "@/components/live-token-grid"
import { PortfolioDock } from "@/components/portfolio-dock"
import { BuyModal } from "@/components/buy-modal"
import { useStablePumpSocket } from "@/hooks/use-stable-pump-socket"
import { ConnectionDebugger } from "@/components/connection-debugger"
import { useBotBrain } from "@/hooks/use-bot-brain"
import { usePumpStore } from "@/lib/store"
import { Zap, Activity, ToggleLeft, ToggleRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { EnrichedToken } from "@/lib/types"
import { GodModeSidebar } from "@/components/god-mode-sidebar"
import { SetupGuide } from "@/components/setup-guide"

export default function Home() {
  const { forceReconnect } = useStablePumpSocket()
  useBotBrain()

  const { connected } = useWallet()
  const { tokens, isConnected, isLiveMode, toggleLiveMode, simBalance, simulateBuy } = usePumpStore()

  const [selectedToken, setSelectedToken] = useState<EnrichedToken | null>(null)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)

  const handleBuyClick = useCallback((token: EnrichedToken) => {
    setSelectedToken(token)
    setIsBuyModalOpen(true)
  }, [])

  const handleBuy = useCallback(
    (amount: number) => {
      if (!selectedToken) return
      if (!isLiveMode) {
        simulateBuy(selectedToken, amount, "MANUAL")
        setIsBuyModalOpen(false)
      } else {
        alert("Live trading requires wallet transaction signing")
      }
    },
    [selectedToken, isLiveMode, simulateBuy],
  )

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header with Wallet Button */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-mono text-lg font-bold text-primary">
                GOD<span className="text-purple-400"> MODE</span>
              </span>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"} className="font-mono text-xs">
              <Activity className={`mr-1 h-3 w-3 ${isConnected ? "animate-pulse" : ""}`} />
              {isConnected ? "LIVE FEED" : "OFFLINE"}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Setup Guide Button */}
            <SetupGuide />

            {/* Sim/Live Mode Toggle */}
            <button
              onClick={toggleLiveMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                isLiveMode
                  ? "bg-red-500/20 text-red-400 border-red-500/50"
                  : "bg-green-500/20 text-green-400 border-green-500/50"
              }`}
            >
              {isLiveMode ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {isLiveMode ? "⚠️ LIVE TRADING" : "🧪 SIMULATOR"}
            </button>

            {/* Balance Display */}
            <div className="font-mono text-sm">
              <span className="text-muted-foreground">BAL: </span>
              <span className="text-primary font-bold">
                {isLiveMode ? (connected ? "..." : "N/A") : `${simBalance.toFixed(2)} SOL`}
              </span>
            </div>

            {/* Wallet Button */}
            <WalletMultiButton className="!bg-primary !text-primary-foreground !font-mono !text-xs !h-9 !px-4 !rounded-lg" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <GodModeSidebar onReconnect={forceReconnect} />

        <main className="flex-1 overflow-auto p-4 pb-52">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-mono text-xl font-bold text-foreground">Live Token Feed</h1>
            <span className="font-mono text-sm text-muted-foreground">{tokens.length} tokens streaming</span>
          </div>
          <LiveTokenGrid onBuyClick={handleBuyClick} />
        </main>
      </div>

      <PortfolioDock />

      <ConnectionDebugger onForceReconnect={forceReconnect} />

      <BuyModal
        token={selectedToken}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onBuy={handleBuy}
      />
    </div>
  )
}
