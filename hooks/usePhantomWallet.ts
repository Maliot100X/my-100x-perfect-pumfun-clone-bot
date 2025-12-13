"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"

export function usePhantomWallet() {
  const { connection } = useConnection()
  const { publicKey, connected, signTransaction } = useWallet()
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    if (!publicKey) {
      setBalance(0)
      return
    }

    // Fetch balance on mount and when publicKey changes
    connection
      .getBalance(publicKey)
      .then((lamports) => {
        setBalance(lamports / 1e9)
      })
      .catch((err) => {
        console.error("[v0] Failed to fetch balance:", err)
        setBalance(0)
      })

    // Set up polling for balance updates every 5 seconds
    const interval = setInterval(() => {
      if (publicKey) {
        connection
          .getBalance(publicKey)
          .then((lamports) => {
            setBalance(lamports / 1e9)
          })
          .catch((err) => {
            console.error("[v0] Failed to fetch balance:", err)
          })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [publicKey, connection])

  return {
    connected,
    publicKey,
    address: publicKey?.toBase58() ?? null,
    balance,
    signTransaction,
  }
}
