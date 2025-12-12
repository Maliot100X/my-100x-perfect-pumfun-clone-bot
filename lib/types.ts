// Token data types from PumpPortal WebSocket
export interface TokenData {
  signature: string
  mint: string
  traderPublicKey: string
  txType: string
  initialBuy: number
  bondingCurveKey: string
  vTokensInBondingCurve: number
  vSolInBondingCurve: number
  marketCapSol: number
  name: string
  symbol: string
  uri: string
  pool?: string
}

export interface TokenMetadata {
  name: string
  symbol: string
  description?: string
  image?: string
  showName?: boolean
  createdOn?: string
  twitter?: string
  telegram?: string
  website?: string
}

export interface EnrichedToken extends TokenData {
  metadata?: TokenMetadata
  createdAt: number
  marketCapUsd: number
  bondingCurveProgress: number
  priceHistory: number[]
  volume24h: number
  tradeCount: number
  topHolderPercent: number
}

export interface Position {
  id: string
  token: EnrichedToken
  entryPrice: number
  currentPrice: number
  amount: number
  solSpent: number
  pnl: number
  pnlPercent: number
  isSimulated: boolean
  entryTime: number
}

export interface BotConfigs {
  godMode: {
    enabled: boolean
    riskLevel: "low" | "med" | "high"
    // Triggers: Tx Velocity > 2/sec AND Volume > 5 SOL AND Top 10 Holders < 15%
  }
  liquiditySniper: {
    enabled: boolean
    blockDelay: number // 0-3
    maxJitoTip: number // SOL
    // Triggers: Token Age < 2000ms
  }
  copyTrader: {
    enabled: boolean
    targetWallet: string
    copyAmount: number // SOL
    // Mirrors target wallet buys
  }
  rugShield: {
    enabled: boolean
    emergencyForceSell: boolean
    // Auto-SELL if mint authority not disabled in 5 mins OR liquidity < $1k
  }
  mempoolWatcher: {
    enabled: boolean
    minWhaleSize: number // SOL (1-100)
    // Front-runs large purchases
  }
  graduationBot: {
    enabled: boolean
    sellOnMigration: boolean
    // Buys when bondingCurveProgress > 90%
  }
  scalpBot: {
    enabled: boolean
    takeProfitPercent: number // default 10
    stopLossPercent: number // default -5
    // Rapid entry and exit
  }
}

export interface WalletState {
  connected: boolean
  publicKey: string | null
  balance: number
  isSimulator: boolean
  simulatedBalance: number
}

export interface TradeData {
  mint: string
  traderPublicKey: string
  solAmount: number
  isBuy: boolean
  timestamp: number
}
