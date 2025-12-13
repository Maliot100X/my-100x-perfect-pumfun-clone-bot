import { networkController } from "./networkController"
import { MempoolWatcher, type MempoolEvent } from "./mempoolWatcher"
import { Trader } from "./trader"
import { PositionManager } from "./positionManager"
import { CONFIG, enableFrontRunMode } from "./config"

export interface EngineStatus {
  isRunning: boolean
  network: "DEVNET" | "TESTNET" | "MAINNET"
  mempoolActive: boolean
  frontRunMode: boolean
  openPositions: number
  latency: number
}

class TradingEngine {
  private mempoolWatcher: MempoolWatcher | null = null
  private trader: Trader | null = null
  private positionManager: PositionManager
  private isRunning = false
  private frontRunMode = false
  private latency = 0

  constructor() {
    this.positionManager = new PositionManager()
  }

  async start(): Promise<{ success: boolean; error?: string }> {
    if (this.isRunning) {
      return { success: false, error: "Engine already running" }
    }

    console.log("[Engine] Starting trading engine...")

    try {
      // Initialize connection
      const connection = networkController.getConnection()

      // Initialize trader
      if (!CONFIG.BOT_PRIVATE_KEY) {
        return { success: false, error: "BOT_PRIVATE_KEY not configured in environment" }
      }

      this.trader = new Trader(connection, CONFIG.BOT_PRIVATE_KEY)

      // Initialize mempool watcher
      this.mempoolWatcher = new MempoolWatcher(connection)

      // Start mempool monitoring
      this.mempoolWatcher.start(
        (event: MempoolEvent) => this.handleMempoolEvent(event),
        (ms: number) => {
          this.latency = ms
        },
      )

      // Start position monitoring
      if (this.trader) {
        this.trader.monitorPositions((mint, action) => {
          console.log(`[Engine] Position action: ${mint} -> ${action}`)
        })
      }

      this.isRunning = true
      console.log("[Engine] Trading engine started successfully")

      return { success: true }
    } catch (error) {
      console.error("[Engine] Failed to start:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  stop(): void {
    console.log("[Engine] Stopping trading engine...")

    if (this.mempoolWatcher) {
      this.mempoolWatcher.stop()
    }

    this.isRunning = false
    console.log("[Engine] Trading engine stopped")
  }

  private async handleMempoolEvent(event: MempoolEvent): Promise<void> {
    console.log(`[Engine] Mempool event: ${event.type} - ${event.mint}`)

    if (event.type === "NEW_TOKEN" && this.trader) {
      // Auto-buy new tokens (if enabled)
      const result = await this.trader.buy(event.mint, CONFIG.TRADING.DEFAULT_BUY_AMOUNT)

      if (result.success) {
        this.positionManager.addPosition({
          mint: event.mint,
          symbol: `TOKEN_${event.mint.slice(0, 6)}`,
          entryPrice: result.solAmount,
          currentPrice: result.solAmount,
          amount: 1000000, // Mock amount
          solSpent: result.solAmount,
          entryTime: Date.now(),
        })
        console.log(`[Engine] Successfully bought ${event.mint}`)
      } else {
        console.log(`[Engine] Failed to buy ${event.mint}: ${result.error}`)
      }
    }
  }

  async panicSell(): Promise<{ success: boolean; soldCount: number }> {
    console.log("[Engine] PANIC SELL INITIATED")

    if (!this.trader) {
      return { success: false, soldCount: 0 }
    }

    const results = await this.trader.panicSellAll()
    const successCount = results.filter((r) => r.success).length

    this.positionManager.closeAll()

    console.log(`[Engine] Panic sell complete: ${successCount}/${results.length} sold`)
    return { success: true, soldCount: successCount }
  }

  setFrontRunMode(enabled: boolean): void {
    this.frontRunMode = enabled
    enableFrontRunMode(enabled)
    console.log(`[Engine] Front-Run Mode: ${enabled ? "ENABLED" : "DISABLED"}`)
  }

  switchNetwork(network: "DEVNET" | "TESTNET" | "MAINNET"): void {
    console.log(`[Engine] Switching network to ${network}`)

    // Stop current operations
    const wasRunning = this.isRunning
    if (wasRunning) {
      this.stop()
    }

    // Switch network
    networkController.switchNetwork(network)

    // Restart if was running
    if (wasRunning) {
      this.start()
    }
  }

  getStatus(): EngineStatus {
    return {
      isRunning: this.isRunning,
      network: networkController.getCurrentNetwork(),
      mempoolActive: this.mempoolWatcher?.getStatus().isRunning || false,
      frontRunMode: this.frontRunMode,
      openPositions: this.positionManager.getAllPositions().length,
      latency: this.latency,
    }
  }
}

// Singleton instance
export const tradingEngine = new TradingEngine()
