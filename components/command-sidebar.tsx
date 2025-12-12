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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { usePumpStore } from "@/lib/store"

export function CommandSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { botConfigs, toggleBot, logs, clearLogs, updateBotConfig } = usePumpStore()

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

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-[#0a0d14] transition-all duration-300 ${
        isCollapsed ? "w-14" : "w-[350px]"
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
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <h2 className="font-mono text-sm font-bold text-primary">AUTO_TRADER_V2</h2>
            </div>
          </div>

          <Tabs defaultValue="bots" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-2 bg-secondary">
              <TabsTrigger value="bots" className="flex-1 font-mono text-xs">
                BOTS
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex-1 font-mono text-xs">
                LOGS
              </TabsTrigger>
            </TabsList>

            {/* BOTS TAB - All 7 Bot Controls */}
            <TabsContent value="bots" className="flex-1 m-0 p-0 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-180px)]">
                <div className="p-4 space-y-4">
                  {botList.map((bot) => {
                    const isEnabled = botConfigs[bot.key].enabled
                    const colors = colorClasses[bot.color]
                    return (
                      <div key={bot.key} className="space-y-2">
                        <button
                          onClick={() => toggleBot(bot.key)}
                          className={`w-full h-10 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                            isEnabled
                              ? colors.active
                              : `bg-secondary text-muted-foreground border-border ${colors.hover}`
                          }`}
                        >
                          <bot.icon className="h-4 w-4" />
                          {bot.label} {isEnabled ? "ON" : "OFF"}
                        </button>

                        {/* Bot-specific controls */}
                        {isEnabled && (
                          <div className="p-3 rounded-lg bg-secondary/50 space-y-3 text-xs">
                            {bot.key === "godMode" && (
                              <div>
                                <Label className="text-muted-foreground">Risk Level</Label>
                                <div className="flex gap-2 mt-1">
                                  {(["low", "med", "high"] as const).map((level) => (
                                    <button
                                      key={level}
                                      onClick={() => updateBotConfig("godMode", { riskLevel: level })}
                                      className={`flex-1 py-1 px-2 rounded font-mono uppercase ${
                                        botConfigs.godMode.riskLevel === level
                                          ? "bg-purple-500/30 text-purple-400 border border-purple-500/50"
                                          : "bg-secondary text-muted-foreground border border-border"
                                      }`}
                                    >
                                      {level}
                                    </button>
                                  ))}
                                </div>
                                <p className="text-muted-foreground mt-2">
                                  Velocity &gt; 2/s + Vol &gt; 5 SOL + Top10 &lt; 15%
                                </p>
                              </div>
                            )}

                            {bot.key === "liquiditySniper" && (
                              <>
                                <div>
                                  <Label className="text-muted-foreground">Block Delay (0-3)</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={3}
                                    value={botConfigs.liquiditySniper.blockDelay}
                                    onChange={(e) =>
                                      updateBotConfig("liquiditySniper", { blockDelay: Number(e.target.value) })
                                    }
                                    className="mt-1 h-7 font-mono"
                                  />
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Max Jito Tip (SOL)</Label>
                                  <Input
                                    type="number"
                                    step={0.001}
                                    value={botConfigs.liquiditySniper.maxJitoTip}
                                    onChange={(e) =>
                                      updateBotConfig("liquiditySniper", { maxJitoTip: Number(e.target.value) })
                                    }
                                    className="mt-1 h-7 font-mono"
                                  />
                                </div>
                              </>
                            )}

                            {bot.key === "copyTrader" && (
                              <>
                                <div>
                                  <Label className="text-muted-foreground">Target Wallet Address</Label>
                                  <Input
                                    placeholder="Wallet address..."
                                    value={botConfigs.copyTrader.targetWallet}
                                    onChange={(e) => updateBotConfig("copyTrader", { targetWallet: e.target.value })}
                                    className="mt-1 h-7 font-mono text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Copy Amount (SOL)</Label>
                                  <Input
                                    type="number"
                                    step={0.1}
                                    value={botConfigs.copyTrader.copyAmount}
                                    onChange={(e) =>
                                      updateBotConfig("copyTrader", { copyAmount: Number(e.target.value) })
                                    }
                                    className="mt-1 h-7 font-mono"
                                  />
                                </div>
                              </>
                            )}

                            {bot.key === "rugShield" && (
                              <div className="flex items-center justify-between">
                                <Label className="text-muted-foreground">Emergency Force Sell</Label>
                                <Switch
                                  checked={botConfigs.rugShield.emergencyForceSell}
                                  onCheckedChange={(checked) =>
                                    updateBotConfig("rugShield", { emergencyForceSell: checked })
                                  }
                                />
                              </div>
                            )}

                            {bot.key === "mempoolWatcher" && (
                              <div>
                                <div className="flex justify-between mb-1">
                                  <Label className="text-muted-foreground">Min Whale Size</Label>
                                  <span className="font-mono text-yellow-400">
                                    {botConfigs.mempoolWatcher.minWhaleSize} SOL
                                  </span>
                                </div>
                                <Slider
                                  value={[botConfigs.mempoolWatcher.minWhaleSize]}
                                  onValueChange={([v]) => updateBotConfig("mempoolWatcher", { minWhaleSize: v })}
                                  min={1}
                                  max={100}
                                  step={1}
                                />
                              </div>
                            )}

                            {bot.key === "graduationBot" && (
                              <div className="flex items-center justify-between">
                                <Label className="text-muted-foreground">Sell on Raydium Migration</Label>
                                <Switch
                                  checked={botConfigs.graduationBot.sellOnMigration}
                                  onCheckedChange={(checked) =>
                                    updateBotConfig("graduationBot", { sellOnMigration: checked })
                                  }
                                />
                              </div>
                            )}

                            {bot.key === "scalpBot" && (
                              <>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <Label className="text-muted-foreground">Take Profit</Label>
                                    <span className="font-mono text-green-400">
                                      +{botConfigs.scalpBot.takeProfitPercent}%
                                    </span>
                                  </div>
                                  <Slider
                                    value={[botConfigs.scalpBot.takeProfitPercent]}
                                    onValueChange={([v]) => updateBotConfig("scalpBot", { takeProfitPercent: v })}
                                    min={5}
                                    max={50}
                                    step={1}
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <Label className="text-muted-foreground">Stop Loss</Label>
                                    <span className="font-mono text-red-400">
                                      -{botConfigs.scalpBot.stopLossPercent}%
                                    </span>
                                  </div>
                                  <Slider
                                    value={[botConfigs.scalpBot.stopLossPercent]}
                                    onValueChange={([v]) => updateBotConfig("scalpBot", { stopLossPercent: v })}
                                    min={2}
                                    max={25}
                                    step={1}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* LOGS TAB - Matrix-style scrolling terminal */}
            <TabsContent value="logs" className="flex-1 m-0 p-0">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <span className="font-mono text-xs text-muted-foreground">{logs.length} entries</span>
                <Button variant="ghost" size="sm" onClick={clearLogs} className="h-6 px-2">
                  <Trash2 className="h-3 w-3 mr-1" />
                  <span className="text-xs">Clear</span>
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-240px)] p-4">
                <div className="space-y-0.5 font-mono text-xs">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground animate-pulse">Awaiting signals...</p>
                  ) : (
                    logs.map((log) => (
                      <div
                        key={log.id}
                        className={`py-0.5 ${
                          log.type.includes("ERROR")
                            ? "text-red-400"
                            : log.type.includes("SNIPER") || log.type.includes("BUY")
                              ? "text-green-400"
                              : log.type.includes("SELL")
                                ? "text-yellow-400"
                                : log.type.includes("RUG") || log.type.includes("FORCE")
                                  ? "text-red-400"
                                  : log.type.includes("GOD")
                                    ? "text-purple-400"
                                    : log.type.includes("COPY")
                                      ? "text-blue-400"
                                      : log.type.includes("WHALE")
                                        ? "text-yellow-400"
                                        : log.type.includes("GRAD")
                                          ? "text-cyan-400"
                                          : log.type.includes("SCALP")
                                            ? "text-orange-400"
                                            : "text-muted-foreground"
                        }`}
                      >
                        <span className="text-muted-foreground">[{log.time}]</span>{" "}
                        <span className="font-bold">[{log.type}]</span> {log.message}
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
