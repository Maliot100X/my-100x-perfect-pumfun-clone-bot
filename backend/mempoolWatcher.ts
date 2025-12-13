import { type Connection, PublicKey, type ParsedTransactionWithMeta } from "@solana/web3.js"
import { CONFIG } from "./config"

export interface MempoolEvent {
  signature: string
  mint: string
  type: "NEW_TOKEN" | "LARGE_BUY" | "LARGE_SELL" | "LIQUIDITY_ADD"
  solAmount: number
  timestamp: number
  slot: number
}

export class MempoolWatcher {
  private connection: Connection
  private isRunning = false
  private subscriptionId: number | null = null
  private eventCallback: ((event: MempoolEvent) => void) | null = null
  private latencyCallback: ((ms: number) => void) | null = null

  constructor(connection: Connection) {
    this.connection = connection
  }

  async start(onEvent: (event: MempoolEvent) => void, onLatency?: (ms: number) => void) {
    if (this.isRunning) {
      console.log("[MempoolWatcher] Already running")
      return
    }

    this.isRunning = true
    this.eventCallback = onEvent
    this.latencyCallback = onLatency || null

    console.log("[MempoolWatcher] Starting mempool monitoring...")
    console.log("[MempoolWatcher] Using connection.onLogs() for transaction detection")

    // Monitor pump.fun program logs
    const PUMP_FUN_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")

    try {
      this.subscriptionId = this.connection.onLogs(
        PUMP_FUN_PROGRAM,
        async (logs, ctx) => {
          try {
            const signature = logs.signature
            const slot = ctx.slot

            // Fetch full transaction details
            const tx = await this.connection.getParsedTransaction(signature, {
              maxSupportedTransactionVersion: 0,
            })

            if (tx && this.eventCallback) {
              const event = this.parseTransaction(tx, signature, slot)
              if (event) {
                this.eventCallback(event)
              }
            }
          } catch (error) {
            console.error("[MempoolWatcher] Error parsing log:", error)
          }
        },
        "confirmed",
      )

      console.log(`[MempoolWatcher] Subscribed with ID: ${this.subscriptionId}`)

      // Start latency monitoring
      this.startLatencyMonitor()
    } catch (error) {
      console.error("[MempoolWatcher] Failed to start:", error)
      this.isRunning = false
    }
  }

  stop() {
    if (this.subscriptionId !== null) {
      this.connection.removeOnLogsListener(this.subscriptionId)
      console.log("[MempoolWatcher] Stopped monitoring")
    }
    this.isRunning = false
    this.eventCallback = null
    this.latencyCallback = null
  }

  private parseTransaction(tx: ParsedTransactionWithMeta, signature: string, slot: number): MempoolEvent | null {
    // Parse transaction to detect:
    // - New token creations
    // - Large buys/sells
    // - Liquidity additions

    // Mock implementation - in production, parse the actual transaction
    // Check for SPL token transfers, account creations, etc.

    const randomType: MempoolEvent["type"] = ["NEW_TOKEN", "LARGE_BUY", "LARGE_SELL"][
      Math.floor(Math.random() * 3)
    ] as MempoolEvent["type"]

    return {
      signature,
      mint: `mock_${signature.slice(0, 8)}`,
      type: randomType,
      solAmount: Math.random() * 10 + 0.5,
      timestamp: Date.now(),
      slot,
    }
  }

  private startLatencyMonitor() {
    const interval = CONFIG.FRONT_RUN.ENABLED ? CONFIG.MEMPOOL.FRONT_RUN_POLL_INTERVAL : CONFIG.MEMPOOL.POLL_INTERVAL

    setInterval(async () => {
      if (!this.isRunning || !this.latencyCallback) return

      const start = Date.now()
      try {
        await this.connection.getSlot()
        const latency = Date.now() - start
        this.latencyCallback(latency)
      } catch {
        this.latencyCallback(9999)
      }
    }, CONFIG.MEMPOOL.LATENCY_CHECK_INTERVAL)
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      subscriptionId: this.subscriptionId,
    }
  }
}
