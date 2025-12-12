"use client"

import { usePumpStore } from "@/lib/store"
import { Wifi, WifiOff, Loader2, RefreshCw, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConnectionDebuggerProps {
  onForceReconnect: () => void
}

export function ConnectionDebugger({ onForceReconnect }: ConnectionDebuggerProps) {
  const { isConnected, error, packetsReceived, latency } = usePumpStore()

  const isConnecting = error === "connecting"
  const isError = error === "error"

  const getStatusText = () => {
    if (isConnected) return "ONLINE"
    if (isConnecting) return "CONNECTING"
    return "ERROR"
  }

  const getStatusColor = () => {
    if (isConnected) return "text-green-400"
    if (isConnecting) return "text-yellow-400"
    return "text-red-400"
  }

  const getBgColor = () => {
    if (isConnected) return "bg-green-500/10 border-green-500/30"
    if (isConnecting) return "bg-yellow-500/10 border-yellow-500/30"
    return "bg-red-500/10 border-red-500/30"
  }

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 rounded-lg border p-3 font-mono text-xs backdrop-blur-sm ${getBgColor()}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Radio className={`h-3.5 w-3.5 ${getStatusColor()}`} />
        <span className="font-bold text-muted-foreground">CONNECTION DEBUGGER</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className={`h-3.5 w-3.5 ${getStatusColor()}`} />
          ) : isConnecting ? (
            <Loader2 className={`h-3.5 w-3.5 animate-spin ${getStatusColor()}`} />
          ) : (
            <WifiOff className={`h-3.5 w-3.5 ${getStatusColor()}`} />
          )}
          <span className="text-muted-foreground">Status:</span>
          <span className={`font-bold ${getStatusColor()}`}>{getStatusText()}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Packets Received:</span>
          <span className="font-bold text-primary">{packetsReceived.toLocaleString()}</span>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Latency:</span>
            <span className="font-bold text-green-400">{latency}ms</span>
          </div>
        )}
      </div>

      {(isError || (!isConnected && !isConnecting)) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onForceReconnect}
          className="mt-2 h-6 w-full px-2 text-xs gap-1 hover:bg-red-500/20 text-red-400 hover:text-red-300"
        >
          <RefreshCw className="h-3 w-3" />
          FORCE RECONNECT
        </Button>
      )}
    </div>
  )
}
