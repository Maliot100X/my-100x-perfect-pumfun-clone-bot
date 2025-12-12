import { create } from "zustand"
import type { EnrichedToken, Position, BotConfigs, TradeData, ManualSettings } from "@/lib/types"

interface PumpStore {
  // Mode state
  isLiveMode: boolean
  simBalance: number

  botConfigs: BotConfigs
  manualSettings: ManualSettings

  // Positions and tokens
  openPositions: Position[]
  tokens: EnrichedToken[]
  latestToken: EnrichedToken | null
  latestTrade: TradeData | null

  // Logs with structured format
  logs: Array<{ id: string; time: string; type: string; message: string }>

  // WebSocket state
  isConnected: boolean
  error: string | null
  packetsReceived: number
  latency: number

  trailingStops: Map<string, number>
  tradeVelocity: Map<string, number[]>
  tokenVolumes: Map<string, number>

  // Actions
  toggleLiveMode: () => void
  toggleBot: (bot: keyof BotConfigs) => void
  updateBotConfig: <K extends keyof BotConfigs>(key: K, value: Partial<BotConfigs[K]>) => void
  updateManualSettings: (settings: Partial<ManualSettings>) => void
  simulateBuy: (token: EnrichedToken, solAmount: number, source?: string) => boolean
  sellPosition: (positionId: string, sellPercent: number, reason?: string) => void
  updatePositionPrice: (mint: string, newPrice: number) => void
  addLog: (type: string, message: string) => void
  addToken: (token: EnrichedToken) => void
  setLatestToken: (token: EnrichedToken | null) => void
  setLatestTrade: (trade: TradeData | null) => void
  setConnectionStatus: (connected: boolean, error?: string | null) => void
  clearLogs: () => void
  setTrailingStop: (positionId: string, stopLoss: number) => void
  addTradeToVelocity: (mint: string) => void
  addToVolume: (mint: string, solAmount: number) => void
  getTradeVelocity: (mint: string) => number
  incrementPackets: () => void
  setLatency: (ms: number) => void
}

const DEFAULT_BOT_CONFIGS: BotConfigs = {
  godMode: {
    enabled: false,
    minVelocity: 2,
    minVolume: 5,
  },
  liquiditySniper: {
    enabled: false,
    blockDelay: 0,
    tipSol: 0.01,
    snipeAmount: 0.1, // Changed from 0.5 to 0.1
  },
  copyTrader: {
    enabled: false,
    targetWallet: "",
    copyPercent: 100,
  },
  rugShield: {
    enabled: false,
    timeLimit: 5,
    minHolders: 20,
  },
  mempoolWatcher: {
    enabled: false,
    whaleThreshold: 50,
  },
  graduationBot: {
    enabled: false,
    entryProgress: 90,
    exitProgress: 99,
  },
  scalpBot: {
    enabled: false,
    takeProfit: 15,
    stopLoss: 10,
  },
}

const DEFAULT_MANUAL_SETTINGS: ManualSettings = {
  quickBuyPresets: [0.1, 0.5, 1.0], // Default 0.1 SOL
  globalSlippage: 1,
  priorityFee: 0.005,
}

export const usePumpStore = create<PumpStore>((set, get) => ({
  isLiveMode: false,
  simBalance: 100,
  botConfigs: DEFAULT_BOT_CONFIGS,
  manualSettings: DEFAULT_MANUAL_SETTINGS,
  openPositions: [],
  tokens: [],
  latestToken: null,
  latestTrade: null,
  logs: [],
  isConnected: false,
  error: null,
  packetsReceived: 0,
  latency: 0,
  trailingStops: new Map(),
  tradeVelocity: new Map(),
  tokenVolumes: new Map(),

  toggleLiveMode: () =>
    set((state) => {
      const newMode = !state.isLiveMode
      return {
        isLiveMode: newMode,
        logs: [
          ...state.logs,
          {
            id: crypto.randomUUID(),
            time: new Date().toLocaleTimeString(),
            type: "SYSTEM",
            message: `Mode: ${newMode ? "LIVE MAINNET" : "SIMULATOR"}`,
          },
        ],
      }
    }),

  toggleBot: (bot) =>
    set((state) => {
      const newState = !state.botConfigs[bot].enabled
      const botNames: Record<keyof BotConfigs, string> = {
        godMode: "GOD MODE",
        liquiditySniper: "LIQUIDITY SNIPER",
        copyTrader: "COPY TRADER",
        rugShield: "RUG SHIELD",
        mempoolWatcher: "MEMPOOL WATCHER",
        graduationBot: "GRADUATION BOT",
        scalpBot: "SCALP BOT",
      }
      return {
        botConfigs: {
          ...state.botConfigs,
          [bot]: { ...state.botConfigs[bot], enabled: newState },
        },
        logs: [
          ...state.logs,
          {
            id: crypto.randomUUID(),
            time: new Date().toLocaleTimeString(),
            type: "BOT",
            message: `${botNames[bot]} ${newState ? "ACTIVATED" : "DEACTIVATED"}`,
          },
        ],
      }
    }),

  updateBotConfig: (key, value) =>
    set((state) => ({
      botConfigs: { ...state.botConfigs, [key]: { ...state.botConfigs[key], ...value } },
    })),

  updateManualSettings: (settings) =>
    set((state) => ({
      manualSettings: { ...state.manualSettings, ...settings },
    })),

  simulateBuy: (token, solAmount, source = "MANUAL") => {
    const state = get()
    if (state.isLiveMode) return false
    if (solAmount > state.simBalance) {
      set((s) => ({
        logs: [
          ...s.logs,
          {
            id: crypto.randomUUID(),
            time: new Date().toLocaleTimeString(),
            type: "ERROR",
            message: `Insufficient balance for ${token.symbol}`,
          },
        ],
      }))
      return false
    }

    const tokenAmount = (solAmount / token.marketCapSol) * 1_000_000_000
    const newPosition: Position = {
      id: `${token.mint}-${Date.now()}`,
      token,
      entryPrice: token.marketCapSol,
      currentPrice: token.marketCapSol,
      amount: tokenAmount,
      solSpent: solAmount,
      pnl: 0,
      pnlPercent: 0,
      isSimulated: true,
      entryTime: Date.now(),
    }

    set((state) => ({
      simBalance: state.simBalance - solAmount,
      openPositions: [...state.openPositions, newPosition],
      logs: [
        ...state.logs,
        {
          id: crypto.randomUUID(),
          time: new Date().toLocaleTimeString(),
          type: source,
          message: `BUY $${token.symbol} for ${solAmount} SOL`,
        },
      ],
    }))
    return true
  },

  sellPosition: (positionId, sellPercent, reason = "Manual") => {
    const state = get()
    const position = state.openPositions.find((p) => p.id === positionId)
    if (!position) return

    const solReturned = position.solSpent * (1 + position.pnlPercent / 100) * (sellPercent / 100)

    if (sellPercent >= 100) {
      set((s) => ({
        simBalance: s.simBalance + solReturned,
        openPositions: s.openPositions.filter((p) => p.id !== positionId),
        logs: [
          ...s.logs,
          {
            id: crypto.randomUUID(),
            time: new Date().toLocaleTimeString(),
            type: "SELL",
            message: `${reason}: SOLD 100% $${position.token.symbol} → ${solReturned.toFixed(4)} SOL (${position.pnlPercent >= 0 ? "+" : ""}${position.pnlPercent.toFixed(1)}%)`,
          },
        ],
      }))
    } else {
      set((s) => ({
        simBalance: s.simBalance + solReturned,
        openPositions: s.openPositions.map((p) =>
          p.id === positionId
            ? {
                ...p,
                amount: p.amount * (1 - sellPercent / 100),
                solSpent: p.solSpent * (1 - sellPercent / 100),
              }
            : p,
        ),
        logs: [
          ...s.logs,
          {
            id: crypto.randomUUID(),
            time: new Date().toLocaleTimeString(),
            type: "SELL",
            message: `${reason}: SOLD ${sellPercent}% $${position.token.symbol} → ${solReturned.toFixed(4)} SOL`,
          },
        ],
      }))
    }
  },

  updatePositionPrice: (mint, newPrice) => {
    set((state) => ({
      openPositions: state.openPositions.map((p) => {
        if (p.token.mint === mint) {
          const pnlPercent = ((newPrice - p.entryPrice) / p.entryPrice) * 100
          const pnl = p.solSpent * (pnlPercent / 100)
          return { ...p, currentPrice: newPrice, pnlPercent, pnl }
        }
        return p
      }),
    }))
  },

  addLog: (type, message) =>
    set((state) => ({
      logs: [
        ...state.logs.slice(-99),
        {
          id: crypto.randomUUID(),
          time: new Date().toLocaleTimeString(),
          type,
          message,
        },
      ],
    })),

  addToken: (token) =>
    set((state) => ({
      tokens: [token, ...state.tokens].slice(0, 100),
      latestToken: token,
    })),

  setLatestToken: (token) => set({ latestToken: token }),
  setLatestTrade: (trade) => set({ latestTrade: trade }),
  setConnectionStatus: (connected, error = null) => set({ isConnected: connected, error }),
  clearLogs: () => set({ logs: [] }),

  setTrailingStop: (positionId, stopLoss) =>
    set((state) => {
      const newMap = new Map(state.trailingStops)
      newMap.set(positionId, stopLoss)
      return { trailingStops: newMap }
    }),

  addTradeToVelocity: (mint) =>
    set((state) => {
      const newMap = new Map(state.tradeVelocity)
      const now = Date.now()
      const trades = newMap.get(mint) || []
      const recentTrades = trades.filter((t) => now - t < 1000)
      recentTrades.push(now)
      newMap.set(mint, recentTrades)
      return { tradeVelocity: newMap }
    }),

  addToVolume: (mint, solAmount) =>
    set((state) => {
      const newMap = new Map(state.tokenVolumes)
      const current = newMap.get(mint) || 0
      newMap.set(mint, current + solAmount)
      return { tokenVolumes: newMap }
    }),

  getTradeVelocity: (mint) => {
    const trades = get().tradeVelocity.get(mint) || []
    const now = Date.now()
    return trades.filter((t) => now - t < 1000).length
  },

  incrementPackets: () => set((state) => ({ packetsReceived: state.packetsReceived + 1 })),
  setLatency: (ms) => set({ latency: ms }),
}))
