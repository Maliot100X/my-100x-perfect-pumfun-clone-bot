"use client"

import { useState, useCallback, useEffect } from "react"
import { LiveTokenGrid } from "@/components/live-token-grid"
import { PortfolioDock } from "@/components/portfolio-dock"
import { BuyModal } from "@/components/buy-modal"
import { useStablePumpSocket } from "@/hooks/use-stable-pump-socket"
import { GodModeSidebar } from "@/components/god-mode-sidebar"
import { KillerMode } from "@/components/killer-mode"
import { Badge } from "@/components/ui/badge"
import type { EnrichedToken } from "@/lib/types"
import { Skull, Activity } from "lucide-react"
import { useBotBrain } from "@/hooks/use-bot-brain"
import { usePumpStore } from "@/lib/store"
import { WalletButton } from "@/components/wallet-button"
import { usePhantomWallet } from "@/hooks/usePhantomWallet"
import { NetworkSelector } from "@/components/network-selector"
import { AutomationControls } from "@/components/automation-controls"
import { useBackendAPI } from "@/hooks/use-backend-api"

export default function Home() {
  const { forceReconnect } = useStablePumpSocket()
  const { connected: walletConnected, balance: walletBalance } = usePhantomWallet()
  const { status: backendStatus } = useBackendAPI()

  const {
    tokens,
    isConnected,
    isLiveMode,
    toggleLiveMode,
    simBalance,
    simulateBuy,
    openPositions,
    logs,
    latency,
    packetsReceived,
  } = usePumpStore()
  useBotBrain()

  const [selectedToken, setSelectedToken] = useState<EnrichedToken | null>(null)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [mainTab, setMainTab] = useState<"dashboard" | "logs" | "killer">("dashboard")

  useEffect(() => {
    usePumpStore.setState({ walletConnected })
  }, [walletConnected])

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
        if (!walletConnected) {
          alert("Please connect your Phantom wallet first")
          return
        }
        alert("Live trading requires wallet transaction signing - Integration ready!")
      }
    },
    [selectedToken, isLiveMode, simulateBuy, walletConnected],
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
      <header className="sticky top-0 z-50 border-b border-red-500/30 bg-black backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Skull className="h-8 w-8 text-red-500 animate-pulse" />
            <span className="font-mono text-2xl font-bold">
              <span className="text-red-500">PumpKing</span>
              <span className="text-purple-400"> Killer</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NetworkSelector />

            {backendStatus && (
              <Badge variant={backendStatus.network === "MAINNET" ? "destructive" : "secondary"} className="font-mono">
                {backendStatus.network === "MAINNET" && "LIVE MAINNET"}
                {backendStatus.network === "TESTNET" && "TESTNET"}
                {backendStatus.network === "DEVNET" && "DEVNET"}
              </Badge>
            )}

            <div className="font-mono text-lg">
              <span className="text-gray-400">Balance: </span>
              <span className="text-green-400 font-bold">
                {isLiveMode ? (walletConnected ? `${walletBalance.toFixed(4)}` : "0.00") : `${simBalance.toFixed(2)}`}{" "}
                SOL
              </span>
            </div>

            <WalletButton />
          </div>
        </div>

        <div className="border-t border-red-500/30 bg-black/50 px-6 py-3">
          <AutomationControls />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <GodModeSidebar onReconnect={forceReconnect} />

        <main className="flex-1 overflow-auto p-6 pb-52">
          <div className="mb-6 flex items-center gap-3 border-b border-red-500/30 pb-3">
            <button
              onClick={() => setMainTab("dashboard")}
              className={`px-6 py-3 rounded-t-lg font-mono text-sm font-bold transition-all ${
                mainTab === "dashboard"
                  ? "bg-purple-600/20 text-purple-400 border-b-2 border-purple-500"
                  : "text-gray-400 hover:bg-gray-800/50"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setMainTab("logs")}
              className={`px-6 py-3 rounded-t-lg font-mono text-sm font-bold transition-all ${
                mainTab === "logs"
                  ? "bg-purple-600/20 text-purple-400 border-b-2 border-purple-500"
                  : "text-gray-400 hover:bg-gray-800/50"
              }`}
            >
              System Logs
            </button>
            <button
              onClick={() => setMainTab("killer")}
              className={`px-6 py-3 rounded-t-lg font-mono text-sm font-bold transition-all flex items-center gap-2 ${
                mainTab === "killer"
                  ? "bg-red-500/20 text-red-400 border-b-2 border-red-500 animate-pulse"
                  : "text-red-400/60 hover:bg-red-500/10 animate-pulse"
              }`}
            >
              <Skull className="h-4 w-4" />
              KILLER MODE
            </button>

            <div className="ml-auto flex items-center gap-3 px-4 py-2 rounded-full bg-black border border-green-500/30 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    backendStatus?.rpcOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span className={backendStatus?.rpcOnline ? "text-green-400" : "text-red-400"}>
                  {backendStatus?.rpcOnline ? "RPC ONLINE" : "OFFLINE"}
                </span>
              </div>
              {backendStatus?.rpcOnline && (
                <>
                  <span className="text-gray-600">|</span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Packets:</span>
                    <span className="text-green-400 font-bold">{packetsReceived.toLocaleString()}</span>
                  </div>
                  <span className="text-gray-600">|</span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Latency:</span>
                    <span className="text-green-400 font-bold">{backendStatus?.latency || latency}ms</span>
                  </div>
                </>
              )}
              {!backendStatus?.rpcOnline && (
                <button
                  onClick={forceReconnect}
                  className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 rounded text-[10px] hover:bg-red-500/30 border border-red-500/50"
                >
                  RECONNECT
                </button>
              )}
            </div>
          </div>

          {mainTab === "dashboard" && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h1 className="font-mono text-2xl font-bold text-purple-400">Live Token Feed</h1>
                <Badge variant="default" className="font-mono">
                  <Activity className={`mr-1 h-3 w-3 ${isConnected ? "animate-pulse" : ""}`} />
                  {tokens.length} tokens streaming
                </Badge>
              </div>
              <LiveTokenGrid onBuyClick={handleBuyClick} />
            </>
          )}

          {mainTab === "logs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="font-mono text-2xl font-bold text-purple-400">Master System Logs</h1>
                <button
                  onClick={() => usePumpStore.getState().clearLogs()}
                  className="font-mono text-xs text-gray-400 hover:text-purple-400 px-3 py-1 border border-gray-700 rounded hover:border-purple-500/50"
                >
                  Clear Logs
                </button>
              </div>
              <div className="h-[calc(100vh-250px)] rounded-lg bg-black border border-green-500/30 p-4 overflow-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No logs yet. System is idle.</div>
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

          {mainTab === "killer" && (
            <div>
              <div className="mb-6 flex items-center gap-4">
                <Skull className="h-10 w-10 text-red-400 animate-pulse" />
                <div>
                  <h1 className="font-mono text-3xl font-bold text-red-400">KILLER MODE COCKPIT</h1>
                  <p className="text-sm text-gray-400 font-mono">Extreme Risk - Block-0 Sniper Terminal</p>
                </div>
                <Badge variant="destructive" className="font-mono text-xs animate-pulse">
                  DANGEROUS ZONE
                </Badge>
              </div>
              <KillerMode />
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
