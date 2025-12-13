import { NextResponse } from "next/server"
import { tradingEngine } from "@/backend/engine"
import { networkController } from "@/backend/networkController"

export async function GET() {
  try {
    const status = tradingEngine.getStatus()
    const isOnline = await networkController.isOnline()
    const latency = await networkController.getLatency()

    return NextResponse.json({
      ...status,
      rpcOnline: isOnline,
      latency,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[API] Status error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
