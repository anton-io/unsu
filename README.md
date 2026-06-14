# unsu.com

A crypto wallet that works in any browser. No apps, no extensions, no accounts.

## The Problem

Sending and receiving crypto today requires navigating app stores, browser extensions, identity verification, multi-step authentication, and dozens of confusing options. Most people give up before their first transaction.

## The Solution

Open a browser. Enter your secret phrase. Send or receive value. That's it.

**Live at https://unsu.com**

## Why unsu

- **No downloads** - Works in any modern browser on any device
- **No accounts** - No emails, no passwords, no verification
- **No extensions** - No MetaMask, no plugins, no popups
- **No custody** - Private keys never leave your browser
- **Multi-chain** - Ethereum, Base, Arbitrum, and Arc in one interface
- **Bridge USDC** - Move USDC between chains via Circle's CCTP, directly from the wallet
- **ENS names** - Send to human-readable names (alice.unsu.eth) instead of hex addresses
- **QR codes** - Scan to send, share to receive
- **Testnet + Mainnet** - Practice safely before using real funds

## How It Works

### Send

1. Enter your secret phrase to unlock your wallet
2. Enter a destination (ENS name, address, or scan a QR code)
3. Choose asset and amount
4. Send

### Receive

1. Share your address, ENS name, or QR code

### Bridge USDC

1. Select the source chain in Settings > Chains
2. Click Bridge
3. Choose a destination chain and enter the USDC amount
4. Confirm - the wallet handles approval, burn, attestation, and mint automatically

Bridging uses Circle's Cross-Chain Transfer Protocol (CCTP). USDC is burned on the source chain, Circle signs an attestation, and equivalent USDC is minted on the destination. No wrapped tokens, no liquidity pools, no slippage.

Supported routes (testnet): Ethereum Sepolia, Arbitrum Sepolia, Base Sepolia, Arc Testnet. Mainnet: Ethereum, Arbitrum, Base.

If you close the browser during the attestation wait (typically 1-5 minutes), your bridge progress is saved. The wallet will prompt you to resume when you return.

## Arc Network

Arc is a chain where USDC is the native gas token - you pay transaction fees in USDC instead of ETH. This eliminates the need to hold a separate token just for gas, making it simpler for users who primarily transact in stablecoins.

unsu supports Arc Testnet with built-in CCTP bridging, so you can move USDC from Ethereum Sepolia (or other testnets) directly to Arc and start transacting immediately.

## Quick Start

```bash
./_start dev
# Open http://localhost:3333
```

See [app/README.md](app/README.md) for full technical documentation.

## Security Model

- Wallet keys are derived client-side and never transmitted
- No server-side storage of secrets
- No user accounts or sessions
- ENS data (name-to-address mappings) is public
- Designed for everyday transactions, not cold storage

## Contributing

Contributions welcome. See [app/README.md](app/README.md) for architecture details and development setup.

## License

See [LICENSE](LICENSE).
