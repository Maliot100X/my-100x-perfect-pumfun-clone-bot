"use client"

import { useEffect, useRef, useCallback } from "react"
import { usePumpStore } from "@/lib/store"
import type { EnrichedToken } from "@/lib/types"

export function useBotBrain() {
  const processedTokensRef = useRef<Set<string>>(new Set())

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
  // HANDLE BUY - Sim mode only for now
  // ==================================================
  const handleBuy = useCallback(
    async (token: EnrichedToken, solAmount: number, source: string) => {
      if (!isLiveMode) {
        return simulateBuy(token, solAmount, source)
      }

      // LIVE MODE - Would require real Solana wallet integration
      addLog("ERROR", "Live trading requires Solana wallet setup. Use simulator mode.")
      return false
    },
    [isLiveMode, simulateBuy, addLog],
  )

  // ==================================================
  // BOT 1: GOD MODE
  // Triggers BUY if: Tx Velocity > minVelocity AND Volume > minVolume
  // ==================================================
  useEffect(() => {
    if (!botConfigs.godMode.enabled || !latestToken) return
    if (processedTokensRef.current.has(`god-${latestToken.mint}`)) return

    const velocity = getTradeVelocity(latestToken.mint)
    const volume = tokenVolumes.get(latestToken.mint) || 0
    const { minVelocity, minVolume } = botConfigs.godMode

    if (velocity > minVelocity && volume > minVolume) {
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
      const { blockDelay, snipeAmount, tipSol } = botConfigs.liquiditySniper
      const delay = blockDelay * 400

      addLog("SNIPER", `New token $${latestToken.symbol} age=${tokenAge}ms, delay=${delay}ms, tip=${tipSol}`)

      setTimeout(() => {
        handleBuy(latestToken, snipeAmount, "SNIPER")
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
        const copyAmount = (latestTrade.solAmount * botConfigs.copyTrader.copyPercent) / 100
        addLog("COPY-TRADE", `Mirroring ${targetWallet.slice(0, 8)}... → BUY $${token.symbol} (${copyAmount} SOL)`)
        handleBuy(token, copyAmount, "COPY-TRADE")
      }
    }
  }, [latestTrade, botConfigs.copyTrader, handleBuy, addLog])

  // ==================================================
  // BOT 4: RUG SHIELD
  // Auto-SELL if conditions fail
  // ==================================================
  useEffect(() => {
    if (!botConfigs.rugShield.enabled || openPositions.length === 0) return

    const { timeLimit, minHolders } = botConfigs.rugShield
    const timeLimitMs = timeLimit * 60 * 1000

    const rugCheckInterval = setInterval(() => {
      const now = Date.now()

      openPositions.forEach((position) => {
        const holdTime = now - position.entryTime

        const timeExceeded = holdTime > timeLimitMs
        const lowHolders = position.token.topHolderPercent > 100 / minHolders

        if (timeExceeded && lowHolders) {
          addLog("RUG-SHIELD", `Time ${timeLimit}m exceeded + Low holders on $${position.token.symbol} - SELL`)
          sellPosition(position.id, 100, "RUG-SHIELD")
        }
      })
    }, 3000)

    return () => clearInterval(rugCheckInterval)
  }, [botConfigs.rugShield, openPositions, sellPosition, addLog])

  // ==================================================
  // BOT 5: MEMPOOL WATCHER
  // Front-runs large purchases
  // ==================================================
  useEffect(() => {
    if (!botConfigs.mempoolWatcher.enabled || !latestTrade) return

    const { whaleThreshold } = botConfigs.mempoolWatcher

    if (latestTrade.isBuy && latestTrade.solAmount >= whaleThreshold) {
      const token = usePumpStore.getState().tokens.find((t) => t.mint === latestTrade.mint)
      if (token && !processedTokensRef.current.has(`whale-${latestTrade.mint}-${latestTrade.timestamp}`)) {
        processedTokensRef.current.add(`whale-${latestTrade.mint}-${latestTrade.timestamp}`)
        addLog("WHALE-WATCH", `${latestTrade.solAmount.toFixed(1)} SOL whale (>=${whaleThreshold}) on $${token.symbol}`)
        handleBuy(token, 0.5, "WHALE-WATCH")
      }
    }
  }, [latestTrade, botConfigs.mempoolWatcher, handleBuy, addLog])

  // ==================================================
  // BOT 6: GRADUATION BOT
  // Buys when bondingCurveProgress > entryProgress%
  // ==================================================
  useEffect(() => {
    if (!botConfigs.graduationBot.enabled || !latestToken) return
    if (processedTokensRef.current.has(`grad-${latestToken.mint}`)) return

    const { entryProgress } = botConfigs.graduationBot

    if (latestToken.bondingCurveProgress >= entryProgress) {
      processedTokensRef.current.add(`grad-${latestToken.mint}`)
      addLog(
        "GRADUATION",
        `$${latestToken.symbol} at ${latestToken.bondingCurveProgress.toFixed(1)}% (>=${entryProgress}%) → BUY`,
      )
      handleBuy(latestToken, 0.5, "GRADUATION")
    }
  }, [latestToken, botConfigs.graduationBot, handleBuy, addLog])

  // ==================================================
  // Graduation Bot Exit Logic
  // Sell when bondingCurveProgress > exitProgress%
  // ==================================================
  useEffect(() => {
    if (!botConfigs.graduationBot.enabled || openPositions.length === 0) return

    const { exitProgress } = botConfigs.graduationBot

    openPositions.forEach((position) => {
      if (position.token.bondingCurveProgress >= exitProgress) {
        addLog("GRADUATION", `$${position.token.symbol} reached ${exitProgress}% → SELL before migration`)
        sellPosition(position.id, 100, "GRAD-EXIT")
      }
    })
  }, [botConfigs.graduationBot, openPositions, sellPosition, addLog])

  // ==================================================
  // BOT 7: SCALP BOT
  // Auto-sets limit orders
  // ==================================================
  useEffect(() => {
    if (!botConfigs.scalpBot.enabled || openPositions.length === 0) return

    const { takeProfit, stopLoss } = botConfigs.scalpBot

    openPositions.forEach((position) => {
      const pnl = position.pnlPercent

      if (pnl >= takeProfit) {
        addLog("SCALP", `Take Profit +${takeProfit}% hit on $${position.token.symbol}`)
        sellPosition(position.id, 100, "SCALP-TP")
      } else if (pnl <= -stopLoss) {
        addLog("SCALP", `Stop Loss -${stopLoss}% hit on $${position.token.symbol}`)
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
