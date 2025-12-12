"use client"

import { useState } from "react"
import { usePumpStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Gauge } from "lucide-react"
import {
  Zap,
  Crosshair,
  Copy,
  Shield,
  Eye,
  GraduationCap,
  Scissors,
  Wifi,
  WifiOff,
  RefreshCw,
  Activity,
} from "lucide-react"

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
]

export function GodModeSidebar({ onReconnect }: GodModeSidebarProps) {
  const [activeTab, setActiveTab] = useState<keyof typeof botConfigs>("liquiditySniper")
  const { botConfigs, toggleBot, updateBotConfig, isConnected, error, logs, clearLogs } = usePumpStore()

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
                    value={botConfigs.liquiditySniper.snipeAmount}
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
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-blue-400 border-b border-blue-500/30 pb-2">
                ⚙️ MANUAL SETUP
              </h4>
              <div>
                <Label className="text-[10px] text-muted-foreground">Target Wallet Address</Label>
                <Input
                  placeholder="Enter Solana address..."
                  value={botConfigs.copyTrader.targetWallet}
                  onChange={(e) => updateBotConfig("copyTrader", { targetWallet: e.target.value })}
                  className="h-8 mt-1 font-mono text-[10px]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-primary border-b border-primary/30 pb-2">
                🤖 AI AUTOMATION
              </h4>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <div>
                  <div className="font-mono text-xs font-bold">Whale Watcher</div>
                  <div className="text-[10px] text-muted-foreground">Auto-detect wallets {">"} 50% win rate</div>
                </div>
                <Switch checked={bot.enabled} onCheckedChange={() => toggleBot(activeTab)} />
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
                      value={botConfigs.scalpBot.takeProfit}
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
                      value={botConfigs.scalpBot.stopLoss}
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
                    <Gauge className="h-24 w-24 text-purple-400/20" />
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

      default:
        return <div>Select a bot</div>
    }
  }

  return (
    <aside className="w-[420px] border-r border-border bg-[#0a0d14] flex flex-col">
      {/* Status Bar */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          <span className="font-mono text-xs font-bold text-primary">SYSTEM ONLINE</span>
        </div>
        {isConnected ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/20 border border-green-500/50">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <Wifi className="h-3 w-3 text-green-400" />
            <span className="font-mono text-[10px] text-green-400">LATENCY: ~12ms</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 border border-red-500/50">
            <WifiOff className="h-3 w-3 text-red-400" />
            <span className="font-mono text-[10px] text-red-400">{error || "OFFLINE"}</span>
            {onReconnect && (
              <Button variant="ghost" size="icon" className="h-4 w-4" onClick={onReconnect}>
                <RefreshCw className="h-3 w-3" />
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
            const isEnabled = botConfigs[tab.key].enabled
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full p-2 flex flex-col items-center gap-1 transition-all relative ${
                  isActive ? `${tab.bgColor} ${tab.borderColor} border-r-2` : "hover:bg-secondary/50"
                }`}
              >
                <span className="text-lg">{tab.emoji}</span>
                <span className={`font-mono text-[8px] font-bold text-center leading-tight ${tab.color}`}>
                  {tab.label}
                </span>
                {isEnabled && !isActive && (
                  <div
                    className={`absolute top-1 right-1 h-1.5 w-1.5 rounded-full ${tab.color.replace("text", "bg")} animate-pulse`}
                  />
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
