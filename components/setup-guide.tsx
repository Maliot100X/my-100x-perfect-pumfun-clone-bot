"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HelpCircle, Terminal, Copy, Check } from "lucide-react"

export function SetupGuide() {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const installCommand =
    "npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/wallet-adapter-base"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono gap-2 bg-transparent">
          <HelpCircle className="h-4 w-4" />
          SETUP GUIDE
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-[#0a0d14] border-primary/50">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl text-primary flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            GOD MODE SETUP GUIDE
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[600px] pr-4">
          <div className="space-y-6">
            {/* Installation */}
            <div className="space-y-3">
              <h3 className="font-mono text-sm font-bold text-primary">1. INSTALL DEPENDENCIES</h3>
              <p className="text-sm text-muted-foreground">
                Run this command in your terminal to install all required Solana packages:
              </p>
              <div className="relative">
                <div className="rounded-lg bg-black/50 border border-border p-4 font-mono text-xs overflow-x-auto">
                  <code className="text-green-400">{installCommand}</code>
                </div>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-3">
              <h3 className="font-mono text-sm font-bold text-primary">2. CONFIGURE WALLET PROVIDER</h3>
              <p className="text-sm text-muted-foreground">
                The wallet adapter is already configured in <code className="text-primary">app/layout.tsx</code>. Make
                sure you have Phantom or Solflare installed in your browser.
              </p>
            </div>

            {/* Bot Configuration */}
            <div className="space-y-3">
              <h3 className="font-mono text-sm font-bold text-primary">3. CONFIGURE YOUR BOTS</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-bold text-foreground">7 Trading Bots Available:</p>
                <ul className="space-y-1 pl-4">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">💜</span>
                    <div>
                      <span className="font-mono text-purple-400">GOD MODE:</span> Master AI that combines all filters.
                      Auto-snipes when confidence score {">"} 90
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">💧</span>
                    <div>
                      <span className="font-mono text-green-400">LIQUIDITY SNIPER:</span> Front-runs token launches with
                      custom block delays and Jito tips
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">👥</span>
                    <div>
                      <span className="font-mono text-blue-400">COPY TRADER:</span> Mirrors successful wallets with
                      configurable copy percentage
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">🛡️</span>
                    <div>
                      <span className="font-mono text-red-400">RUG SHIELD:</span> Prevents buying scam tokens with
                      mint/freeze auth checks
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">🔮</span>
                    <div>
                      <span className="font-mono text-yellow-400">MEMPOOL WATCHER:</span> Monitors pending transactions
                      for whale activity
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">🎓</span>
                    <div>
                      <span className="font-mono text-cyan-400">GRADUATION BOT:</span> Snipes tokens at bonding curve
                      milestones before Raydium migration
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400">⚔️</span>
                    <div>
                      <span className="font-mono text-orange-400">SCALP BOT:</span> Quick profit-taking with
                      configurable TP/SL levels
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Trading Modes */}
            <div className="space-y-3">
              <h3 className="font-mono text-sm font-bold text-primary">4. TRADING MODES</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
                  <div className="font-mono text-xs font-bold text-green-400 mb-2">🧪 SIMULATOR MODE</div>
                  <p className="text-xs text-muted-foreground">
                    Practice with 100 SOL virtual balance. Uses real live prices but no actual transactions.
                  </p>
                </div>
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                  <div className="font-mono text-xs font-bold text-red-400 mb-2">⚠️ LIVE MAINNET</div>
                  <p className="text-xs text-muted-foreground">
                    Real trading with your wallet. Requires wallet connection and SOL balance.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Start */}
            <div className="space-y-3">
              <h3 className="font-mono text-sm font-bold text-primary">5. QUICK START</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
                <li>Enable one or more bots using the toggles in the sidebar</li>
                <li>Configure bot settings (all default to 0.1 SOL buy amount)</li>
                <li>Toggle between SIMULATOR and LIVE MAINNET modes</li>
                <li>Watch the live feed and let the bots auto-trade, or manually buy tokens</li>
                <li>Monitor your positions in the Portfolio Dock at the bottom</li>
              </ol>
            </div>

            {/* Warning */}
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4">
              <div className="font-mono text-xs font-bold text-yellow-400 mb-2">⚠️ IMPORTANT DISCLAIMER</div>
              <p className="text-xs text-muted-foreground">
                This is a demonstration application. Live trading with real funds carries significant risk. Always test
                in simulator mode first and only trade with funds you can afford to lose.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
