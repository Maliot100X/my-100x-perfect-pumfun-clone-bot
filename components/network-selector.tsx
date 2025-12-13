"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Network, ChevronDown } from "lucide-react"
import { useBackendAPI } from "@/hooks/use-backend-api"

export function NetworkSelector() {
  const { status, switchNetwork, isLoading } = useBackendAPI()
  const [isOpen, setIsOpen] = useState(false)

  const currentNetwork = status?.network || "DEVNET"

  const handleNetworkSwitch = async (network: "DEVNET" | "TESTNET" | "MAINNET") => {
    const result = await switchNetwork(network)
    if (result.success) {
      setIsOpen(false)
    }
  }

  const getNetworkColor = (network: string) => {
    switch (network) {
      case "MAINNET":
        return "text-red-400"
      case "TESTNET":
        return "text-yellow-400"
      case "DEVNET":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`font-mono gap-2 ${getNetworkColor(currentNetwork)} border-${currentNetwork === "MAINNET" ? "red" : currentNetwork === "TESTNET" ? "yellow" : "green"}-500/50`}
          disabled={isLoading}
        >
          <Network className="h-4 w-4" />
          {currentNetwork === "MAINNET" && "LIVE MAINNET"}
          {currentNetwork === "TESTNET" && "TESTNET"}
          {currentNetwork === "DEVNET" && "DEVNET"}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="font-mono">
        <DropdownMenuItem onClick={() => handleNetworkSwitch("DEVNET")} className="text-green-400">
          <Network className="mr-2 h-4 w-4" />
          DEVNET (Development)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNetworkSwitch("TESTNET")} className="text-yellow-400">
          <Network className="mr-2 h-4 w-4" />
          TESTNET (Testing)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNetworkSwitch("MAINNET")} className="text-red-400">
          <Network className="mr-2 h-4 w-4" />
          MAINNET (Live Trading)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
