"use client"

import { usePumpStore } from "@/lib/store"
import { TrendingUp, TrendingDown } from "lucide-react"

export function TradeHistory() {
  const { logs } = usePumpStore()

  // Filter for trades (BUY/SELL events)
  const tradeEvents = logs
    .filter((log) => log.type === "SELL" || log.type === "LIQUIDITY SNIPER" || log.type === "BUY MORE")
    .slice(-10)
    .reverse()

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-lg font-bold">Recent Trade History</h3>
        <div className="text-xs text-muted-foreground">Last 10 trades</div>
      </div>

      {tradeEvents.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">No trades yet. Waiting for action...</div>
      ) : (
        <div className="space-y-2">
          {tradeEvents.map((event) => {
            const isSell = event.message.includes("SOLD")
            const isProfit = event.message.includes("+")
            const isLoss = event.message.includes("-") && isSell

            return (
              <div
                key={event.id}
                className="flex items-center gap-3 rounded-md border border-border/50 bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isSell
                      ? isProfit
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {isSell ? isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" /> : "+"}
                </div>
                <div className="flex-1">
                  <div className="font-mono text-sm">{event.message}</div>
                  <div className="mt-0.5 font-mono text-xs text-muted-foreground">{event.time}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
