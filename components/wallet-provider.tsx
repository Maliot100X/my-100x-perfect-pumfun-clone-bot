"use client"

import type { ReactNode } from "react"
import "@solana/wallet-adapter-react-ui/styles.css"

/**
 * SolanaWalletProvider - Mock wallet provider for development
 *
 * In production, replace this with the full Solana wallet adapter implementation.
 * This mock version prevents runtime errors while allowing the UI to function.
 *
 * High z-index wrapper prevents CSS/z-index conflicts with modal overlays.
 */
export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  return <div style={{ zIndex: 9999, position: "relative" }}>{children}</div>
}
