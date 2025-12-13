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
    minVelocity: number // Tx/s (default: 2)
    minVolume: number // SOL (default: 5)
  }
  liquiditySniper: {
    enabled: boolean
    blockDelay: number // 0-3 (default: 0)
    tipSol: number // SOL (default: 0.01)
    snipeAmount: number // SOL (default: 0.5)
  }
  copyTrader: {
    enabled: boolean
    targetWallet: string
    copyPercent: number // % (default: 100)
  }
  rugShield: {
    enabled: boolean
    timeLimit: number // minutes (default: 5)
    minHolders: number // (default: 20)
  }
  mempoolWatcher: {
    enabled: boolean
    whaleThreshold: number // SOL (default: 50)
  }
  graduationBot: {
    enabled: boolean
    entryProgress: number // % (default: 90)
    exitProgress: number // % (default: 99)
  }
  scalpBot: {
    enabled: boolean
    takeProfit: number // % (default: 15)
    stopLoss: number // % (default: 10)
  }
}

export interface ManualSettings {
  quickBuyPresets: [number, number, number] // SOL amounts
  globalSlippage: number // % (default: 10)
  priorityFee: number // SOL (default: 0.005)
  maxRisk: number // SOL (default: 1.0)
  buyAmount: number // SOL (default: 0.1)
  autoSellTakeProfit: number // % (default: 100)
  autoSellStopLoss: number // % (default: 20)
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

export interface TrackedWallet {
  id: string
  address: string
  tag: string
  source: "AI" | "MANUAL"
  winRate: number
  pnl: number
  status: "ACTIVE" | "PAUSED"
  addedAt: number
}

export interface AutoWithdrawalSettings {
  enabled: boolean
  safeWallet: string
  triggerBalance: number // SOL
  reserveAmount: number // SOL
}
