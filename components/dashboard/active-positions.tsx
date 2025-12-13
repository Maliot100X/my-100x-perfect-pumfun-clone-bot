"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { usePumpStore } from "@/lib/store"
import { Copy, Skull } from "lucide-react"
import { Input } from "@/components/ui/input"
import { calculateSimulatedPnl } from "@/lib/pumpfun-simulator"

export function ActivePositions() {
  const { openPositions, sellPosition, simulateBuy } = usePumpStore()
  const [buyMoreAmount, setBuyMoreAmount] = useState<{ [key: string]: number }>({})
  const [showBuyModal, setShowBuyModal] = useState<string | null>(null)

  const [positionsWithPnl, setPositionsWithPnl] = useState<any[]>([])

  useEffect(() => {
    const updatePnl = () => {
      const updated = openPositions.map((pos) => {
        const timeElapsed = Date.now() - pos.entryTime
        const { currentPrice, entryPrice, pnlPercent } = calculateSimulatedPnl(pos.solSpent, timeElapsed)
        return {
          ...pos,
          entryPrice,
          currentPrice,
          pnlPercent,
        }
      })
      setPositionsWithPnl(updated)
    }

    // Initial calculation
    updatePnl()

    // Update every 1 second for live PNL
    const intervalId = setInterval(updatePnl, 1000)

    return () => clearInterval(intervalId)
  }, [openPositions])

  const handleSell = (positionId: string, percent: number) => {
    sellPosition(positionId, percent, percent === 100 ? "PANIC SELL" : `SELL ${percent}%`)
  }

  const handleForceExit = (positionId: string) => {
    sellPosition(positionId, 100, "EMERGENCY FORCE EXIT")
  }

  const handleBuyMore = (positionId: string) => {
    const position = positionsWithPnl.find((p) => p.id === positionId)
    if (!position) return
    const amount = buyMoreAmount[positionId] || 0.1
    simulateBuy(position.token, amount, "BUY MORE")
    setShowBuyModal(null)
  }

  const copyAddress = (mint: string) => {
    navigator.clipboard.writeText(mint)
  }

  if (positionsWithPnl.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <span className="text-3xl">💤</span>
        </div>
        <div className="font-mono text-lg font-bold text-muted-foreground">No Active Positions</div>
        <div className="mt-2 text-sm text-muted-foreground">Waiting for sniper to execute...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-lg font-bold">Active Positions ({positionsWithPnl.length})</h3>
        <div className="text-xs text-muted-foreground">Live PNL tracking enabled</div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="font-mono text-xs">
              <th className="p-3 text-left">Token</th>
              <th className="p-3 text-right">Entry</th>
              <th className="p-3 text-right">Current</th>
              <th className="p-3 text-right">PNL %</th>
              <th className="p-3 text-right">Held</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positionsWithPnl.map((position) => (
              <tr key={position.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-mono text-sm font-bold">{position.token.symbol}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>
                          {position.token.mint.slice(0, 4)}...{position.token.mint.slice(-4)}
                        </span>
                        <button onClick={() => copyAddress(position.token.mint)} className="hover:text-primary">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-right font-mono text-sm">{position.entryPrice.toFixed(6)}</td>
                <td className="p-3 text-right font-mono text-sm">{position.currentPrice.toFixed(6)}</td>
                <td className="p-3 text-right">
                  <span
                    className={`font-mono text-sm font-bold ${
                      position.pnlPercent >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {position.pnlPercent >= 0 ? "+" : ""}
                    {position.pnlPercent.toFixed(1)}%
                  </span>
                </td>
                <td className="p-3 text-right font-mono text-sm">{position.solSpent.toFixed(2)} SOL</td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    {showBuyModal === position.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={buyMoreAmount[position.id] || 0.1}
                          onChange={(e) =>
                            setBuyMoreAmount({ ...buyMoreAmount, [position.id]: Number(e.target.value) })
                          }
                          className="h-8 w-20 font-mono text-xs"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleBuyMore(position.id)}
                          className="h-8 bg-green-600 hover:bg-green-700"
                        >
                          Buy
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowBuyModal(null)} className="h-8">
                          X
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSell(position.id, 50)}
                          className="h-8 bg-yellow-600 hover:bg-yellow-700 font-mono text-xs"
                        >
                          SELL 50%
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSell(position.id, 100)}
                          className="h-8 bg-red-600 hover:bg-red-700 font-mono text-xs"
                        >
                          PANIC 100%
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleForceExit(position.id)}
                          className="h-8 bg-rose-900 hover:bg-rose-950 font-mono text-xs"
                          title="Emergency Force Exit - Bypass all checks"
                        >
                          <Skull className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setShowBuyModal(position.id)}
                          className="h-8 bg-green-600 hover:bg-green-700 font-mono text-xs"
                        >
                          BUY MORE
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
