import { type NextRequest, NextResponse } from "next/server"
import { executeJitoSnipe } from "@/lib/jito-engine"

/**
 * POST /api/snipe
 * Execute a Block-0 snipe transaction using Jito bundles
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mint, amountSol, jitoTip } = body

    if (!mint || typeof mint !== "string") {
      return NextResponse.json({ error: "Invalid or missing 'mint' field" }, { status: 400 })
    }

    if (!amountSol || typeof amountSol !== "number" || amountSol <= 0) {
      return NextResponse.json({ error: "Invalid or missing 'amountSol' field" }, { status: 400 })
    }

    if (jitoTip !== undefined && (typeof jitoTip !== "number" || jitoTip < 0)) {
      return NextResponse.json({ error: "Invalid 'jitoTip' field" }, { status: 400 })
    }

    const rpcUrl = process.env.RPC_URL
    const privateKey = process.env.BOT_PRIVATE_KEY

    if (!rpcUrl) {
      console.error("[Snipe API] RPC_URL not configured in environment")
      return NextResponse.json({ error: "Server configuration error: RPC_URL not set" }, { status: 500 })
    }

    if (!privateKey) {
      console.error("[Snipe API] BOT_PRIVATE_KEY not configured in environment")
      return NextResponse.json(
        {
          error: "Server configuration error: BOT_PRIVATE_KEY not set",
          hint: "Add BOT_PRIVATE_KEY to your .env file",
        },
        { status: 500 },
      )
    }

    console.log(`[Snipe API] Executing snipe for mint: ${mint}`)
    console.log(`[Snipe API] Amount: ${amountSol} SOL, Tip: ${jitoTip || 0.01} SOL`)

    const result = await executeJitoSnipe({
      mint,
      buyAmountSol: amountSol,
      jitoTipSol: jitoTip || 0.01,
      rpcUrl,
      privateKey,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Snipe executed successfully",
        bundleId: result.bundleId,
        mint,
        amountSol,
        jitoTip: jitoTip || 0.01,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Snipe failed",
          error: result.error,
          mint,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[Snipe API Error]", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
