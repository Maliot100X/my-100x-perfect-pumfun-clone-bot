/**
 * PumpFun PNL Simulator
 * Simulates realistic price movements and PNL for demo positions
 */

export interface ActivePosition {
  mint: string
  symbol: string
  entryPrice: number
  currentPrice: number
  amountHeld: number
  pnlPercent: number
  timeBought: number
  entrySol: number
  status: "OPEN" | "SELLING" | "CLOSED"
}

/**
 * Calculate simulated PNL based on time elapsed and entry amount
 * Mimics pump.fun token behavior with realistic volatility
 */
export function calculateSimulatedPnl(entrySol: number, timeElapsedMs: number) {
  const timeElapsedSec = timeElapsedMs / 1000

  // Simulate entry price (tokens per SOL at entry)
  const entryPrice = 0.0001 + Math.random() * 0.0005

  // Base growth: tokens can 2x to 5x in first 60 seconds, then stabilize or dump
  let priceMultiplier = 1.0

  if (timeElapsedSec < 10) {
    // Rapid pump phase (0-10s): +50% to +300%
    priceMultiplier = 1 + (timeElapsedSec / 10) * (1.5 + Math.random() * 1.5)
  } else if (timeElapsedSec < 30) {
    // Peak/consolidation (10-30s): maintain gains with volatility
    priceMultiplier = 2.5 + Math.sin(timeElapsedSec * 0.5) * 0.8
  } else if (timeElapsedSec < 60) {
    // Profit-taking phase (30-60s): slight decline with spikes
    priceMultiplier = 2.0 + Math.cos(timeElapsedSec * 0.3) * 0.5
  } else {
    // Long-term (60s+): gradual decline or moon mission
    const moonChance = Math.random()
    if (moonChance > 0.7) {
      // 30% chance of continued moon
      priceMultiplier = 2.5 + (timeElapsedSec - 60) * 0.02
    } else {
      // 70% chance of slow dump
      priceMultiplier = Math.max(0.5, 2.0 - (timeElapsedSec - 60) * 0.01)
    }
  }

  // Add random volatility (±15%)
  const volatility = 1 + (Math.random() - 0.5) * 0.3
  priceMultiplier *= volatility

  const currentPrice = entryPrice * priceMultiplier

  // Calculate PNL percentage
  const pnlPercent = (priceMultiplier - 1) * 100

  return {
    entryPrice,
    currentPrice,
    pnlPercent: Number(pnlPercent.toFixed(1)),
  }
}

/**
 * Generate mock position for demo mode
 */
export function generateMockPosition(entrySol: number): ActivePosition {
  const symbols = ["PEPE", "DOGE", "SHIB", "FLOKI", "BONK", "WIF", "POPCAT", "MOCHI"]
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]

  const mint = Array.from(
    { length: 44 },
    () => "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 58)],
  ).join("")

  return {
    mint,
    symbol: `$${randomSymbol}`,
    entryPrice: 0,
    currentPrice: 0,
    amountHeld: entrySol * 10000, // Mock token amount
    pnlPercent: 0,
    timeBought: Date.now(),
    entrySol,
    status: "OPEN",
  }
}
