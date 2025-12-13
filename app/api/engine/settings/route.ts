import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { autoWithdrawal } = body

    // Validate the settings
    if (autoWithdrawal.enabled) {
      if (!autoWithdrawal.safeWallet || autoWithdrawal.safeWallet.length < 32) {
        return NextResponse.json({ error: "Invalid safe wallet address" }, { status: 400 })
      }

      if (autoWithdrawal.triggerBalance <= autoWithdrawal.reserveAmount) {
        return NextResponse.json({ error: "Trigger balance must be greater than reserve amount" }, { status: 400 })
      }
    }

    // In a real implementation, you would:
    // 1. Save these settings to a database
    // 2. Update the trading engine configuration
    // 3. Start/stop the auto-withdrawal monitoring loop

    console.log("[AUTO-WITHDRAWAL] Settings updated:", autoWithdrawal)

    return NextResponse.json({
      success: true,
      message: "Auto-withdrawal settings saved successfully",
    })
  } catch (error) {
    console.error("[AUTO-WITHDRAWAL] Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
