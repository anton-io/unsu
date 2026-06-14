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
- **Multi-chain** - Ethereum, Base, and Arbitrum in one interface
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
