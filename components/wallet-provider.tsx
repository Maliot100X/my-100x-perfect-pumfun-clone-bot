"use client"

import { useMemo, useCallback, type ReactNode } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import type { WalletError } from "@solana/wallet-adapter-base"
import "@solana/wallet-adapter-react-ui/styles.css"

const MAINNET_RPC = "https://api.mainnet-beta.solana.com"

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  const onError = useCallback((error: WalletError) => {
    // Silently ignore user rejections - this is expected behavior
    if (error.message?.includes("User rejected")) {
      return
    }
    // Log other wallet errors for debugging
    console.warn("[Wallet]", error.message)
  }, [])

  return (
    <ConnectionProvider endpoint={MAINNET_RPC}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
