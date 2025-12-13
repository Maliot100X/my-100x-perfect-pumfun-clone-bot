"use client"

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export default function PhantomConnectButton() {
  return (
    <div className="flex justify-center">
      <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !font-mono !text-sm !h-10 !px-6 !transition-all" />
    </div>
  )
}
