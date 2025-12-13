import { NextResponse } from "next/server"
import { tradingEngine } from "@/backend/engine"

export async function POST() {
  try {
    console.log("[API] Stopping automation...")

    tradingEngine.stop()

    return NextResponse.json({
      success: true,
      message: "Trading automation stopped",
    })
  } catch (error) {
    console.error("[API] Stop automation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
