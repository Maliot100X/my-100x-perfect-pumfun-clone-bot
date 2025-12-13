export interface Position {
  mint: string
  symbol: string
  entryPrice: number
  currentPrice: number
  amount: number
  solSpent: number
  pnl: number
  pnlPercent: number
  entryTime: number
  status: "OPEN" | "TAKE_PROFIT" | "STOP_LOSS" | "CLOSED"
}

export class PositionManager {
  private positions: Map<string, Position> = new Map()

  addPosition(position: Omit<Position, "pnl" | "pnlPercent" | "status">): void {
    const fullPosition: Position = {
      ...position,
      pnl: 0,
      pnlPercent: 0,
      status: "OPEN",
    }
    this.positions.set(position.mint, fullPosition)
    console.log(`[PositionManager] Added position for ${position.symbol}`)
  }

  updatePrice(mint: string, newPrice: number): Position | null {
    const position = this.positions.get(mint)
    if (!position) return null

    position.currentPrice = newPrice
    position.pnlPercent = ((newPrice - position.entryPrice) / position.entryPrice) * 100
    position.pnl = position.solSpent * (position.pnlPercent / 100)

    this.positions.set(mint, position)
    return position
  }

  closePosition(mint: string, reason: "TAKE_PROFIT" | "STOP_LOSS" | "MANUAL"): Position | null {
    const position = this.positions.get(mint)
    if (!position) return null

    position.status = reason === "TAKE_PROFIT" ? "TAKE_PROFIT" : reason === "STOP_LOSS" ? "STOP_LOSS" : "CLOSED"
    this.positions.delete(mint)

    console.log(
      `[PositionManager] Closed position for ${position.symbol}: ${reason} (PnL: ${position.pnlPercent.toFixed(2)}%)`,
    )
    return position
  }

  getPosition(mint: string): Position | undefined {
    return this.positions.get(mint)
  }

  getAllPositions(): Position[] {
    return Array.from(this.positions.values())
  }

  closeAll(): Position[] {
    const closedPositions = this.getAllPositions().map((pos) => {
      pos.status = "CLOSED"
      return pos
    })
    this.positions.clear()
    console.log(`[PositionManager] Closed all ${closedPositions.length} positions`)
    return closedPositions
  }
}
