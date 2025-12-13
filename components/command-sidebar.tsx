"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Shield,
  Zap,
  Trash2,
  Copy,
  Eye,
  GraduationCap,
  Scissors,
  Flame,
  Settings,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { usePumpStore } from "@/lib/store"

interface CommandSidebarProps {
  onReconnect?: () => void
}

export function CommandSidebar({ onReconnect }: CommandSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const {
    botConfigs,
    toggleBot,
    logs,
    clearLogs,
    updateBotConfig,
    manualSettings,
    updateManualSettings,
    isConnected,
    error,
  } = usePumpStore()

  const botList = [
    { key: "godMode" as const, icon: Zap, label: "GOD MODE", color: "purple" },
    { key: "liquiditySniper" as const, icon: Crosshair, label: "LIQUIDITY SNIPER", color: "green" },
    { key: "copyTrader" as const, icon: Copy, label: "COPY TRADER", color: "blue" },
    { key: "rugShield" as const, icon: Shield, label: "RUG SHIELD", color: "red" },
    { key: "mempoolWatcher" as const, icon: Eye, label: "MEMPOOL WATCHER", color: "yellow" },
    { key: "graduationBot" as const, icon: GraduationCap, label: "GRADUATION BOT", color: "cyan" },
    { key: "scalpBot" as const, icon: Scissors, label: "SCALP BOT", color: "orange" },
  ]

  const colorClasses = {
    purple: {
      active: "bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
      hover: "hover:border-purple-500/30",
    },
    green: {
      active: "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]",
      hover: "hover:border-green-500/30",
    },
    blue: {
      active: "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
      hover: "hover:border-blue-500/30",
    },
    red: {
      active: "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
      hover: "hover:border-red-500/30",
    },
    yellow: {
      active: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]",
      hover: "hover:border-yellow-500/30",
    },
    cyan: {
      active: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
      hover: "hover:border-cyan-500/30",
    },
    orange: {
      active: "bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]",
      hover: "hover:border-orange-500/30",
    },
  }

  const getLogColor = (type: string) => {
    if (type.includes("BUY") || type.includes("SNIPER")) return "text-green-400"
    if (type.includes("SELL")) return "text-red-400"
    if (type.includes("SCAN") || type.includes("WATCH")) return "text-blue-400"
    if (type.includes("ERROR")) return "text-red-500"
    if (type.includes("GOD")) return "text-purple-400"
    if (type.includes("COPY")) return "text-blue-400"
    if (type.includes("RUG") || type.includes("SHIELD")) return "text-red-400"
    if (type.includes("WHALE")) return "text-yellow-400"
    if (type.includes("GRAD")) return "text-cyan-400"
    if (type.includes("SCALP")) return "text-orange-400"
    if (type.includes("WS")) return "text-cyan-400" // Added for websocket messages
    return "text-muted-foreground"
  }

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-[#0a0d14] transition-all duration-300 ${
        isCollapsed ? "w-14" : "w-[400px]"
      }`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border border-border bg-background"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {isCollapsed ? (
        <div className="flex flex-col items-center gap-3 pt-16">
          <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          {botList.map((bot) => (
            <bot.icon
              key={bot.key}
              className={`h-5 w-5 ${botConfigs[bot.key].enabled ? `text-${bot.color}-400` : "text-muted-foreground"}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                <h2 className="font-mono text-sm font-bold text-primary">COMMAND_CENTER</h2>
              </div>
              {/* Connection Status Indicator */}
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/20 border border-green-500/50">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <Wifi className="h-3 w-3 text-green-400" />
                    <span className="font-mono text-[10px] text-green-400">LIVE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 border border-red-500/50">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <WifiOff className="h-3 w-3 text-red-400" />
                    <span className="font-mono text-[10px] text-red-400">{error || "OFFLINE"}</span>
                    {onReconnect && (
                      <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={onReconnect}>
                        <RefreshCw className="h-3 w-3 text-red-400 hover:text-red-300" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Tabs defaultValue="bots" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-2 bg-secondary grid grid-cols-3">
              <TabsTrigger value="bots" className="font-mono text-xs">
                BOTS
              </TabsTrigger>
              <TabsTrigger value="manual" className="font-mono text-xs">
                MANUAL
              </TabsTrigger>
              <TabsTrigger value="logs" className="font-mono text-xs">
                LOGS
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: BOTS - All 7 Bot Controls */}
            <TabsContent value="bots" className="flex-1 m-0 p-0 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="p-4 space-y-3">
                  {botList.map((bot) => {
                    const isEnabled = botConfigs[bot.key].enabled
                    const colors = colorClasses[bot.color]
                    return (
                      <div
                        key={bot.key}
                        className={`rounded-lg border transition-all ${
                          isEnabled ? `${colors.active}` : "border-border bg-secondary/30"
                        }`}
                      >
                        {/* Bot Header with Toggle */}
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <bot.icon className={`h-4 w-4 ${isEnabled ? "" : "text-muted-foreground"}`} />
                            <span className="font-mono text-xs font-bold">{bot.label}</span>
                          </div>
                          <Switch checked={isEnabled} onCheckedChange={() => toggleBot(bot.key)} />
                        </div>

                        {/* Bot-specific inputs (always visible) */}
                        <div className="px-3 pb-3 space-y-2 text-xs">
                          {bot.key === "godMode" && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Min Velocity (Tx/s)</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={botConfigs.godMode.minVelocity}
                                  onChange={(e) => updateBotConfig("godMode", { minVelocity: Number(e.target.value) })}
                                  className="mt-1 h-7 font-mono text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Min Volume (SOL)</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={botConfigs.godMode.minVolume}
                                  onChange={(e) => updateBotConfig("godMode", { minVolume: Number(e.target.value) })}
                                  className="mt-1 h-7 font-mono text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {bot.key === "liquiditySniper" && (
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Block Delay</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={3}
                                  value={botConfigs.liquiditySniper.blockDelay}
                                  onChange={(e) =>
                                    updateBotConfig("liquiditySniper", { blockDelay: Number(e.target.value) })
                                  }
                                  className="mt-1 h-7 font-mono text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Tip (SOL)</Label>
                                <Input
                                  type="number"
                                  step={0.001}
                                  value={botConfigs.liquiditySniper.tipSol}
                                  onChange={(e) =>
                                    updateBotConfig("liquiditySniper", { tipSol: Number(e.target.value) })
                                  }
                                  className="mt-1 h-7 font-mono text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Snipe Amt</Label>
                                <Input
                                  type="number"
                                  step={0.1}
                                  value={botConfigs.liquiditySniper.snipeAmount}
                                  onChange={(e) =>
                                    updateBotConfig("liquiditySniper", { snipeAmount: Number(e.target.value) })
                                  }
                                  className="mt-1 h-7 font-mono text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {bot.key === "copyTrader" && (
                            <>
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Target Wallet</Label>
                                <Input
                                  placeholder="Wallet address..."
                                  value={botConfigs.copyTrader.targetWallet}
                                  onChange={(e) => updateBotConfig("copyTrader", { targetWallet: e.target.value })}
                                  className="mt-1 h-7 font-mono text-[10px]"
                                />
                              </div>
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Copy %</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={200}
                                  value={botConfigs.copyTrader.copyPercent}
                                  onChange={(e) =>
                                    updateBotConfig("copyTrader", { copyPercent: Number(e.target.value) })
                                  }
                                  className="mt-1 h-7 font-mono text-xs"
                                />
                              </div>
                            </>
                          )}

                          {bot.key === "rugShield" && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Time Limit (min)</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={30}
                                  value={botConfigs.rugShield.timeLimit}
                                  onChange={(e) => updateBotConfig("rugShield", { timeLimit: Number(e.target.value) })}
                                  className="mt-1 h-7 font-mono text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Min Holders</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={botConfigs.rugShield.minHolders}
                                  onChange={(e) => updateBotConfig("rugShield", { minHolders: Number(e.target.value) })}
                                  className="mt-1 h-7 font-mono text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {bot.key === "mempoolWatcher" && (
                            <div>
                              <Label className="text-muted-foreground text-[10px]">Whale Threshold (SOL)</Label>
                              <Input
                                type="number"
                                min={10}
                                max={500}
                                value={botConfigs.mempoolWatcher.whaleThreshold}
                                onChange={(e) =>
                                  updateBotConfig("mempoolWatcher", { whaleThreshold: Number(e.target.value) })
                                }
                                className="mt-1 h-7 font-mono text-xs"
                              />
                            </div>
                          )}

                          {bot.key === "graduationBot" && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Entry Progress (%)</Label>
                                <Input
                                  type="number"
                                  min={50}
                                  max={99}
                                  value={botConfigs.graduationBot.entryProgress}
                                  onChange={(e) =>
                                    updateBotConfig("graduationBot", { entryProgress: Number(e.target.value) })
                                  }
                                  className="mt-1 h-7 font-mono text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Exit Progress (%)</Label>
                                <Input
                                  type="number"
                                  min={90}
                                  max={100}
                                  value={botConfigs.graduationBot.exitProgress}
                                  onChange={(e) =>
                                    updateBotConfig("graduationBot", { exitProgress: Number(e.target.value) })
                                  }
                                  className="mt-1 h-7 font-mono text-xs"
                                />
                              </div>
                            </div>
                          )}

                          {bot.key === "scalpBot" && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Take Profit (%)</Label>
                                <Input
                                  type="number"
                                  min={5}
                                  max={100}
                                  value={botConfigs.scalpBot.takeProfit}
                                  onChange={(e) => updateBotConfig("scalpBot", { takeProfit: Number(e.target.value) })}
                                  className="mt-1 h-7 font-mono text-xs"
                                />
                              </div>
                              <div>
                                <Label className="text-muted-foreground text-[10px]">Stop Loss (%)</Label>
                                <Input
                                  type="number"
                                  min={2}
                                  max={50}
                                  value={botConfigs.scalpBot.stopLoss}
                                  onChange={(e) => updateBotConfig("scalpBot", { stopLoss: Number(e.target.value) })}
                                  className="mt-1 h-7 font-mono text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* TAB 2: MANUAL - Quick Buy, Slippage, Priority Fee */}
            <TabsContent value="manual" className="flex-1 m-0 p-0 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="p-4 space-y-6">
                  {/* Quick Buy Amounts */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-primary" />
                      <Label className="font-mono text-sm font-bold text-primary">QUICK BUY AMOUNTS</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx}>
                          <Label className="text-muted-foreground text-[10px]">Preset {idx + 1}</Label>
                          <Input
                            type="number"
                            step={0.1}
                            min={0.01}
                            value={manualSettings.quickBuyPresets[idx] ?? 0.1}
                            onChange={(e) => {
                              const newPresets = [...manualSettings.quickBuyPresets]
                              newPresets[idx] = Number(e.target.value)
                              updateManualSettings({ quickBuyPresets: newPresets })
                            }}
                            className="mt-1 h-7 font-mono text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Global Slippage */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-mono text-sm font-bold text-primary">GLOBAL SLIPPAGE</Label>
                      <span className="text-xs text-muted-foreground">{manualSettings.globalSlippage}%</span>
                    </div>
                    <Slider
                      min={0.1}
                      max={10}
                      step={0.1}
                      value={[manualSettings.globalSlippage ?? 1]}
                      onValueChange={(val) => updateManualSettings({ globalSlippage: val[0] })}
                      className="mt-2"
                    />
                  </div>

                  {/* Priority Fee */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-mono text-sm font-bold text-primary">PRIORITY FEE</Label>
                      <span className="text-xs text-muted-foreground">{manualSettings.priorityFee.toFixed(5)} SOL</span>
                    </div>
                    <Slider
                      min={0.0001}
                      max={0.1}
                      step={0.0001}
                      value={[manualSettings.priorityFee ?? 0.005]}
                      onValueChange={(val) => updateManualSettings({ priorityFee: val[0] })}
                      className="mt-2"
                    />
                  </div>

                  {/* Info Panel - Removed as it seems to be an artifact from previous code and not in updates */}
                  {/* <div className="rounded-lg bg-secondary/50 p-3 space-y-2 border border-border">
                    <h4 className="font-mono text-xs font-bold text-muted-foreground">TRADING INFO</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Quick buy presets appear on token cards for 1-click purchases. Slippage protects against price
                      movement. Higher priority fees increase transaction speed on Solana.
                    </p>
                  </div> */}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* TAB 3: LOGS - Terminal Output */}
            <TabsContent value="logs" className="flex-1 m-0 p-0 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="font-mono text-xs text-muted-foreground">{logs.length} entries</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearLogs}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
              <ScrollArea className="flex-1 h-[calc(100vh-220px)]">
                <div className="p-2 font-mono text-[11px] space-y-0.5">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Waiting for activity...</p>
                  ) : (
                    logs
                      .slice()
                      .reverse()
                      .map((log) => (
                        <div key={log.id} className="flex gap-2 py-0.5 hover:bg-secondary/30 px-1 rounded">
                          <span className="text-muted-foreground shrink-0">[{log.time}]</span>
                          <span className={`shrink-0 ${getLogColor(log.type)}`}>{log.type}:</span>
                          <span className="text-foreground/90 break-all">{log.message}</span>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </aside>
  )
}
