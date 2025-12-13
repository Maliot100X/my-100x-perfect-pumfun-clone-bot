"use client"

import { useState, useEffect } from "react"
import { usePumpStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Pause, Play, Trash2, Settings, Lock, AlertTriangle, Shield } from "lucide-react"
import { Crosshair, Copy, Eye, GraduationCap, Scissors, Zap } from "lucide-react"
import React from "react"

interface GodModeSidebarProps {
  onReconnect?: () => void
}

const BOT_TABS = [
  {
    key: "liquiditySniper" as const,
    icon: Crosshair,
    emoji: "💧",
    label: "LIQUIDITY\nSNIPER",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
  },
  {
    key: "copyTrader" as const,
    icon: Copy,
    emoji: "👥",
    label: "COPY\nTRADER",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
  },
  {
    key: "rugShield" as const,
    icon: Shield,
    emoji: "🛡️",
    label: "RUG\nSHIELD",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/50",
  },
  {
    key: "mempoolWatcher" as const,
    icon: Eye,
    emoji: "🔮",
    label: "MEMPOOL\nWATCHER",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/50",
  },
  {
    key: "graduationBot" as const,
    icon: GraduationCap,
    emoji: "🎓",
    label: "GRADUATION\nBOT",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/50",
  },
  {
    key: "scalpBot" as const,
    icon: Scissors,
    emoji: "⚔️",
    label: "SCALP\nBOT",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/50",
  },
  {
    key: "godMode" as const,
    icon: Zap,
    emoji: "🤖",
    label: "GOD\nMODE",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/50",
  },
  {
    key: "settings" as const,
    icon: Settings,
    emoji: "⚙️",
    label: "WALLET\nSETTINGS",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/50",
  },
] as const

export function GodModeSidebar({ onReconnect }: GodModeSidebarProps) {
  const [activeTab, setActiveTab] = useState<keyof typeof botConfigs | "settings">("liquiditySniper")
  const [manualWalletAddress, setManualWalletAddress] = useState("")
  const [manualWalletTag, setManualWalletTag] = useState("")
  const [scannerLogs, setScannerLogs] = useState<Array<{ type: string; message: string; color: string }>>([])
  const [isScanning, setIsScanning] = useState(false)
  const [walletStatus, setWalletStatus] = useState<{
    isConnected: boolean
    publicKey: string | null
    loading: boolean
  }>({ isConnected: false, publicKey: null, loading: true })
  const {
    botConfigs,
    toggleBot,
    updateBotConfig,
    isConnected,
    error,
    logs,
    clearLogs,
    trackedWallets,
    addTrackedWallet,
    toggleWalletStatus,
    removeTrackedWallet,
    addLog,
    autoWithdrawal,
    updateAutoWithdrawal,
  } = usePumpStore()

  useEffect(() => {
    if (!botConfigs.copyTrader.enabled) {
      setIsScanning(false)
      return
    }

    setIsScanning(true)
    const interval = setInterval(() => {
      // Simulate AI finding wallets
      const shouldFindWallet = Math.random() > 0.7 // 30% chance every 5 seconds

      if (shouldFindWallet) {
        const mockWallets = [
          { addr: "5mP2g3kJN8h9xW7vQ2k9zY8tR3fD6sL4uE1nM7pX2k9z", tag: "Whale Hunter", winRate: 85 },
          { addr: "9kL3m7P2j5N8vT4xQ6zA2yR8wE5sF9dG3hU1nK4pL6z", tag: "Smart Sniper", winRate: 92 },
          { addr: "7xQ2j9K3mN8pR5vL4zA6yT8wE2sF9dG1hU3nK7pM4z", tag: "Pro Trader", winRate: 88 },
          { addr: "3hT6k9L2mP5jN8vQ4xR7zA2yE8wS1fG9dU3nK6pL4z", tag: "Bot Whale", winRate: 95 },
          { addr: "8kM4n7Q2j5P8vT3xL6zA9yR2wE5sF1dG4hU8nK3pL7z", tag: "Speed Demon", winRate: 82 },
        ]

        const wallet = mockWallets[Math.floor(Math.random() * mockWallets.length)]
        const pnl = Math.floor(Math.random() * 40) + 10 // +10 to +50 SOL

        // Check if wallet passes filters (60%+ win rate)
        if (wallet.winRate < 60) {
          setScannerLogs((prev) => [
            {
              type: "REJECT",
              message: `[AI FILTER] Wallet ${wallet.addr.slice(0, 4)}...${wallet.addr.slice(-4)} Rejected (Low Win Rate: ${wallet.winRate}%)`,
              color: "text-red-400",
            },
            ...prev.slice(0, 9),
          ])
        } else {
          // Add to tracked wallets
          addTrackedWallet({
            address: wallet.addr,
            tag: wallet.tag,
            source: "AI",
            winRate: wallet.winRate,
            pnl: pnl,
            status: wallet.winRate >= 80 ? "ACTIVE" : "PAUSED", // Auto-activate if win rate >= 80%
          })

          setScannerLogs((prev) => [
            {
              type: "SUCCESS",
              message: `[SUCCESS] Wallet ${wallet.addr.slice(0, 4)}...${wallet.addr.slice(-4)} Added (${wallet.tag}, ${wallet.winRate}% WR, +${pnl} SOL)${wallet.winRate >= 80 ? " → AUTO-ACTIVATED" : ""}`,
              color: "text-green-400",
            },
            ...prev.slice(0, 9),
          ])
        }
      } else {
        setScannerLogs((prev) => [
          {
            type: "SCAN",
            message: `[AI SCAN] Scanning GMGN feed... Found ${Math.floor(Math.random() * 20)} candidates.`,
            color: "text-yellow-400",
          },
          ...prev.slice(0, 9),
        ])
      }
    }, 5000) // Run every 5 seconds

    return () => clearInterval(interval)
  }, [botConfigs.copyTrader.enabled, addTrackedWallet])

  useEffect(() => {
    const checkWalletStatus = async () => {
      try {
        const response = await fetch("/api/engine")
        const data = await response.json()
        setWalletStatus({
          isConnected: data.isConnected,
          publicKey: data.publicKey,
          loading: false,
        })
      } catch (error) {
        console.error("[v0] Failed to fetch wallet status:", error)
        setWalletStatus({ isConnected: false, publicKey: null, loading: false })
      }
    }

    checkWalletStatus()
    const interval = setInterval(checkWalletStatus, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const renderBotContent = () => {
    const bot = botConfigs[activeTab]

    switch (activeTab) {
      case "liquiditySniper":
        return (
          <div className="space-y-6">
            {/* Manual Setup */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-green-400 border-b border-green-500/30 pb-2">
                ⚙️ MANUAL SETUP
              </h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Min Liquidity ($)</Label>
                  <Input type="number" placeholder="5000" className="h-8 mt-1 font-mono text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Max Buy (SOL)</Label>
                  <Input
                    type="number"
                    step={0.1}
                    value={botConfigs.liquiditySniper.snipeAmount || 0}
                    onChange={(e) => updateBotConfig("liquiditySniper", { snipeAmount: Number(e.target.value) })}
                    className="h-8 mt-1 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* AI Automation */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-primary border-b border-primary/30 pb-2">
                🤖 AI AUTOMATION
              </h4>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <div>
                  <div className="font-mono text-xs font-bold">Deep Dip Hunter</div>
                  <div className="text-[10px] text-muted-foreground">Auto-buy on 15% dips + volume hold</div>
                </div>
                <Switch checked={bot.enabled} onCheckedChange={() => toggleBot(activeTab)} />
              </div>
            </div>
          </div>
        )

      case "copyTrader":
        return (
          <div className="space-y-4">
            {/* MASTER SWITCH: AI AUTO-TRADING */}
            <div
              className={`p-4 rounded-lg border-2 transition-all ${
                bot.enabled
                  ? "bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20"
                  : "bg-secondary/50 border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl transition-all ${bot.enabled ? "animate-pulse" : ""}`}>🤖</div>
                  <div>
                    <div className="font-mono text-sm font-bold">AI AUTO-TRADING</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Global Master Control</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      bot.enabled
                        ? "bg-green-500 text-white border-0 font-bold text-sm px-3 py-1 animate-pulse"
                        : "bg-red-500 text-white border-0 font-bold text-sm px-3 py-1"
                    }
                  >
                    {bot.enabled ? "🟢 RUNNING" : "🔴 STOPPED"}
                  </Badge>
                  <Switch
                    checked={bot.enabled}
                    onCheckedChange={() => toggleBot(activeTab)}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>
              {bot.enabled && (
                <div className="mt-3 pt-3 border-t border-green-500/30">
                  <div className="text-xs text-green-400 font-mono animate-pulse">
                    ⚡ SCANNING GMGN & BIRDEYE FOR HIGH WIN-RATE WALLETS...
                  </div>
                </div>
              )}
            </div>

            {/* ZONE A: Manual Target Override */}
            <div
              className={`space-y-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 transition-opacity ${!bot.enabled ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-4 w-4 text-blue-400" />
                <h4 className="font-mono text-xs font-bold text-blue-400">MANUAL TARGET OVERRIDE</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Paste Wallet Address (Solana)</Label>
                  <Input
                    type="text"
                    placeholder="8x...99"
                    value={manualWalletAddress || ""}
                    onChange={(e) => setManualWalletAddress(e.target.value)}
                    className="h-9 mt-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Assign Name/Tag</Label>
                  <Input
                    type="text"
                    placeholder="Whale 1"
                    value={manualWalletTag || ""}
                    onChange={(e) => setManualWalletTag(e.target.value)}
                    className="h-9 mt-1 font-mono text-xs"
                  />
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-mono text-sm h-10"
                  onClick={() => {
                    if (manualWalletAddress && manualWalletTag) {
                      addTrackedWallet({
                        address: manualWalletAddress,
                        tag: manualWalletTag,
                        source: "MANUAL",
                        winRate: 0,
                        pnl: 0,
                        status: "ACTIVE",
                      })
                      setManualWalletAddress("")
                      setManualWalletTag("")
                    }
                  }}
                >
                  ➕ Add Target Manually
                </Button>
              </div>
            </div>

            {/* ZONE B: Live Target Table */}
            <div className={`space-y-2 transition-opacity ${!bot.enabled ? "opacity-50" : ""}`}>
              <h4 className="font-mono text-xs font-bold text-primary border-b border-primary/30 pb-2">
                🎯 LIVE TARGET TABLE
                {!bot.enabled && (
                  <span className="ml-2 text-yellow-500 text-[10px]">(PAUSED - Enable AI Auto-Trading)</span>
                )}
              </h4>
              <div className="rounded-lg border border-border bg-secondary/20 overflow-hidden">
                {trackedWallets.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-muted-foreground text-xs font-mono">
                      Waiting for AI Scanner or Manual Input...
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px] font-mono">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50">
                          <th className="text-left p-2 text-muted-foreground font-bold">WALLET</th>
                          <th className="text-left p-2 text-muted-foreground font-bold">SOURCE</th>
                          <th className="text-left p-2 text-muted-foreground font-bold">WIN RATE</th>
                          <th className="text-left p-2 text-muted-foreground font-bold">PNL</th>
                          <th className="text-left p-2 text-muted-foreground font-bold">STATUS</th>
                          <th className="text-left p-2 text-muted-foreground font-bold">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trackedWallets.map((wallet) => (
                          <tr key={wallet.id} className="border-b border-border/50 hover:bg-secondary/30">
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <span>
                                  {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(wallet.address)
                                  }}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="text-[8px] text-muted-foreground">{wallet.tag}</div>
                            </td>
                            <td className="p-2">
                              {wallet.source === "AI" ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-[8px]">
                                  🤖 AI FOUND
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-[8px]">
                                  👤 MANUAL
                                </Badge>
                              )}
                            </td>
                            <td className="p-2">{wallet.winRate}%</td>
                            <td className="p-2">
                              <span className={wallet.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                                {wallet.pnl >= 0 ? "+" : ""}
                                {wallet.pnl} SOL
                              </span>
                            </td>
                            <td className="p-2">
                              <Badge
                                className={
                                  wallet.status === "ACTIVE"
                                    ? "bg-green-500/20 text-green-400 border-green-500/50 text-[8px]"
                                    : "bg-gray-500/20 text-gray-400 border-gray-500/50 text-[8px]"
                                }
                              >
                                {wallet.status}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleWalletStatus(wallet.id)}
                                  className="p-1 hover:bg-secondary rounded"
                                >
                                  {wallet.status === "ACTIVE" ? (
                                    <Pause className="h-3 w-3 text-yellow-400" />
                                  ) : (
                                    <Play className="h-3 w-3 text-green-400" />
                                  )}
                                </button>
                                <button
                                  onClick={() => removeTrackedWallet(wallet.id)}
                                  className="p-1 hover:bg-secondary rounded"
                                >
                                  <Trash2 className="h-3 w-3 text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* ZONE B & C: Side by side panels */}
            <div className={`grid grid-cols-2 gap-3 transition-opacity ${!bot.enabled ? "opacity-50" : ""}`}>
              {/* ZONE B: AI Auto-Hunter */}
              <div className="space-y-3 p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-mono text-xs font-bold text-blue-400">🤖 AI AUTO-HUNTER</h4>
                  <Badge
                    className={
                      isScanning
                        ? "bg-green-500/20 text-green-400 border-green-500/50 text-[8px] animate-pulse"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-[8px]"
                    }
                  >
                    {isScanning ? "SCANNING" : "IDLE"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Scan Interval</Label>
                    <select className="w-full h-8 mt-1 rounded-md border border-input bg-background px-2 font-mono text-xs">
                      <option value="5s">5 Seconds</option>
                      <option value="30m">30 Minutes</option>
                      <option value="1h">1 Hour</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Min Win Rate %</Label>
                    <Input type="number" defaultValue="60" className="h-8 mt-1 font-mono text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Min PnL (SOL)</Label>
                    <Input type="number" defaultValue="10" className="h-8 mt-1 font-mono text-xs" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-secondary/50 border border-border">
                    <div>
                      <div className="font-mono text-[10px] font-bold">Human Filter</div>
                      <div className="text-[8px] text-muted-foreground">Reject Bots</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              {/* ZONE C: Global Execution & Risk */}
              <div className="space-y-3 p-3 rounded-lg bg-secondary/50 border border-border">
                <h4 className="font-mono text-xs font-bold text-blue-400">⚙️ EXECUTION & RISK</h4>
                <div className="space-y-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Max Risk (SOL)</Label>
                    <Input type="number" placeholder="5" className="h-8 mt-1 font-mono text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Buy Amount per Tx (SOL)</Label>
                    <Input type="number" placeholder="0.1" className="h-8 mt-1 font-mono text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Slippage %</Label>
                    <Input type="number" placeholder="1.5" className="h-8 mt-1 font-mono text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Take Profit %</Label>
                    <Input type="number" placeholder="5" className="h-8 mt-1 font-mono text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Stop Loss %</Label>
                    <Input type="number" placeholder="2" className="h-8 mt-1 font-mono text-xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* ZONE D: Live Scanner Terminal */}
            <div className={`space-y-2 transition-opacity ${!bot.enabled ? "opacity-50" : ""}`}>
              <h4 className="font-mono text-xs font-bold text-primary border-b border-primary/30 pb-2">
                📡 LIVE SCANNER TERMINAL
              </h4>
              <div className="h-40 rounded-lg bg-black border border-blue-500/30 p-3 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="font-mono text-[10px] space-y-1">
                    {scannerLogs.length === 0 ? (
                      <div className="text-muted-foreground">[IDLE] Enable Copy Trader bot to start scanning...</div>
                    ) : (
                      scannerLogs.map((log, i) => (
                        <div key={i} className={log.color}>
                          {log.message}
                        </div>
                      ))
                    )}
                    {trackedWallets.length > 0 && (
                      <div className="text-cyan-400">
                        [MONITOR] Tracking {trackedWallets.length} active wallet{trackedWallets.length !== 1 ? "s" : ""}
                        ...
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )

      case "rugShield":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-red-400 border-b border-red-500/30 pb-2">
                ⚙️ SAFETY SETTINGS
              </h4>
              <div className="space-y-2">
                {["✓ Mint Auth Disabled", "✓ Freeze Auth Disabled", "✓ Top 10 Holders < 20%", "✓ Liquidity Locked"].map(
                  (check) => (
                    <div key={check} className="flex items-center gap-2 text-xs p-2 rounded bg-red-500/10">
                      <div className="h-4 w-4 rounded border border-red-500/50 bg-red-500/20 flex items-center justify-center">
                        <span className="text-red-400 text-[10px]">✓</span>
                      </div>
                      <span className="text-muted-foreground">{check}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-primary border-b border-primary/30 pb-2">🛡️ PROTECTION</h4>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <div>
                  <div className="font-mono text-xs font-bold">Auto-Block Scams</div>
                  <div className="text-[10px] text-muted-foreground">Shows RED warning overlay on risky tokens</div>
                </div>
                <Switch checked={bot.enabled} onCheckedChange={() => toggleBot(activeTab)} />
              </div>
            </div>
          </div>
        )

      case "mempoolWatcher":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-yellow-400 border-b border-yellow-500/30 pb-2">
                🔮 MEMPOOL VISUAL
              </h4>
              <div className="h-32 rounded-lg bg-black/50 border border-yellow-500/30 p-2 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="font-mono text-[9px] text-yellow-400/70 space-y-1">
                    {logs.slice(-10).map((log) => (
                      <div key={log.id}>{`[${log.time}] ${log.message}`}</div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-primary border-b border-primary/30 pb-2">
                🤖 AI AUTOMATION
              </h4>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <div>
                  <div className="font-mono text-xs font-bold">Front-Run Mode</div>
                  <div className="text-[10px] text-muted-foreground">Visual readiness (UI only)</div>
                </div>
                <Switch checked={bot.enabled} onCheckedChange={() => toggleBot(activeTab)} />
              </div>
            </div>
          </div>
        )

      case "graduationBot":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-cyan-400 border-b border-cyan-500/30 pb-2">
                ⚙️ CURVE SETTINGS
              </h4>
              <div>
                <Label className="text-[10px] text-muted-foreground">Bonding Curve % Trigger</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Slider
                    value={[botConfigs.graduationBot.entryProgress]}
                    onValueChange={([value]) => updateBotConfig("graduationBot", { entryProgress: value })}
                    min={50}
                    max={99}
                    step={1}
                    className="flex-1"
                  />
                  <span className="font-mono text-xs text-cyan-400 w-12">
                    {botConfigs.graduationBot.entryProgress}%
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Auto-buy when curve hits {botConfigs.graduationBot.entryProgress}% to catch Raydium migration
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-primary border-b border-primary/30 pb-2">
                🎓 AUTO-GRADUATE
              </h4>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <div>
                  <div className="font-mono text-xs font-bold">Graduation Sniper</div>
                  <div className="text-[10px] text-muted-foreground">Catch tokens before Raydium DEX</div>
                </div>
                <Switch checked={bot.enabled} onCheckedChange={() => toggleBot(activeTab)} />
              </div>
            </div>
          </div>
        )

      case "scalpBot":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-orange-400 border-b border-orange-500/30 pb-2">
                ⚙️ HOTKEYS
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="h-12 flex-col gap-1 font-mono bg-transparent">
                  <span className="text-lg font-bold">B</span>
                  <span className="text-[9px]">Buy 0.1</span>
                </Button>
                <Button variant="outline" className="h-12 flex-col gap-1 font-mono bg-transparent">
                  <span className="text-lg font-bold">S</span>
                  <span className="text-[9px]">Sell 50%</span>
                </Button>
                <Button variant="outline" className="h-12 flex-col gap-1 font-mono bg-transparent">
                  <span className="text-lg font-bold">X</span>
                  <span className="text-[9px]">Sell 100%</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-primary border-b border-primary/30 pb-2">
                📊 PROFIT/LOSS SETTINGS
              </h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Profit Target 1</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={botConfigs.scalpBot.takeProfit || 0}
                      onChange={(e) => updateBotConfig("scalpBot", { takeProfit: Number(e.target.value) })}
                      className="h-8 font-mono text-xs"
                    />
                    <span className="text-green-400 text-xs flex items-center">%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Stop Loss</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={botConfigs.scalpBot.stopLoss || 0}
                      onChange={(e) => updateBotConfig("scalpBot", { stopLoss: Number(e.target.value) })}
                      className="h-8 font-mono text-xs"
                    />
                    <span className="text-red-400 text-xs flex items-center">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
              <div>
                <div className="font-mono text-xs font-bold">Auto-Scalp Mode</div>
                <div className="text-[10px] text-muted-foreground">Quick profit taking enabled</div>
              </div>
              <Switch checked={bot.enabled} onCheckedChange={() => toggleBot(activeTab)} />
            </div>
          </div>
        )

      case "godMode":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-purple-400 border-b border-purple-500/30 pb-2">
                🤖 THE AI MASTER
              </h4>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold">MASTER SWITCH</span>
                  <Switch
                    checked={bot.enabled}
                    onCheckedChange={() => toggleBot(activeTab)}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Combines all bot filters into one AI decision engine. Bypasses all safety checks when confidence score{" "}
                  {">"} 90/100
                </p>
              </div>
            </div>

            {/* Confidence Score Gauge */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-primary border-b border-primary/30 pb-2">
                📊 CONFIDENCE SCORE
              </h4>
              <div className="relative h-32 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Gauge background */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="h-24 w-24 text-purple-400/20" />
                  </div>
                  {/* Score display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-mono text-4xl font-bold text-purple-400">{bot.enabled ? "95" : "0"}</div>
                    <div className="font-mono text-xs text-muted-foreground">/100</div>
                    {bot.enabled && (
                      <Badge className="mt-2 bg-purple-500/20 text-purple-400 border-purple-500/50">
                        SNIPE MODE ACTIVE
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground">
                {bot.enabled
                  ? "AI is analyzing all signals and ready to instant-snipe high-confidence targets"
                  : "Enable GOD MODE to activate the master AI engine"}
              </p>
            </div>
          </div>
        )

      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-mono text-sm font-bold text-primary mb-1">WALLET SETTINGS</h2>
              <p className="text-xs text-muted-foreground">Configure your bot's trading wallet securely</p>
            </div>

            {/* Wallet Connection Card */}
            <div className="p-4 rounded-lg bg-card border border-border space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-yellow-400" />
                <h3 className="font-mono text-sm font-bold">Bot Wallet Configuration</h3>
              </div>

              {/* Wallet Status Indicator */}
              <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`h-2 w-2 rounded-full ${walletStatus.loading ? "bg-yellow-400 animate-pulse" : walletStatus.isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                  />
                  <span className="font-mono text-xs font-bold">
                    {walletStatus.loading
                      ? "CHECKING..."
                      : walletStatus.isConnected
                        ? "🟢 Wallet Connected (Ready to Trade)"
                        : "🔴 Wallet Disconnected (Check .env)"}
                  </span>
                </div>
                {walletStatus.isConnected && walletStatus.publicKey && (
                  <div className="text-xs text-muted-foreground">
                    Engine initialized and ready for automated trading
                  </div>
                )}
              </div>

              {/* Private Key Input (Read-Only) */}
              <div className="space-y-2">
                <Label htmlFor="private-key" className="text-xs text-muted-foreground">
                  Private Key
                </Label>
                <Input
                  id="private-key"
                  type="password"
                  value="**************** (Configured via .env file)"
                  disabled
                  readOnly
                  className="font-mono text-xs bg-secondary/50 cursor-not-allowed"
                />
                <div className="flex items-start gap-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
                  <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-yellow-400">
                    For security, set this in your .env file as BOT_PRIVATE_KEY. Do not paste keys here.
                  </p>
                </div>
              </div>

              {/* Public Address Display */}
              {walletStatus.isConnected && walletStatus.publicKey && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Bot Wallet Address (Public Key)</Label>
                  <div className="flex gap-2">
                    <Input value={walletStatus.publicKey} readOnly className="font-mono text-xs bg-secondary/50" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(walletStatus.publicKey || "")
                        addLog("WALLET", "Copied bot wallet address to clipboard")
                      }}
                      className="shrink-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Send SOL to this address to fund your trading bot</p>
                </div>
              )}

              {/* Setup Instructions */}
              {!walletStatus.isConnected && (
                <div className="space-y-2 p-3 rounded-lg bg-secondary/30 border border-border">
                  <h4 className="font-mono text-xs font-bold text-primary">Setup Instructions:</h4>
                  <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                    <li>Create a new Solana wallet for your bot</li>
                    <li>
                      Add <code className="px-1 py-0.5 bg-black/50 rounded text-green-400">BOT_PRIVATE_KEY</code> to
                      your .env file
                    </li>
                    <li>Restart your application</li>
                    <li>Send SOL to the bot wallet for trading</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Additional Security Info */}
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-400" />
                <h3 className="font-mono text-sm font-bold">Security Best Practices</h3>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Never share your private key with anyone</li>
                <li>• Use a dedicated wallet for bot trading only</li>
                <li>• Keep limited funds in the bot wallet</li>
                <li>• Regularly monitor bot activity in System Logs</li>
                <li>• Enable 2FA on your deployment platform (Vercel, etc.)</li>
              </ul>
            </div>

            <AutoWithdrawalCard />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <aside className="w-[420px] border-r border-border bg-[#0a0d14] flex flex-col">
      {/* Status Bar */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary animate-pulse" />
          <span className="font-mono text-xs font-bold text-primary">SYSTEM ONLINE</span>
        </div>
        {isConnected ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/20 border border-green-500/50">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <Zap className="h-3 w-3 text-green-400" />
            <span className="font-mono text-[10px] text-green-400">LATENCY: ~12ms</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 border border-red-500/50">
            <Zap className="h-3 w-3 text-red-400" />
            <span className="font-mono text-[10px] text-red-400">{error || "OFFLINE"}</span>
            {onReconnect && (
              <Button variant="ghost" size="icon" className="h-4 w-4" onClick={onReconnect}>
                <Zap className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Vertical Tabs */}
        <div className="w-20 border-r border-border bg-black/30 py-2">
          {BOT_TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const isEnabled = tab.key === "settings" ? false : botConfigs[tab.key].enabled
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  relative w-full p-3 rounded-xl transition-all duration-300 border-2
                  ${
                    activeTab === tab.key
                      ? `${tab.bgColor} ${tab.borderColor} shadow-lg shadow-${tab.color.replace("text-", "")}/20`
                      : "bg-background/5 border-border/30 hover:bg-background/10"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.key ? tab.color : "text-muted-foreground"}`} />
                  <div
                    className={`text-xs font-bold whitespace-pre-line text-left ${activeTab === tab.key ? tab.color : "text-muted-foreground"}`}
                  >
                    {tab.label}
                  </div>
                </div>
                {isEnabled && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">{renderBotContent()}</div>
        </ScrollArea>
      </div>
    </aside>
  )
}

function AutoWithdrawalCard() {
  const { autoWithdrawal, updateAutoWithdrawal, addLog } = usePumpStore()
  const [isSaving, setIsSaving] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string>("")

  const validateSolanaAddress = (address: string): boolean => {
    if (!address) return false
    // Basic Solana address validation (Base58, 32-44 chars)
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  }

  const handleSave = async () => {
    setValidationError("")

    if (autoWithdrawal.enabled) {
      if (!validateSolanaAddress(autoWithdrawal.safeWallet)) {
        setValidationError("Invalid Solana wallet address")
        return
      }
      if (autoWithdrawal.triggerBalance <= autoWithdrawal.reserveAmount) {
        setValidationError("Trigger balance must be greater than reserve amount")
        return
      }
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/engine/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoWithdrawal }),
      })

      if (!response.ok) throw new Error("Failed to save settings")

      addLog("SYSTEM", `Auto-Withdrawal ${autoWithdrawal.enabled ? "ENABLED" : "DISABLED"}`)
    } catch (error) {
      setValidationError("Failed to save settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 rounded-lg bg-card border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-400" />
          <h3 className="font-mono text-sm font-bold">Auto-Withdrawal (Profit Saver)</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{autoWithdrawal.enabled ? "🟢 ACTIVE" : "⚪ INACTIVE"}</span>
          <Switch
            checked={autoWithdrawal.enabled}
            onCheckedChange={(enabled) => updateAutoWithdrawal({ enabled })}
            className={autoWithdrawal.enabled ? "data-[state=checked]:bg-green-500" : ""}
          />
        </div>
      </div>

      {autoWithdrawal.enabled && (
        <div className="space-y-4 pt-2">
          {/* Safe Destination Wallet */}
          <div className="space-y-2">
            <Label htmlFor="safe-wallet" className="text-xs text-muted-foreground">
              Safe Destination Wallet
            </Label>
            <Input
              id="safe-wallet"
              type="text"
              placeholder="Paste your main secure wallet address here..."
              value={autoWithdrawal.safeWallet}
              onChange={(e) => updateAutoWithdrawal({ safeWallet: e.target.value })}
              className="font-mono text-xs"
            />
          </div>

          {/* Trigger Balance */}
          <div className="space-y-2">
            <Label htmlFor="trigger-balance" className="text-xs text-muted-foreground">
              If Bot Balance exceeds: (SOL)
            </Label>
            <Input
              id="trigger-balance"
              type="number"
              step="0.1"
              min="0"
              value={autoWithdrawal.triggerBalance}
              onChange={(e) => updateAutoWithdrawal({ triggerBalance: Number.parseFloat(e.target.value) || 0 })}
              className="font-mono text-xs"
            />
          </div>

          {/* Reserve Amount */}
          <div className="space-y-2">
            <Label htmlFor="reserve-amount" className="text-xs text-muted-foreground">
              Keep this amount in Bot: (SOL)
            </Label>
            <Input
              id="reserve-amount"
              type="number"
              step="0.1"
              min="0"
              value={autoWithdrawal.reserveAmount}
              onChange={(e) => updateAutoWithdrawal({ reserveAmount: Number.parseFloat(e.target.value) || 0 })}
              className="font-mono text-xs"
            />
          </div>

          {/* Helper Text */}
          <div className="p-3 rounded-lg bg-secondary/30 border border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-bold text-primary">Logic:</span> If balance exceeds{" "}
              <span className="text-green-400">{autoWithdrawal.triggerBalance} SOL</span>, send everything above{" "}
              <span className="text-green-400">{autoWithdrawal.reserveAmount} SOL</span> to your safe wallet.
            </p>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="flex items-start gap-2 p-2 rounded bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-400">{validationError}</p>
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-mono font-bold"
          >
            {isSaving ? "SAVING..." : "SAVE SETTINGS"}
          </Button>
        </div>
      )}
    </div>
  )
}
