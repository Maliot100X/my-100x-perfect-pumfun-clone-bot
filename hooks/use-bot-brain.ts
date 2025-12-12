"use client"

import { useEffect, useRef, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { VersionedTransaction, TransactionMessage, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { usePumpStore } from "@/lib/store"
import type { EnrichedToken } from "@/lib/types"

export function useBotBrain() {
  const processedTokensRef = useRef<Set<string>>(new Set())
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()

  const {
    latestToken,
    latestTrade,
    botConfigs,
    openPositions,
    simulateBuy,
    sellPosition,
    addLog,
    isLiveMode,
    trailingStops,
    setTrailingStop,
    getTradeVelocity,
    tokenVolumes,
  } = usePumpStore()

  // ==================================================
  // HANDLE BUY - Sim mode vs Live mode with real tx
  // ==================================================
  const handleBuy = useCallback(
    async (token: EnrichedToken, solAmount: number, source: string) => {
      if (!isLiveMode) {
        return simulateBuy(token, solAmount, source)
      }

      // LIVE MODE - Real transaction boilerplate
      if (!publicKey) {
        addLog("ERROR", "Wallet not connected for live trading")
        return false
      }

      try {
        addLog(source, `Preparing LIVE buy for $${token.symbol}...`)

        // Boilerplate for VersionedTransaction construction
        // In production, this would interact with pump.fun's bonding curve program
        const { blockhash } = await connection.getLatestBlockhash()

        // Example transaction structure (placeholder for actual pump.fun interaction)
        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: blockhash,
          instructions: [
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: new PublicKey(token.bondingCurveKey),
              lamports: solAmount * LAMPORTS_PER_SOL,
            }),
          ],
        }).compileToV0Message()

        const transaction = new VersionedTransaction(messageV0)
        const signature = await sendTransaction(transaction, connection)

        addLog(source, `LIVE TX sent: ${signature.slice(0, 8)}...`)
        return true
      } catch (err) {
        addLog("ERROR", `Live buy failed: ${err instanceof Error ? err.message : "Unknown error"}`)
        return false
      }
    },
    [isLiveMode, publicKey, connection, sendTransaction, simulateBuy, addLog],
  )

  // ==================================================
  // BOT 1: GOD MODE
  // Triggers BUY if: Tx Velocity > 2/sec AND Volume > 5 SOL AND Top 10 Holders < 15%
  // ==================================================
  useEffect(() => {
    if (!botConfigs.godMode.enabled || !latestToken) return
    if (processedTokensRef.current.has(`god-${latestToken.mint}`)) return

    const velocity = getTradeVelocity(latestToken.mint)
    const volume = tokenVolumes.get(latestToken.mint) || 0
    const topHolderPercent = latestToken.topHolderPercent || 10

    const riskMultiplier = { low: 0.5, med: 1, high: 1.5 }[botConfigs.godMode.riskLevel]
    const velocityThreshold = 2 * riskMultiplier
    const volumeThreshold = 5 / riskMultiplier

    if (velocity > velocityThreshold && volume > volumeThreshold && topHolderPercent < 15) {
      processedTokensRef.current.add(`god-${latestToken.mint}`)
      addLog("GOD-MODE", `Signal: V=${velocity}/s VOL=${volume.toFixed(1)}SOL → BUY $${latestToken.symbol}`)
      handleBuy(latestToken, 0.5, "GOD-MODE")
    }
  }, [latestToken, botConfigs.godMode, getTradeVelocity, tokenVolumes, handleBuy, addLog])

  // ==================================================
  // BOT 2: LIQUIDITY SNIPER
  // Triggers BUY if Token Age < 2000ms
  // ==================================================
  useEffect(() => {
    if (!botConfigs.liquiditySniper.enabled || !latestToken) return
    if (processedTokensRef.current.has(`sniper-${latestToken.mint}`)) return

    const tokenAge = Date.now() - latestToken.createdAt
    if (tokenAge < 2000) {
      processedTokensRef.current.add(`sniper-${latestToken.mint}`)
      const delay = botConfigs.liquiditySniper.blockDelay * 400

      addLog("SNIPER", `New token $${latestToken.symbol} age=${tokenAge}ms, delay=${delay}ms`)

      setTimeout(() => {
        handleBuy(latestToken, 0.5, "SNIPER")
      }, delay)
    }
  }, [latestToken, botConfigs.liquiditySniper, handleBuy, addLog])

  // ==================================================
  // BOT 3: COPY TRADER
  // Mirrors target wallet's buy transactions
  // ==================================================
  useEffect(() => {
    if (!botConfigs.copyTrader.enabled || !latestTrade) return
    if (!botConfigs.copyTrader.targetWallet) return

    const targetWallet = botConfigs.copyTrader.targetWallet.toLowerCase()
    const traderKey = latestTrade.traderPublicKey.toLowerCase()

    if (traderKey === targetWallet && latestTrade.isBuy) {
      const token = usePumpStore.getState().tokens.find((t) => t.mint === latestTrade.mint)
      if (token && !processedTokensRef.current.has(`copy-${latestTrade.mint}-${latestTrade.timestamp}`)) {
        processedTokensRef.current.add(`copy-${latestTrade.mint}-${latestTrade.timestamp}`)
        addLog("COPY-TRADE", `Mirroring ${targetWallet.slice(0, 8)}... → BUY $${token.symbol}`)
        handleBuy(token, botConfigs.copyTrader.copyAmount, "COPY-TRADE")
      }
    }
  }, [latestTrade, botConfigs.copyTrader, handleBuy, addLog])

  // ==================================================
  // BOT 4: RUG SHIELD
  // Auto-SELL if Mint Authority not disabled in 5 mins OR Liquidity < $1k
  // ==================================================
  useEffect(() => {
    if (!botConfigs.rugShield.enabled || openPositions.length === 0) return

    const rugCheckInterval = setInterval(() => {
      const now = Date.now()

      openPositions.forEach((position) => {
        const holdTime = now - position.entryTime
        const fiveMinutes = 5 * 60 * 1000

        // Simulate checking mint authority (random 2% chance of rug signal per check)
        const mintAuthorityNotDisabled = holdTime > fiveMinutes && Math.random() < 0.02
        const lowLiquidity = position.token.marketCapUsd < 1000

        if (mintAuthorityNotDisabled || lowLiquidity) {
          const reason = lowLiquidity ? "LOW LIQUIDITY" : "MINT AUTHORITY RISK"
          addLog("RUG-SHIELD", `${reason} on $${position.token.symbol} - EMERGENCY SELL`)
          sellPosition(position.id, 100, "RUG-SHIELD")
        }

        // Force sell if toggle is on and any warning
        if (botConfigs.rugShield.emergencyForceSell && Math.random() < 0.01) {
          addLog("RUG-SHIELD", `Force sell triggered on $${position.token.symbol}`)
          sellPosition(position.id, 100, "FORCE-SELL")
        }
      })
    }, 3000)

    return () => clearInterval(rugCheckInterval)
  }, [botConfigs.rugShield, openPositions, sellPosition, addLog])

  // ==================================================
  // BOT 5: MEMPOOL WATCHER
  // Front-runs large purchases (> minWhaleSize SOL)
  // ==================================================
  useEffect(() => {
    if (!botConfigs.mempoolWatcher.enabled || !latestTrade) return

    if (latestTrade.isBuy && latestTrade.solAmount >= botConfigs.mempoolWatcher.minWhaleSize) {
      const token = usePumpStore.getState().tokens.find((t) => t.mint === latestTrade.mint)
      if (token && !processedTokensRef.current.has(`whale-${latestTrade.mint}-${latestTrade.timestamp}`)) {
        processedTokensRef.current.add(`whale-${latestTrade.mint}-${latestTrade.timestamp}`)
        addLog("WHALE-WATCH", `${latestTrade.solAmount.toFixed(1)} SOL whale on $${token.symbol} → FRONT-RUN`)
        handleBuy(token, 0.5, "WHALE-WATCH")
      }
    }
  }, [latestTrade, botConfigs.mempoolWatcher, handleBuy, addLog])

  // ==================================================
  // BOT 6: GRADUATION BOT
  // Buys when bondingCurveProgress > 90%
  // ==================================================
  useEffect(() => {
    if (!botConfigs.graduationBot.enabled || !latestToken) return
    if (processedTokensRef.current.has(`grad-${latestToken.mint}`)) return

    if (latestToken.bondingCurveProgress > 90) {
      processedTokensRef.current.add(`grad-${latestToken.mint}`)
      addLog("GRADUATION", `$${latestToken.symbol} at ${latestToken.bondingCurveProgress.toFixed(1)}% → BUY`)
      handleBuy(latestToken, 0.5, "GRADUATION")
    }
  }, [latestToken, botConfigs.graduationBot, handleBuy, addLog])

  // ==================================================
  // BOT 7: SCALP BOT
  // Auto-sets limit orders immediately after buy
  // ==================================================
  useEffect(() => {
    if (!botConfigs.scalpBot.enabled || openPositions.length === 0) return

    openPositions.forEach((position) => {
      const pnl = position.pnlPercent
      const tp = botConfigs.scalpBot.takeProfitPercent
      const sl = -botConfigs.scalpBot.stopLossPercent

      if (pnl >= tp) {
        addLog("SCALP", `Take Profit +${tp}% hit on $${position.token.symbol}`)
        sellPosition(position.id, 100, "SCALP-TP")
      } else if (pnl <= sl) {
        addLog("SCALP", `Stop Loss ${sl}% hit on $${position.token.symbol}`)
        sellPosition(position.id, 100, "SCALP-SL")
      }
    })
  }, [botConfigs.scalpBot, openPositions, sellPosition, addLog])

  // ==================================================
  // GOD MODE TRAILING STOP
  // If PnL hits +15%, move Stop Loss to +10%
  // ==================================================
  useEffect(() => {
    if (!botConfigs.godMode.enabled || openPositions.length === 0) return

    openPositions.forEach((position) => {
      const pnl = position.pnlPercent
      const currentStop = trailingStops.get(position.id) ?? -100

      if (pnl >= 15 && currentStop < 10) {
        setTrailingStop(position.id, 10)
        addLog("GOD-MODE", `Trailing stop activated: $${position.token.symbol} → SL at +10%`)
      }

      if (currentStop > -100 && pnl < currentStop) {
        addLog("GOD-MODE", `Trailing stop triggered on $${position.token.symbol} at ${pnl.toFixed(1)}%`)
        sellPosition(position.id, 100, "GOD-TRAILING")
      }
    })
  }, [botConfigs.godMode.enabled, openPositions, trailingStops, setTrailingStop, sellPosition, addLog])

  // Cleanup old processed tokens
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (processedTokensRef.current.size > 500) {
        processedTokensRef.current.clear()
      }
    }, 60000)
    return () => clearInterval(cleanup)
  }, [])
}
