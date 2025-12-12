"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Zap, AlertTriangle, ExternalLink } from "lucide-react"
import { usePumpStore } from "@/lib/store"
import type { EnrichedToken } from "@/lib/types"

interface BuyModalProps {
  token: EnrichedToken | null
  isOpen: boolean
  onClose: () => void
  onBuy: (amount: number) => void
}

const QUICK_AMOUNTS = [0.1, 0.5, 1, 2, 5]

export function BuyModal({ token, isOpen, onClose, onBuy }: BuyModalProps) {
  const [amount, setAmount] = useState<string>("0.5")
  const [isLoading, setIsLoading] = useState(false)
  const { isLiveMode, simBalance } = usePumpStore()

  if (!token) return null

  const solAmount = Number.parseFloat(amount) || 0
  const availableBalance = simBalance
  const isValidAmount = solAmount > 0 && solAmount <= availableBalance

  const handleBuy = async () => {
    if (!isValidAmount) return
    setIsLoading(true)
    try {
      onBuy(solAmount)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border bg-card font-mono sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Zap className="h-5 w-5 text-primary" />
            Buy {token.symbol}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Token Info */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            {token.metadata?.image ? (
              <img
                src={token.metadata.image || "/placeholder.svg"}
                alt={token.symbol}
                className="h-12 w-12 rounded-full border border-border object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold text-muted-foreground">
                {token.symbol?.charAt(0) || "?"}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{token.name}</span>
                <Badge variant="outline" className="text-xs">
                  ${token.symbol}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                MC: ${token.marketCapUsd?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || "0"}
              </div>
            </div>
            <a
              href={`https://pump.fun/${token.mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Mode Indicator */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-2">
            <span className="text-sm text-muted-foreground">Mode:</span>
            <Badge variant={!isLiveMode ? "secondary" : "destructive"}>
              {!isLiveMode ? "SIMULATOR" : "LIVE MAINNET"}
            </Badge>
          </div>

          {/* Balance */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Available Balance:</span>
            <span className="font-bold text-primary">{availableBalance.toFixed(4)} SOL</span>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Amount (SOL)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="border-border bg-background font-mono text-lg"
              min="0"
              step="0.1"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                size="sm"
                onClick={() => setAmount(quickAmount.toString())}
                className={`flex-1 ${Number.parseFloat(amount) === quickAmount ? "border-primary text-primary" : ""}`}
                disabled={quickAmount > availableBalance}
              >
                {quickAmount} SOL
              </Button>
            ))}
          </div>

          {/* Warning for insufficient balance */}
          {solAmount > availableBalance && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Insufficient balance
            </div>
          )}

          {/* Live mode warning */}
          {isLiveMode && (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-2 text-sm text-yellow-500">
              <AlertTriangle className="h-4 w-4" />
              Real funds will be used!
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleBuy}
              disabled={!isValidAmount || isLoading}
              className="flex-1 bg-primary font-bold text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Processing..." : `Buy ${solAmount} SOL`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
