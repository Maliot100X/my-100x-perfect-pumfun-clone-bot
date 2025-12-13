"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { usePumpStore } from "@/lib/store"
import { Skull, Zap, Shield, ChevronDown, ChevronUp } from "lucide-react"
import { ActivePositions } from "@/components/dashboard/active-positions"
import { GlobalVsManual } from "@/components/dashboard/global-vs-manual"
import { TradeHistory } from "@/components/dashboard/trade-history"

export function KillerMode() {
  const { addLog, simulateBuy, tokens, killerMode, updateKillerMode } = usePumpStore()
  const [sniperArmed, setSniperArmed] = useState(false)
  const [configCollapsed, setConfigCollapsed] = useState(false)
  const [logs, setLogs] = useState<Array<{ id: string; text: string; color: string }>>([
    { id: "1", text: "Scanning Mempool...", color: "text-green-400" },
    { id: "2", text: "RPC Connection: Online", color: "text-green-400" },
    { id: "3", text: "Jito Block Engine: Connected", color: "text-cyan-400" },
  ])

  useEffect(() => {
    if (!sniperArmed) return

    const demoInterval = setInterval(() => {
      const mockId = Math.random().toString(36).substring(7).toUpperCase()
      const mockToken = {
        mint: `${mockId}${Math.random().toString(36).substring(2)}`,
        name: `Mock Token ${mockId}`,
        symbol: `$MOCK-${mockId}`,
        uri: "",
        image: "/placeholder.svg?height=40&width=40",
        description: "Demo snipe token",
        marketCapSol: 0.5 + Math.random() * 2,
        bondingCurveProgress: 10 + Math.random() * 20,
        devBuyPercent: 5 + Math.random() * 15,
        timestamp: Date.now(),
        vTokensInBondingCurve: 800000000,
        vSolInBondingCurve: 10 + Math.random() * 20,
      }

      const buySuccess = simulateBuy(mockToken, killerMode.buyAmountSol, "KILLER-SNIPER")

      if (buySuccess) {
        setLogs((prev) => [
          ...prev.slice(-49),
          {
            id: crypto.randomUUID(),
            text: `[SUCCESS] Block-0 Sniper Landed! Token: ${mockToken.symbol}`,
            color: "text-green-400",
          },
          {
            id: crypto.randomUUID(),
            text: `Entry Price: ${mockToken.marketCapSol.toFixed(4)} SOL | Dev Hold: ${mockToken.devBuyPercent.toFixed(1)}%`,
            color: "text-cyan-400",
          },
        ])
        addLog("KILLER", `SNIPED ${mockToken.symbol} at ${mockToken.marketCapSol.toFixed(4)} SOL`)
      }
    }, 3000)

    return () => clearInterval(demoInterval)
  }, [sniperArmed, simulateBuy, addLog, killerMode.buyAmountSol])

  useEffect(() => {
    if (!sniperArmed) return

    const pnlInterval = setInterval(() => {
      console.log("[v0] Demo PNL update tick")
    }, 1000)

    return () => clearInterval(pnlInterval)
  }, [sniperArmed])

  const toggleSniper = () => {
    const newState = !sniperArmed
    setSniperArmed(newState)
    addLog("KILLER", newState ? "SNIPER ENGINE: ARMED" : "SNIPER ENGINE: DISARMED")

    if (newState) {
      setLogs((prev) => [
        ...prev,
        { id: crypto.randomUUID(), text: "⚠️ SNIPER ENGINE ARMED - READY TO EXECUTE", color: "text-red-400" },
        { id: crypto.randomUUID(), text: "Monitoring pump.fun for new token launches...", color: "text-yellow-400" },
        {
          id: crypto.randomUUID(),
          text: "Demo Mode Active: Simulating high-speed sniping...",
          color: "text-purple-400",
        },
      ])
    } else {
      setLogs((prev) => [
        ...prev,
        { id: crypto.randomUUID(), text: "Sniper engine disarmed. Standby mode.", color: "text-gray-400" },
      ])
    }
  }

  const handleJitoBribeSelect = (amount: number) => {
    updateKillerMode({ jitoBribe: amount })
    addLog("KILLER", `Jito Bribe set to ${amount} SOL`)
    setLogs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: `Jito Tip updated: ${amount} SOL`, color: "text-cyan-400" },
    ])
  }

  return (
    <div className="space-y-6">
      <div
        className={`relative overflow-hidden rounded-lg border-2 p-6 ${
          sniperArmed
            ? "border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
            : "border-red-500/50 bg-gradient-to-br from-red-500/10 to-rose-500/10"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skull className={`h-8 w-8 ${sniperArmed ? "text-green-400" : "text-red-400"}`} />
            <div>
              <div className="font-mono text-2xl font-bold">SNIPER ENGINE</div>
              <div className={`font-mono text-sm ${sniperArmed ? "text-green-400" : "text-red-400"}`}>
                {sniperArmed ? "🟢 ARMED - READY TO FIRE" : "🔴 DISARMED"}
              </div>
            </div>
          </div>
          <Switch checked={sniperArmed} onCheckedChange={toggleSniper} className="scale-150" />
        </div>

        {sniperArmed && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-black/50 p-3 font-mono text-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-green-400">RPC Connection: Online</span>
            <span className="text-gray-600">|</span>
            <span className="text-cyan-400">Jito Block Engine: Connected</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <Badge variant="default" className="font-mono">
          <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-green-500" />
          RPC ONLINE
        </Badge>
        <Badge variant="secondary" className="font-mono">
          <Shield className="mr-1 h-3 w-3" />
          ANTI-RUG {killerMode.antiRug ? "ENABLED" : "DISABLED"}
        </Badge>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <button
          onClick={() => setConfigCollapsed(!configCollapsed)}
          className="flex w-full items-center justify-between p-4 hover:bg-secondary/50"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h3 className="font-mono text-lg font-bold">Configuration Settings</h3>
          </div>
          {configCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </button>

        {!configCollapsed && (
          <div className="space-y-6 p-6 pt-0">
            <div>
              <label className="mb-2 flex items-center justify-between text-sm">
                <span className="font-mono font-bold">SOL Buy Amount (Per Snipe)</span>
                <span className="font-mono text-lg font-bold text-green-400">{killerMode.buyAmountSol} SOL</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max="10"
                value={killerMode.buyAmountSol}
                onChange={(e) => updateKillerMode({ buyAmountSol: Number(e.target.value) })}
                className="font-mono"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                💡 The exact SOL amount to use for each Block-0 buy transaction
              </p>
            </div>

            <div>
              <p className="mb-4 text-sm text-muted-foreground">
                Higher tips increase your chance of landing first in the block
              </p>

              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleJitoBribeSelect(0.01)}
                  className={`group relative overflow-hidden rounded-lg border-2 p-6 transition-all hover:scale-105 ${
                    killerMode.jitoBribe === 0.01
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-border bg-secondary hover:border-green-500/30"
                  }`}
                >
                  <div className="text-center">
                    <div className="mb-2 font-mono text-3xl font-bold text-green-400">0.01</div>
                    <div className="mb-1 text-xs text-muted-foreground">SOL</div>
                    <div className="font-mono text-sm font-bold">STANDARD</div>
                  </div>
                </button>

                <button
                  onClick={() => handleJitoBribeSelect(0.1)}
                  className={`group relative overflow-hidden rounded-lg border-2 p-6 transition-all hover:scale-105 ${
                    killerMode.jitoBribe === 0.1
                      ? "border-yellow-500/50 bg-yellow-500/10"
                      : "border-border bg-secondary hover:border-yellow-500/30"
                  }`}
                >
                  <div className="text-center">
                    <div className="mb-2 font-mono text-3xl font-bold text-yellow-400">0.1</div>
                    <div className="mb-1 text-xs text-muted-foreground">SOL</div>
                    <div className="font-mono text-sm font-bold">AGGRESSIVE</div>
                  </div>
                </button>

                <button
                  onClick={() => handleJitoBribeSelect(1.0)}
                  className={`group relative overflow-hidden rounded-lg border-2 p-6 transition-all hover:scale-105 ${
                    killerMode.jitoBribe === 1.0
                      ? "border-red-500/50 bg-red-500/20 animate-pulse-glow"
                      : "border-border bg-secondary hover:border-red-500/50"
                  }`}
                >
                  <div className="text-center">
                    <div className="mb-2 font-mono text-3xl font-bold text-red-400">1.0</div>
                    <div className="mb-1 text-xs text-muted-foreground">SOL</div>
                    <div className="font-mono text-sm font-bold text-red-400">KING SLAYER</div>
                  </div>
                  {killerMode.jitoBribe === 1.0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 animate-pulse" />
                  )}
                </button>
              </div>

              <div className="mt-4 rounded-md bg-black/50 p-3 font-mono text-xs text-yellow-400">
                ⚠️ Current Tip: {killerMode.jitoBribe} SOL per transaction
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-mono text-lg font-bold">Protection Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 flex items-center justify-between text-sm">
                    <span>Max Dev Buy %</span>
                    <span className="font-mono font-bold text-primary">{killerMode.maxDevBuy}%</span>
                  </label>
                  <Input
                    type="number"
                    value={killerMode.maxDevBuy}
                    onChange={(e) => updateKillerMode({ maxDevBuy: Number(e.target.value) })}
                    min={0}
                    max={100}
                    className="font-mono"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Skip tokens if dev holds more than this %</p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4">
                  <div>
                    <div className="font-mono text-sm font-bold">Anti-Rug Protection</div>
                    <div className="text-xs text-muted-foreground">Avoid suspicious token contracts</div>
                  </div>
                  <Switch
                    checked={killerMode.antiRug}
                    onCheckedChange={(checked) => {
                      updateKillerMode({ antiRug: checked })
                      addLog("KILLER", `Anti-Rug Protection: ${checked ? "ENABLED" : "DISABLED"}`)
                    }}
                  />
                </div>

                <div
                  className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                    killerMode.aiRugDefense
                      ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                      : "border-border bg-secondary/50"
                  }`}
                >
                  <div>
                    <div className="font-mono text-sm font-bold">
                      🤖 AI Rug Detector
                      {killerMode.aiRugDefense && <span className="ml-2 text-purple-400">(ACTIVE)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Scans top 20 holders in Block-0. If Dev + Bundled Wallets hold {">"}60% of supply, AUTO-SELL
                      immediately.
                    </div>
                  </div>
                  <Switch
                    checked={killerMode.aiRugDefense}
                    onCheckedChange={(checked) => {
                      updateKillerMode({ aiRugDefense: checked })
                      addLog("KILLER", `AI Rug Defense: ${checked ? "ENABLED" : "DISABLED"}`)
                      setLogs((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          text: checked
                            ? "AI Rug Detector armed - scanning holder distribution..."
                            : "AI Rug Detector disabled",
                          color: checked ? "text-purple-400" : "text-gray-400",
                        },
                      ])
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="font-mono text-2xl font-bold">Live Operations</h2>

        <GlobalVsManual />

        <ActivePositions />

        <TradeHistory />
      </div>

      <div className="rounded-lg border border-green-500/30 bg-black p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-mono text-sm font-bold text-green-400">EXECUTION TERMINAL</div>
          <button onClick={() => setLogs([])} className="font-mono text-xs text-muted-foreground hover:text-primary">
            Clear
          </button>
        </div>
        <div className="h-64 overflow-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground">No logs. Waiting for activity...</div>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className={log.color}>
                  <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span> {log.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
