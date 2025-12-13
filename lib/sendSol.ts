"use client"

import { type Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import type { WalletContextState } from "@solana/wallet-adapter-react"

export async function sendSol(connection: Connection, wallet: WalletContextState, to: string, amountSol: number) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected")
  }

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(to),
      lamports: amountSol * 1e9,
    }),
  )

  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

  const signedTx = await wallet.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signedTx.serialize())

  await connection.confirmTransaction(signature, "confirmed")

  return signature
}
