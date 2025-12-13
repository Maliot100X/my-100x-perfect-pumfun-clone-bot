import { type Connection, PublicKey } from "@solana/web3.js"
import { CONFIG } from "./config"

export interface RiskAnalysis {
  riskScore: number // 0-100
  classification: "SAFE" | "WARNING" | "DANGER"
  signals: string[]
  shouldSell: boolean
}

export class RiskAnalyzer {
  private connection: Connection

  constructor(connection: Connection) {
    this.connection = connection
  }

  async analyzeToken(mintAddress: string): Promise<RiskAnalysis> {
    const signals: string[] = []
    let riskScore = 0

    try {
      const mintPubkey = new PublicKey(mintAddress)
      const mintInfo = await this.connection.getParsedAccountInfo(mintPubkey)

      if (!mintInfo.value) {
        signals.push("Token account not found")
        return { riskScore: 100, classification: "DANGER", signals, shouldSell: true }
      }

      const data = mintInfo.value.data
      if ("parsed" in data) {
        const parsed = data.parsed

        // Check mint authority
        if (parsed.info.mintAuthority) {
          riskScore += CONFIG.RISK.MINT_AUTHORITY_WEIGHT
          signals.push("⚠️ Mint authority enabled - dev can mint more tokens")
        }

        // Check freeze authority
        if (parsed.info.freezeAuthority) {
          riskScore += CONFIG.RISK.FREEZE_AUTHORITY_WEIGHT
          signals.push("⚠️ Freeze authority enabled - dev can freeze transfers")
        }

        // Check holder concentration
        const holderData = await this.analyzeHolderConcentration(mintAddress)
        if (holderData.topHolderPercent > 60) {
          riskScore += CONFIG.RISK.HIGH_CONCENTRATION_WEIGHT
          signals.push(`⚠️ High concentration: Top holder owns ${holderData.topHolderPercent}%`)
        }

        // Check for honeypot indicators
        const honeypotRisk = await this.checkHoneypotIndicators(mintAddress)
        if (honeypotRisk > 0) {
          riskScore += honeypotRisk
          signals.push("⚠️ Potential honeypot detected")
        }
      }

      // Classify risk level
      let classification: "SAFE" | "WARNING" | "DANGER"
      if (riskScore >= CONFIG.RISK.DANGER_THRESHOLD) {
        classification = "DANGER"
      } else if (riskScore >= CONFIG.RISK.WARNING_THRESHOLD) {
        classification = "WARNING"
      } else {
        classification = "SAFE"
        signals.push("✅ Token appears safe")
      }

      const shouldSell = classification === "DANGER"

      return { riskScore, classification, signals, shouldSell }
    } catch (error) {
      console.error("[RiskAnalyzer] Error:", error)
      return {
        riskScore: 50,
        classification: "WARNING",
        signals: ["Error analyzing token - proceed with caution"],
        shouldSell: false,
      }
    }
  }

  private async analyzeHolderConcentration(mintAddress: string): Promise<{ topHolderPercent: number }> {
    // Mock implementation - in production, query token accounts
    // This would analyze the top 20 holders and calculate concentration
    return { topHolderPercent: Math.random() * 40 + 10 } // Random 10-50%
  }

  private async checkHoneypotIndicators(mintAddress: string): Promise<number> {
    // Mock implementation - in production, check for:
    // - Transfer restrictions
    // - Blacklist functions
    // - Sudden supply changes
    return Math.random() > 0.9 ? CONFIG.RISK.LIQUIDITY_RISK_WEIGHT : 0
  }
}
