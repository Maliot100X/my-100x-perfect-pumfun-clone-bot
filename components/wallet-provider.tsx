"use client"

import type { ReactNode } from "react"

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  // Mock provider that just renders children without Solana wallet adapter
  // This prevents the "Cannot read properties of undefined (reading 'register')" error
  return <>{children}</>
}
