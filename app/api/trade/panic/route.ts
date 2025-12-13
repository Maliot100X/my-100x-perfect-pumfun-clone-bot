import { NextResponse } from "next/server"
import { tradingEngine } from "@/backend/engine"

export async function POST() {
  try {
    console.log("[API] PANIC SELL TRIGGERED")

    const result = await tradingEngine.panicSell()

    return NextResponse.json({
      success: true,
      message: `Panic sell complete: ${result.soldCount} positions closed`,
      soldCount: result.soldCount,
    })
  } catch (error) {
    console.error("[API] Panic sell error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
