"use client"

import { usePhantomWallet } from "@/hooks/usePhantomWallet"

export default function WalletStatus() {
  const { connected, address, balance } = usePhantomWallet()

  if (!connected) {
    return <p className="text-gray-400 font-mono text-sm">Wallet not connected</p>
  }

  return (
    <div className="p-4 border border-purple-500/30 rounded-lg bg-purple-500/5">
      <p className="font-mono text-sm">
        <strong className="text-purple-400">Wallet:</strong> <span className="text-green-400">{address}</span>
      </p>
      <p className="font-mono text-sm mt-2">
        <strong className="text-purple-400">SOL Balance:</strong>{" "}
        <span className="text-green-400 font-bold">{balance.toFixed(4)} SOL</span>
      </p>
    </div>
  )
}
