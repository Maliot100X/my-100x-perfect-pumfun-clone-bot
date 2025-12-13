"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { usePumpStore } from "@/lib/store"
import { Info } from "lucide-react"

export function GlobalVsManual() {
  const { manualSettings, updateManualSettings } = usePumpStore()
  const [isGlobalAuto, setIsGlobalAuto] = useState(true)

  const [takeProfit, setTakeProfit] = useState(manualSettings.autoSellTakeProfit)
  const [stopLoss, setStopLoss] = useState(manualSettings.autoSellStopLoss)

  const handleTakeProfitChange = (value: number) => {
    setTakeProfit(value)
    updateManualSettings({ autoSellTakeProfit: value })
  }

  const handleStopLossChange = (value: number) => {
    setStopLoss(value)
    updateManualSettings({ autoSellStopLoss: value })
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-lg font-bold">Strategy Mode</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {isGlobalAuto ? "Auto-selling enabled based on TP/SL settings" : "Manual control - you click to sell"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-sm ${!isGlobalAuto ? "font-bold text-primary" : "text-muted-foreground"}`}>
            MANUAL
          </span>
          <Switch checked={isGlobalAuto} onCheckedChange={setIsGlobalAuto} className="scale-125" />
          <span className={`font-mono text-sm ${isGlobalAuto ? "font-bold text-primary" : "text-muted-foreground"}`}>
            AUTO
          </span>
        </div>
      </div>

      {isGlobalAuto && (
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <Info className="mt-0.5 h-4 w-4 text-green-400" />
            <div className="flex-1 text-sm">
              <div className="font-mono font-bold text-green-400">Global Auto-Sell Active</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Positions will automatically sell when reaching your targets
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 flex items-center justify-between text-sm">
                <span>Take Profit %</span>
                <span className="font-mono font-bold text-green-400">+{takeProfit}%</span>
              </label>
              <Input
                type="number"
                value={takeProfit}
                onChange={(e) => handleTakeProfitChange(Number(e.target.value))}
                min={1}
                className="font-mono"
              />
              <p className="mt-1 text-xs text-muted-foreground">Auto-sell when profit reaches this %</p>
            </div>

            <div>
              <label className="mb-2 flex items-center justify-between text-sm">
                <span>Stop Loss %</span>
                <span className="font-mono font-bold text-red-400">-{stopLoss}%</span>
              </label>
              <Input
                type="number"
                value={stopLoss}
                onChange={(e) => handleStopLossChange(Number(e.target.value))}
                min={1}
                className="font-mono"
              />
              <p className="mt-1 text-xs text-muted-foreground">Auto-sell when loss reaches this %</p>
            </div>
          </div>
        </div>
      )}

      {!isGlobalAuto && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <Info className="mt-0.5 h-4 w-4 text-yellow-400" />
          <div className="text-sm">
            <div className="font-mono font-bold text-yellow-400">Manual Override Enabled</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Auto-sell disabled. Use the buttons in the Active Positions table.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
