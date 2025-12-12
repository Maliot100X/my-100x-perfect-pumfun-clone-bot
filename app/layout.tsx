import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SolanaWalletProvider } from "@/components/wallet-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PumpSniper - Solana Trading Terminal",
  description: "Real-time Solana token trading with 7-bot arsenal",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#10141f",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
