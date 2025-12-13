export const CONFIG = {
  // Network configuration - supports DEVNET, TESTNET, MAINNET
  NETWORK: (process.env.NEXT_PUBLIC_NETWORK || "DEVNET") as "DEVNET" | "TESTNET" | "MAINNET",

  // RPC endpoints for each network
  RPC_ENDPOINTS: {
    DEVNET: process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET || "https://api.devnet.solana.com",
    TESTNET: process.env.NEXT_PUBLIC_SOLANA_RPC_TESTNET || "https://api.testnet.solana.com",
    MAINNET: process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET || process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
  },

  // Trading bot keypair (server-side only, NEVER exposed to frontend)
  BOT_PRIVATE_KEY: process.env.BOT_PRIVATE_KEY || "",

  // Jito Block Engine for MEV protection
  JITO_BLOCK_ENGINE_URL: process.env.JITO_BLOCK_ENGINE_URL || "https://amsterdam.mainnet.block-engine.jito.wtf",

  // Trading parameters
  TRADING: {
    DEFAULT_BUY_AMOUNT: 0.1, // SOL
    GLOBAL_STOP_LOSS: -30, // -30%
    PARTIAL_TAKE_PROFIT: 100, // +100% (2x)
    PARTIAL_SELL_PERCENT: 50, // Sell 50% at take profit
    MAX_DEV_BUY_PERCENT: 20, // Skip if dev holds >20%
    MIN_HOLDERS: 10, // Minimum holder count for safety
  },

  // Risk analysis thresholds
  RISK: {
    MINT_AUTHORITY_WEIGHT: 30,
    FREEZE_AUTHORITY_WEIGHT: 30,
    HIGH_CONCENTRATION_WEIGHT: 25,
    LIQUIDITY_RISK_WEIGHT: 15,
    DANGER_THRESHOLD: 70, // Score > 70 = DANGER
    WARNING_THRESHOLD: 40, // Score > 40 = WARNING
  },

  // Mempool watcher configuration
  MEMPOOL: {
    POLL_INTERVAL: 500, // ms - normal mode
    FRONT_RUN_POLL_INTERVAL: 200, // ms - aggressive mode
    SLOT_CHECK_INTERVAL: 400, // ms
    LATENCY_CHECK_INTERVAL: 5000, // ms
  },

  // Front-run mode (reactive speed trading)
  FRONT_RUN: {
    ENABLED: false,
    PRIORITY_FEE_MULTIPLIER: 3,
    JITO_TIP_MULTIPLIER: 2,
    EXIT_SPEED_MULTIPLIER: 2,
  },
}

export function getCurrentRPC(): string {
  return CONFIG.RPC_ENDPOINTS[CONFIG.NETWORK]
}

export function setNetwork(network: "DEVNET" | "TESTNET" | "MAINNET") {
  CONFIG.NETWORK = network
  console.log(`[Backend] Network switched to ${network}`)
  console.log(`[Backend] Using RPC: ${getCurrentRPC()}`)
}

export function enableFrontRunMode(enabled: boolean) {
  CONFIG.FRONT_RUN.ENABLED = enabled
  console.log(`[Backend] Front-Run Mode: ${enabled ? "ENABLED" : "DISABLED"}`)
}
