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
2. **Multi-Chain** - Ethereum, Base, Arbitrum with testnet/mainnet toggle
3. **ENS Resolution** - Server proxies to external ENS API with local JSON fallback (`data/data.json`)
4. **Minimal Dependencies** - Frontend: ethers.js, html5-qrcode. Backend: Flask, Flask-CORS, Flask-Compress

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
