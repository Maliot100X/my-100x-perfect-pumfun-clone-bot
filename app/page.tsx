"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { LiveTokenGrid } from "@/components/live-token-grid"
import { PortfolioDock } from "@/components/portfolio-dock"
import { BuyModal } from "@/components/buy-modal"
import { useStablePumpSocket } from "@/hooks/use-stable-pump-socket"
import { GodModeSidebar } from "@/components/god-mode-sidebar"
import { SetupGuide } from "@/components/setup-guide"
import { Badge } from "@/components/ui/badge"
import type { EnrichedToken } from "@/lib/types"
import { Zap, Activity, ToggleLeft, ToggleRight } from "lucide-react"
import { useBotBrain } from "@/hooks/use-bot-brain" // Import useBotBrain
import { usePumpStore } from "@/lib/store"

export default function Home() {
  const { forceReconnect } = useStablePumpSocket()
  useBotBrain()

  const { connected } = useWallet()
  const {
    tokens,
    isConnected,
    isLiveMode,
    toggleLiveMode,
    simBalance,
    simulateBuy,
    openPositions,
    logs,
    wsStatus,
    latency,
    packetsReceived,
  } = usePumpStore()

  const [selectedToken, setSelectedToken] = useState<EnrichedToken | null>(null)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [mainTab, setMainTab] = useState<"feed" | "logs" | "wallet">("feed")

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

  const handlePanicSell = () => {
    if (
      confirm(`This will sell ALL ${openPositions.length} positions. Are you sure you want to panic sell everything?`)
    ) {
      openPositions.forEach((position) => {
        usePumpStore.getState().sellPosition(position.id, 100, "PANIC SELL")
      })
    }
  }

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
          {/* Main tab navigation */}
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-2">
            <button
              onClick={() => setMainTab("feed")}
              className={`px-4 py-2 rounded-t-lg font-mono text-xs font-bold transition-all ${
                mainTab === "feed"
                  ? "bg-primary/20 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              🔥 Live Token Feed
            </button>
            <button
              onClick={() => setMainTab("logs")}
              className={`px-4 py-2 rounded-t-lg font-mono text-xs font-bold transition-all ${
                mainTab === "logs"
                  ? "bg-primary/20 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              📜 System Logs
            </button>
            <button
              onClick={() => setMainTab("wallet")}
              className={`px-4 py-2 rounded-t-lg font-mono text-xs font-bold transition-all ${
                mainTab === "wallet"
                  ? "bg-primary/20 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              💼 My Wallet
            </button>

            <div className="ml-auto flex items-center gap-3 px-4 py-1.5 rounded-full bg-secondary/50 border border-border font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span className={isConnected ? "text-green-400" : "text-red-400"}>
                  {isConnected ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              {isConnected && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">📦</span>
                    <span className="text-primary font-bold">{packetsReceived.toLocaleString()}</span>
                  </div>
                  <span className="text-muted-foreground">|</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">📶</span>
                    <span className="text-green-400 font-bold">{latency}ms</span>
                  </div>
                </>
              )}
              {!isConnected && (
                <button
                  onClick={forceReconnect}
                  className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] hover:bg-red-500/30"
                >
                  RECONNECT
                </button>
              )}
            </div>
          </div>

          {mainTab === "feed" && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h1 className="font-mono text-xl font-bold text-foreground">Live Token Feed</h1>
                <span className="font-mono text-sm text-muted-foreground">{tokens.length} tokens streaming</span>
              </div>
              <LiveTokenGrid onBuyClick={handleBuyClick} />
            </>
          )}

          {mainTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="font-mono text-xl font-bold text-foreground">Master System Logs</h1>
                <button
                  onClick={() => usePumpStore.getState().clearLogs()}
                  className="font-mono text-xs text-muted-foreground hover:text-primary"
                >
                  Clear Logs
                </button>
              </div>
              <div className="h-[calc(100vh-250px)] rounded-lg bg-black border border-green-500/30 p-4 overflow-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">No logs yet. System is idle.</div>
                ) : (
                  <div className="space-y-1">
                    {logs
                      .slice()
                      .reverse()
                      .map((log) => (
                        <div key={log.id} className="flex gap-3">
                          <span className="text-green-500">[{log.time}]</span>
                          <span className="text-cyan-400">[{log.type}]</span>
                          <span className="text-gray-300">{log.message}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {mainTab === "wallet" && (
            <div className="space-y-4">
              <h1 className="font-mono text-xl font-bold text-foreground">My Wallet</h1>

              {/* SOL Balance */}
              <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/30">
                <div className="text-xs text-muted-foreground mb-2">Total Balance</div>
                <div className="font-mono text-4xl font-bold text-green-400">
                  {isLiveMode ? (connected ? "..." : "0.00") : simBalance.toFixed(4)} SOL
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  ≈ ${isLiveMode ? (connected ? "..." : "0") : (simBalance * 175).toFixed(2)} USD
                </div>
              </div>

              {/* Active Positions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-mono text-sm font-bold">Active Positions ({openPositions.length})</h2>
                  {openPositions.length > 0 && (
                    <button
                      onClick={handlePanicSell}
                      className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded font-mono text-xs hover:bg-red-500/30"
                    >
                      🚨 Panic Sell All
                    </button>
                  )}
                </div>

                {openPositions.length === 0 ? (
                  <div className="p-8 rounded-lg bg-secondary/50 border border-border text-center text-muted-foreground text-xs">
                    No active positions. Start trading to see your holdings here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {openPositions.map((position) => (
                      <div
                        key={position.id}
                        className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-mono text-sm font-bold">{position.token.symbol}</div>
                            <div className="text-xs text-muted-foreground">{position.token.name}</div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-mono text-lg font-bold ${position.pnlPercent >= 0 ? "text-green-400" : "text-red-400"}`}
                            >
                              {position.pnlPercent >= 0 ? "+" : ""}
                              {position.pnlPercent.toFixed(1)}%
                            </div>
                            <div className={`text-xs ${position.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {position.pnl >= 0 ? "+" : ""}
                              {position.pnl.toFixed(4)} SOL
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Entry</div>
                            <div className="font-mono">{position.entryPrice.toFixed(6)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Current</div>
                            <div className="font-mono">{position.currentPrice.toFixed(6)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Amount</div>
                            <div className="font-mono">{position.amount.toFixed(0)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Refresh Balance Button */}
              {isLiveMode && connected && (
                <button className="w-full py-3 rounded-lg bg-primary/20 text-primary border border-primary/50 font-mono text-sm hover:bg-primary/30">
                  🔄 Refresh Balance
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      <PortfolioDock />

      <BuyModal
        token={selectedToken}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onBuy={handleBuy}
      />
    </div>
  )
}
