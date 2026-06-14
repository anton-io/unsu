# unsu.com - Technical Documentation

**A minimal cryptocurrency wallet built with Flask and vanilla JavaScript**

For project overview, see the [root README](../README.md).

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 User Browser                     │
│  ┌───────────────────────────────────────────┐  │
│  │  Vanilla JS + Ethers.js                   │  │
│  │  - Wallet derivation (client-side only)   │  │
│  │  - Multi-chain RPC connections            │  │
│  │  - Transaction signing & broadcasting     │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                       ↓
       ┌───────────────────────────────┐
       │   Flask Web Server (Port 3333) │
       │   - Serves static files        │
       │   - ENS API proxy + fallback   │
       │   - Gzip compression           │
       │   - Cache headers              │
       └───────────────────────────────┘
                       ↓
       ┌───────────────────────────────┐
       │   External ENS Gateway API     │
       │   - *.unsu.eth resolution      │
       │   - Name registration          │
       └───────────────────────────────┘
```

### Key Design Decisions

1. **Client-Side Wallet** - Private keys derived from seed phrase via keccak256 iterations, never leave the browser
2. **Multi-Chain** - Ethereum, Base, Arbitrum, and Arc with testnet/mainnet toggle
3. **CCTP Bridging** - USDC bridging via Circle's Cross-Chain Transfer Protocol, implemented as direct contract calls (no SDK)
4. **ENS Resolution** - Server proxies to external ENS API with local JSON fallback (`data/data.json`)
5. **Minimal Dependencies** - Frontend: ethers.js, html5-qrcode. Backend: Flask, Flask-CORS, Flask-Compress

---

## Quick Start

```bash
# From project root
./_start dev
# Opens on http://localhost:3333
```

### Manual Setup

```bash
cd app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
FLASK_DEBUG=true python3 server.py
```

### Docker

```bash
./_start build
./_start up
./_start status
./_start down
```

---

## Project Structure

```
app/
├── server.py              # Flask app: static serving + ENS API routes
├── api_ens.py             # ENS API client library (also usable as CLI)
├── requirements.txt       # Python dependencies
├── Dockerfile             # Alpine-based multi-stage build
├── docker-compose.yml     # web (3333) + ens (3334) services
├── data/
│   └── data.json          # Local ENS name-to-address fallback
├── templates/
│   ├── index.html         # Main wallet interface
│   └── about.html         # About page
├── static/
│   ├── css/
│   │   ├── style.css      # Main styles
│   │   └── asta-design.css # Design system
│   ├── js/
│   │   ├── app.js         # Main app logic (network configs, wallet, tx)
│   │   ├── utils.js       # Shared utilities
│   │   ├── asta-design.js # Design system JS
│   │   ├── ethers.umd.min.js
│   │   ├── html5-qrcode.min.js
│   │   └── qrcode.min.js
│   └── imgs/              # SVG icons, favicons, logos
└── logs/
    └── unsu.log           # Rotating log file
```

---

## API Routes

All routes are served by `server.py` on port 3333.

### Static

| Route | Description |
|-------|-------------|
| `GET /` | Serves `index.html` |
| `GET /<path>` | Static files (templates first, then static/) |

### ENS Resolver

| Route | Description |
|-------|-------------|
| `GET /api/resolver/name/<addr>` | Reverse lookup: address to ENS name |
| `GET /api/resolver/addr/<name>` | Forward lookup: ENS name to address(es) |
| `POST /api/resolver/set/<name>/<addr>` | Register a `*.unsu.eth` name |

The resolver tries the external ENS API first (`ENS_API_URL`), falls back to local `data/data.json`.

---

## Configuration

Environment variables (set in `.env` at project root, loaded via python-dotenv):

| Variable | Default | Description |
|----------|---------|-------------|
| `ENS_API_URL` | `https://unsu.com/ens` | External ENS resolver gateway |
| `ENS_API_KEY` | (empty) | API key for ENS write operations |
| `FLASK_DEBUG` | `false` | Enable debug mode + auto-reload |
| `LOG_LEVEL` | `INFO` | Logging level |

### Frontend Configuration

Network configs (RPC endpoints, chain IDs, assets) are defined in `static/js/app.js` in the `networkConfigs` object. To add a chain or token, edit that object.

---

## CCTP Bridge

The wallet supports bridging USDC between chains using Circle's Cross-Chain Transfer Protocol (CCTP V2). The implementation uses direct smart contract calls via ethers.js with no additional SDK.

### How It Works

1. **Approve** - ERC-20 approve of USDC spend to the TokenMessenger contract
2. **Burn** - Call `depositForBurn` on TokenMessenger, which burns USDC on the source chain
3. **Attest** - Poll Circle's Iris attestation API until the burn is signed
4. **Mint** - Call `receiveMessage` on the destination chain's MessageTransmitter to mint USDC

Since wallet keys are derived client-side and work on all EVM chains, the mint step executes automatically without requiring the user to switch networks.

### Supported Chains

| Chain | Domain ID | Testnet Chain ID | Mainnet Chain ID |
|-------|-----------|-----------------|-----------------|
| Ethereum | 0 | 11155111 (Sepolia) | 1 |
| Arbitrum | 3 | 421614 (Sepolia) | 42161 |
| Base | 6 | 84532 (Sepolia) | 8453 |
| Arc | 26 | 5042002 | - |

### Contract Addresses

**Testnet** (shared across all testnet chains):
- TokenMessengerV2: `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA`
- MessageTransmitterV2: `0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275`

**Mainnet** (shared across all mainnet chains):
- TokenMessengerV2: `0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d`
- MessageTransmitterV2: `0x81D40F21F12A8F0E3252Bccb954D722d4c464B64`

### Attestation API

- Testnet: `https://iris-api-sandbox.circle.com/v2/messages/{sourceDomain}?transactionHash={hash}`
- Mainnet: `https://iris-api.circle.com/v2/messages/{sourceDomain}?transactionHash={hash}`

Attestation typically takes 1-5 minutes. Bridge state is persisted to localStorage so users can close and resume.

### Arc Network

Arc uses USDC as its native gas token instead of ETH. This means users pay transaction fees in USDC, removing the need to acquire a separate token for gas. The wallet includes Arc Testnet with its USDC contract (`0x3600000000000000000000000000000000000000`) and supports bridging USDC to/from Arc via CCTP.

---

## ENS API Client

`api_ens.py` works as both an importable library and a CLI tool:

```bash
# List records
python3 api_ens.py list

# Get a record
python3 api_ens.py get alice.unsu.eth

# Create a record
python3 api_ens.py create alice.unsu.eth --address-60 0x1234...

# Reverse lookup
python3 api_ens.py reverse 0x1234...
```

Requires `ENS_API_URL` and `ENS_API_KEY` environment variables for write operations.

---

## Docker

- **Base**: Python 3.12 Alpine, multi-stage build
- **User**: Non-root `unsu` (UID 1000)
- **Health check**: HTTP GET on port 3333 every 30s
- **Services**: `web` (port 3333) and `ens` (port 3334)
- **Volumes**: `./data:/data` for ENS storage persistence
