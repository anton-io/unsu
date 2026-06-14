# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**unsu.com** - A minimal cryptocurrency wallet web app. Users unlock wallets with a seed phrase, send/receive crypto (ETH, USDC, WBTC) across Ethereum, Base, and Arbitrum (testnet + mainnet). Private keys never leave the browser.

## Commands

```bash
./_start dev        # Start dev server (Flask debug mode, port 3333)
./_start up         # Start via Docker Compose
./_start down       # Stop services
./_start status     # Check if services are running
./_start build      # Build Docker images
./_start clean      # Stop + remove caches/containers
```

Manual dev (from app/):
```bash
pip install -r requirements.txt
FLASK_DEBUG=true python3 server.py
```

## Architecture

- **Backend**: Flask app (`app/server.py`) serves static files and ENS API endpoints on port 3333
- **ENS API Client**: `app/api_ens.py` - library + CLI for the ENS Offchain Resolver Gateway (CRUD on ENS records)
- **Frontend**: Vanilla JS (`app/static/js/app.js`) using ethers.js for wallet operations, all client-side
- **Templates**: HTML pages in `app/templates/` (index, about, test pages)
- **Static assets**: `app/static/` (css, js, imgs)
- **Data**: `app/data/data.json` - local ENS name-to-address mappings (fallback)

### Key API Routes (server.py)

- `GET /api/resolver/name/<addr>` - Reverse lookup (address → ENS name)
- `GET /api/resolver/addr/<name>` - Forward lookup (ENS name → address)
- `POST /api/resolver/set/<name>/<addr>` - Register *.unsu.eth name

### Frontend Structure

- `app/static/js/app.js` - Main app: network configs, wallet derivation, transactions, balance loading
- `app/static/js/utils.js` - Shared utilities
- `app/static/css/style.css` - Main styles
- `app/static/css/asta-design.css` - Design system (ASTA: minimal, neutral colors, geometric)

### ENS Resolution Flow

1. Frontend calls `/api/resolver/addr/<name>`
2. Server tries external ENS API (`ENS_API_URL`)
3. Falls back to local `data/data.json` if API fails
4. Only `*.unsu.eth` names can be registered

## Environment Variables

Key vars (set in `.env` at project root, loaded via python-dotenv):
- `ENS_API_URL` - External ENS resolver gateway URL
- `ENS_API_KEY` - API key for ENS write operations
- `FLASK_DEBUG` - Enable debug/auto-reload
- `LOG_LEVEL` - Logging level (default: INFO)

## Docker

- Alpine-based multi-stage build (`app/Dockerfile`)
- Two services in `app/docker-compose.yml`: `web` (port 3333) and `ens` (port 3334)
- Non-root user `unsu`, healthchecks configured
- Data volume mounted at `/data`

## Design System (ASTA)

Follows ASTA design principles: minimal UI, neutral color palette (white/black/grays), universal symbols, geometric precision. Support both light and dark modes. Use SVG icons, not emojis.
