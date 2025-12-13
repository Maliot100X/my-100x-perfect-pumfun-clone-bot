"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useBackendAPI } from "@/hooks/use-backend-api"
import { Bot, Zap, AlertTriangle } from "lucide-react"

export function AutomationControls() {
  const { status, startAutomation, stopAutomation, panicSell, isLoading } = useBackendAPI()

  const handleToggleAutomation = async () => {
    if (status?.isRunning) {
      await stopAutomation()
    } else {
      await startAutomation()
    }
  }

  const handlePanicSell = async () => {
    if (confirm("PANIC SELL ALL POSITIONS? This action is irreversible!")) {
      const result = await panicSell()
      if (result.success) {
        alert(`Panic sell complete: ${result.soldCount} positions closed`)
      } else {
        alert(`Error: ${result.error}`)
      }
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* AI AUTOMATION Toggle */}
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 transition-all ${
          status?.isRunning ? "bg-green-500/20 border-green-500/50 animate-pulse" : "bg-gray-800/50 border-gray-700"
        }`}
      >
        <Bot className={`h-5 w-5 ${status?.isRunning ? "text-green-400" : "text-gray-400"}`} />
        <div className="font-mono text-xs">
          <div className="font-bold">AI AUTOMATION</div>
          <div className={status?.isRunning ? "text-green-400" : "text-gray-400"}>
            {status?.isRunning ? "RUNNING" : "STOPPED"}
          </div>
        </div>
        <Switch checked={status?.isRunning || false} onCheckedChange={handleToggleAutomation} disabled={isLoading} />
      </div>

      {/* Front-Run Mode Badge */}
      {status?.frontRunMode && (
        <Badge variant="default" className="font-mono animate-pulse">
          <Zap className="mr-1 h-3 w-3" />
          FRONT-RUN MODE
        </Badge>
      )}

      {/* Mempool Watcher Status */}
      {status?.mempoolActive && (
        <Badge variant="secondary" className="font-mono">
          <span className="mr-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          MEMPOOL WATCHER ACTIVATED
        </Badge>
      )}

      {/* Panic Sell Button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={handlePanicSell}
        disabled={isLoading || !status?.isRunning || (status?.openPositions || 0) === 0}
        className="font-mono font-bold"
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        PANIC SELL
      </Button>
    </div>
  )
}
