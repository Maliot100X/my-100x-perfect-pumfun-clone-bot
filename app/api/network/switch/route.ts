import { type NextRequest, NextResponse } from "next/server"
import { tradingEngine } from "@/backend/engine"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { network } = body

    if (!["DEVNET", "TESTNET", "MAINNET"].includes(network)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid network. Must be DEVNET, TESTNET, or MAINNET",
        },
        { status: 400 },
      )
    }

    console.log(`[API] Switching network to ${network}`)
    tradingEngine.switchNetwork(network)

    return NextResponse.json({
      success: true,
      message: `Network switched to ${network}`,
      status: tradingEngine.getStatus(),
    })
  } catch (error) {
    console.error("[API] Network switch error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
