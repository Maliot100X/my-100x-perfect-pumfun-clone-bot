"use client"

import { type FC, type ReactNode, useMemo } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"

require("@solana/wallet-adapter-react-ui/styles.css")

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const endpoint = useMemo(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC
    if (!rpcUrl) {
      console.warn("[v0] NEXT_PUBLIC_SOLANA_RPC not set, using default mainnet-beta")
      return "https://api.mainnet-beta.solana.com"
    }
    return rpcUrl
  }, [])

  const wallets = useMemo(() => {
    return [new PhantomWalletAdapter()]
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
