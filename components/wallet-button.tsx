"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function WalletButton() {
  const [isConnected] = useState(false)

  // Replaced WalletMultiButton with a custom button that doesn't require wallet adapter context
  return (
    <Button
      variant="outline"
      className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/50 font-mono text-sm h-10 px-6 rounded-lg transition-all"
    >
      {isConnected ? "Wallet Connected" : "Connect Wallet (Demo Mode)"}
    </Button>
  )
}
