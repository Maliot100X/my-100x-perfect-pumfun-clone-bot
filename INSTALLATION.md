# PumpKing Killer - Installation Guide

## Prerequisites

- Node.js 18+ installed
- A Solana wallet with a funded private key
- RPC endpoint (recommended: Helius or QuickNode)
- Jito Block Engine access (optional but recommended for MEV protection)

## Installation Steps

### 1. Install Dependencies

Run the following commands in order:

\`\`\`bash
# Install Solana and Jito dependencies first
npm install --force @solana/web3.js jito-ts @solana/spl-token bs58

# Install all other dependencies
npm install
\`\`\`

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` and add your configuration:

\`\`\`env
# Solana RPC (use a premium endpoint for best performance)
RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Your bot wallet private key (base58 encoded)
# CRITICAL: Never commit this to git or share publicly
BOT_PRIVATE_KEY=your_private_key_here

# Jito Block Engine Configuration
JITO_BLOCK_ENGINE_URL=https://amsterdam.mainnet.block-engine.jito.wtf

# Autonoma API (for Copy Trading features)
AUTONOMA_CLIENT_ID=your_client_id
AUTONOMA_SECRET_ID=your_secret_id
\`\`\`

### 3. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Security Best Practices

1. **Never share your private key** - Keep your `.env.local` file secure
2. **Use a dedicated bot wallet** - Don't use your main wallet for trading
3. **Start with small amounts** - Test thoroughly before scaling up
4. **Monitor your trades** - Always keep an eye on the System Logs tab
5. **Set stop losses** - Use the Take Profit % and Stop Loss % settings

## Features Overview

### Dashboard Tabs

- **Live Token Feed** - Real-time pump.fun token creation monitoring
- **System Logs** - All bot activity and trade execution logs
- **Killer Mode** - Advanced sniper with Jito bundle execution
- **My Wallet** - Portfolio overview and balance management

### Killer Mode Settings

- **Sniper Engine** - Master on/off switch for automated trading
- **SOL Buy Amount** - Amount to spend per snipe (0.1 - 10 SOL)
- **Jito Bribe** - Priority fee for MEV protection (0.01, 0.1, or 1.0 SOL)
- **Take Profit %** - Automatic sell when profit target reached
- **Stop Loss %** - Automatic sell when loss threshold reached
- **AI Rug Defense** - Monitors holder distribution for potential rugs

## Troubleshooting

### "crypto.randomUUID is not a function"
This has been fixed in the latest version. The store now uses `Date.now()` for ID generation.

### Wallet connection issues
The current implementation uses a mock wallet provider. For production use with real wallet connections, you'll need to implement the full Solana wallet adapter.

### RPC rate limiting
Use a premium RPC endpoint (Helius, QuickNode) to avoid rate limiting issues.

## Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### Security Checklist

- [ ] Private key is stored in Vercel environment variables (never in code)
- [ ] RPC endpoint is configured with authentication
- [ ] Stop loss settings are configured
- [ ] Wallet has appropriate balance for trading
- [ ] System logs are being monitored

## Support

For issues or questions:
- Check the System Logs tab for error messages
- Review the console output in your terminal
- Ensure all environment variables are correctly set

## Disclaimer

This is a trading bot that can execute real transactions. Use at your own risk. Always test with small amounts first and never trade more than you can afford to lose.
