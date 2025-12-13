import { type Connection, Keypair } from "@solana/web3.js"
import { CONFIG } from "./config"
import { RiskAnalyzer } from "./riskAnalyzer"

export interface TradeResult {
  success: boolean
  signature?: string
  error?: string
  solAmount: number
  mint: string
}

export class Trader {
  private connection: Connection
  private wallet: Keypair
  private riskAnalyzer: RiskAnalyzer
  private positions: Map<string, Position> = new Map()

  constructor(connection: Connection, privateKey: string) {
    this.connection = connection

    // Parse base58 private key
    const decoded = require("bs58").decode(privateKey)
    this.wallet = Keypair.fromSecretKey(decoded)

    this.riskAnalyzer = new RiskAnalyzer(connection)

    console.log("[Trader] Initialized with wallet:", this.wallet.publicKey.toBase58())
  }

  async buy(mint: string, solAmount: number): Promise<TradeResult> {
    console.log(`[Trader] Attempting to buy ${solAmount} SOL of token ${mint}`)

    try {
      // STEP 1: Risk analysis
      const risk = await this.riskAnalyzer.analyzeToken(mint)
      console.log(`[Trader] Risk analysis: ${risk.classification} (${risk.riskScore}/100)`)

      if (risk.shouldSell) {
        return {
          success: false,
          error: `Token flagged as ${risk.classification} - skipping buy`,
          solAmount: 0,
          mint,
        }
      }

      // STEP 2: Build transaction
      // In production, this would interact with pump.fun bonding curve
      // For now, return mock success

      const mockSignature = `mock_buy_${Date.now()}`

      // Track position
      const position: Position = {
        mint,
        entryPrice: solAmount,
        currentPrice: solAmount,
        solAmount,
        entryTime: Date.now(),
        stopLoss: solAmount * (1 + CONFIG.TRADING.GLOBAL_STOP_LOSS / 100),
        takeProfit: solAmount * (1 + CONFIG.TRADING.PARTIAL_TAKE_PROFIT / 100),
      }

      this.positions.set(mint, position)

      return {
        success: true,
        signature: mockSignature,
        solAmount,
        mint,
      }
    } catch (error) {
      console.error("[Trader] Buy error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        solAmount: 0,
        mint,
      }
    }
  }

  async sell(mint: string, percent = 100): Promise<TradeResult> {
    console.log(`[Trader] Attempting to sell ${percent}% of token ${mint}`)

    try {
      const position = this.positions.get(mint)
      if (!position) {
        return {
          success: false,
          error: "Position not found",
          solAmount: 0,
          mint,
        }
      }

      // Calculate sell amount
      const sellAmount = (position.solAmount * percent) / 100

      // Mock transaction
      const mockSignature = `mock_sell_${Date.now()}`

      // Update or remove position
      if (percent >= 100) {
        this.positions.delete(mint)
      } else {
        position.solAmount = position.solAmount * (1 - percent / 100)
        this.positions.set(mint, position)
      }

      return {
        success: true,
        signature: mockSignature,
        solAmount: sellAmount,
        mint,
      }
    } catch (error) {
      console.error("[Trader] Sell error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        solAmount: 0,
        mint,
      }
    }
  }

  async panicSellAll(): Promise<TradeResult[]> {
    console.log("[Trader] PANIC SELL ALL POSITIONS")

    const results: TradeResult[] = []
    for (const [mint, position] of this.positions.entries()) {
      const result = await this.sell(mint, 100)
      results.push(result)
    }

    return results
  }

  getPositions() {
    return Array.from(this.positions.values())
  }

  async monitorPositions(onUpdate: (mint: string, action: "STOP_LOSS" | "TAKE_PROFIT") => void) {
    // Check positions every second for stop-loss and take-profit
    setInterval(async () => {
      for (const [mint, position] of this.positions.entries()) {
        // Mock price update (in production, fetch real price)
        const priceChange = (Math.random() - 0.5) * 0.1 // ±10%
        position.currentPrice = position.currentPrice * (1 + priceChange)

        // Check stop-loss
        if (position.currentPrice <= position.stopLoss) {
          console.log(`[Trader] Stop-loss triggered for ${mint}`)
          await this.sell(mint, 100)
          onUpdate(mint, "STOP_LOSS")
        }

        // Check take-profit
        if (position.currentPrice >= position.takeProfit) {
          console.log(`[Trader] Take-profit triggered for ${mint}`)
          await this.sell(mint, CONFIG.TRADING.PARTIAL_SELL_PERCENT)
          onUpdate(mint, "TAKE_PROFIT")
        }
      }
    }, 1000)
  }
}

interface Position {
  mint: string
  entryPrice: number
  currentPrice: number
  solAmount: number
  entryTime: number
  stopLoss: number
  takeProfit: number
}
