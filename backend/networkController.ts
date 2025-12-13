import { Connection } from "@solana/web3.js"
import { CONFIG } from "./config"

export class NetworkController {
  private connection: Connection | null = null
  private currentNetwork: "DEVNET" | "TESTNET" | "MAINNET" = "DEVNET"

  constructor() {
    this.switchNetwork("DEVNET")
  }

  switchNetwork(network: "DEVNET" | "TESTNET" | "MAINNET") {
    this.currentNetwork = network
    const rpcUrl = CONFIG.RPC_ENDPOINTS[network]

    this.connection = new Connection(rpcUrl, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    })

    console.log(`[NetworkController] Switched to ${network}`)
    console.log(`[NetworkController] RPC: ${rpcUrl}`)

    return this.connection
  }

  getConnection(): Connection {
    if (!this.connection) {
      throw new Error("Network not initialized. Call switchNetwork() first.")
    }
    return this.connection
  }

  getCurrentNetwork() {
    return this.currentNetwork
  }

  async getLatency(): Promise<number> {
    if (!this.connection) return 0

    const start = Date.now()
    try {
      await this.connection.getSlot()
      return Date.now() - start
    } catch {
      return 9999
    }
  }

  async isOnline(): Promise<boolean> {
    if (!this.connection) return false

    try {
      await this.connection.getSlot()
      return true
    } catch {
      return false
    }
  }
}

// Singleton instance
export const networkController = new NetworkController()
