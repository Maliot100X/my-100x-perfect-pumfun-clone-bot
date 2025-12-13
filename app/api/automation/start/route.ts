import { type NextRequest, NextResponse } from "next/server"
import { tradingEngine } from "@/backend/engine"

export async function POST(req: NextRequest) {
  try {
    console.log("[API] Starting automation...")

    const result = await tradingEngine.start()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Trading automation started",
        status: tradingEngine.getStatus(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("[API] Start automation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
