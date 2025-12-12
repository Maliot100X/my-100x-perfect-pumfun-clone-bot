"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Wallet, X, FlaskConical, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { usePumpStore } from "@/lib/store"

export function PortfolioDock() {
  const [isExpanded, setIsExpanded] = useState(true)
  const { openPositions, simBalance, isLiveMode, sellPosition } = usePumpStore()

  // Calculate total PnL from all positions - this updates in real-time
  const totalPnl = openPositions.reduce((sum, p) => sum + p.pnl, 0)
  const totalPnlPercent =
    openPositions.length > 0 ? openPositions.reduce((sum, p) => sum + p.pnlPercent, 0) / openPositions.length : 0

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur transition-all duration-300 ${
        isExpanded ? "h-48" : "h-12"
      }`}
    >
      {/* Header */}
      <div
        className="flex h-12 cursor-pointer items-center justify-between px-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Left: Mode Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isLiveMode ? (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            ) : (
              <FlaskConical className="h-4 w-4 text-primary" />
            )}
            <span className={`font-mono text-xs font-bold ${isLiveMode ? "text-red-400" : "text-primary"}`}>
              {isLiveMode ? "LIVE MAINNET" : "SIMULATOR"}
            </span>
          </div>
        </div>

        {/* Center: Position Count & Session PnL */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Open Positions:</span>
            <Badge variant="secondary" className="font-mono">
              {openPositions.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Session PnL:</span>
            <span className={`font-mono text-sm font-bold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
              {totalPnl >= 0 ? "+" : ""}
              {totalPnl.toFixed(4)} SOL
              <span className="ml-1 text-xs">
                ({totalPnlPercent >= 0 ? "+" : ""}
                {totalPnlPercent.toFixed(2)}%)
              </span>
            </span>
          </div>
        </div>

        {/* Right: Balance & Expand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm text-primary">{simBalance.toFixed(2)} SOL</span>
          </div>
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      </div>

      {/* Positions */}
      {isExpanded && (
        <ScrollArea className="h-36 px-4">
          <div className="flex gap-4 pb-4">
            {openPositions.length === 0 ? (
              <div className="flex w-full items-center justify-center py-8 text-muted-foreground">
                <p className="font-mono text-sm">No open positions</p>
              </div>
            ) : (
              openPositions.map((position) => (
                <Card key={position.id} className="min-w-[280px] border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-primary">${position.token.symbol}</span>
                      {position.isSimulated && (
                        <Badge variant="secondary" className="text-[10px]">
                          SIM
                        </Badge>
                      )}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => sellPosition(position.id, 100)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Entry:</span>
                        <span className="ml-1 font-mono">{position.entryPrice.toFixed(6)} SOL</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <span className="ml-1 font-mono">{position.currentPrice.toFixed(6)} SOL</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Spent:</span>
                        <span className="ml-1 font-mono text-primary">{position.solSpent.toFixed(4)} SOL</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-muted-foreground">PnL:</span>
                        <span
                          className={`ml-1 flex items-center font-mono ${
                            position.pnlPercent >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {position.pnlPercent >= 0 ? (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3" />
                          )}
                          {position.pnlPercent >= 0 ? "+" : ""}
                          {position.pnlPercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 font-mono text-xs"
                        onClick={() => sellPosition(position.id, 25)}
                      >
                        25%
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 font-mono text-xs"
                        onClick={() => sellPosition(position.id, 50)}
                      >
                        50%
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 font-mono text-xs"
                        onClick={() => sellPosition(position.id, 100)}
                      >
                        100%
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  )
}
