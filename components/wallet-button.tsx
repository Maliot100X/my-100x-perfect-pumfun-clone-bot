"use client"

import { useEffect, useState } from "react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export function WalletButton() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="bg-purple-600/20 text-purple-400 border border-purple-500/50 font-mono text-sm h-10 px-6 rounded-lg flex items-center">
        Loading...
      </div>
    )
  }

  return (
    <WalletMultiButton className="!bg-purple-600/20 !text-purple-400 hover:!bg-purple-600/30 !border !border-purple-500/50 !font-mono !text-sm !h-10 !px-6 !rounded-lg !transition-all" />
  )
}
