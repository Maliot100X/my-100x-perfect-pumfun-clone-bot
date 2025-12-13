import { NextResponse } from "next/server"
import { Keypair } from "@solana/web3.js"
import bs58 from "bs58"

export async function GET() {
  try {
    const privateKey = process.env.BOT_PRIVATE_KEY

    if (!privateKey) {
      return NextResponse.json({
        isConnected: false,
        publicKey: null,
        message: "BOT_PRIVATE_KEY not configured in environment",
      })
    }

    // Validate and derive public key from private key
    try {
      const keypair = Keypair.fromSecretKey(bs58.decode(privateKey))
      const publicKey = keypair.publicKey.toBase58()

      return NextResponse.json({
        isConnected: true,
        publicKey,
        message: "Bot wallet configured successfully",
      })
    } catch (error) {
      return NextResponse.json({
        isConnected: false,
        publicKey: null,
        message: "Invalid private key format",
      })
    }
  } catch (error) {
    console.error("Engine API error:", error)
    return NextResponse.json(
      {
        isConnected: false,
        publicKey: null,
        message: "Failed to check wallet status",
      },
      { status: 500 },
    )
  }
}
