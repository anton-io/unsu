# Quick Start Guide - unsu.com

**Get started with unsu.com in under 5 minutes**

---

## What is unsu.com?

A minimal cryptocurrency wallet that works in any web browser. No downloads, no accounts, no verification. Just a seed phrase and you're ready to send and receive crypto.

**Supported networks**: Ethereum, Base, Arbitrum (testnet and mainnet)

---

## Step 1: Access the Wallet (30 seconds)

### Option A: Use the Live Site
Visit **https://unsu.com** in any modern web browser.

### Option B: Run Locally
```bash
cd /root/src
./_start up

# Access at http://localhost:3333
```

---

## Step 2: Create or Unlock Your Wallet (1 minute)

### Create New Wallet
1. Click **"🔄 Generate random phrase"**
2. **IMPORTANT**: Write down your 12-word seed phrase
3. Store it safely (this is your only backup!)
4. Click **"Unlock Wallet"**

**⚠️ Security Note**: Anyone with your seed phrase can access your funds. Never share it!

### Unlock Existing Wallet
1. Enter your 12-word seed phrase in the text box
2. (Optional) Enter a wallet index number for derivation
3. Click **"Unlock Wallet"**

**Your wallet address** will appear at the top.

---

## Step 3: Get Test Funds (2 minutes, testnet only)

By default, the wallet starts in **testnet mode** (safe for testing).

### Get Free Testnet ETH
1. Copy your wallet address (click the address to copy)
2. Visit a faucet for your chosen network:
   - **Ethereum Sepolia**: https://sepoliafaucet.com
   - **Base Sepolia**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - **Arbitrum Sepolia**: https://faucet.quicknode.com/arbitrum/sepolia

3. Paste your address and request funds
4. Wait 30-60 seconds
5. Click **"🔄 Refresh"** in the wallet to see your balance

---

## Step 4: Send Crypto (1 minute)

### Using an Address
1. Click **"Send"** next to the asset you want to send
2. Enter the recipient's Ethereum address (starts with `0x`)
3. Enter the amount
4. Click **"Send Transaction"**
5. Wait for confirmation (~15 seconds on testnet)

### Using an ENS Name
1. Click **"Send"**
2. Enter a `.unsu.eth` name (e.g., `alice.unsu.eth`)
3. The address will auto-resolve
4. Enter amount and send

### Using a QR Code
1. Click the **"📷 Scan QR"** button in the address field
2. Point your camera at a QR code
3. The address will populate automatically
4. Enter amount and send

---

## Step 5: Receive Crypto (30 seconds)

### Share Your Address
1. Your address is displayed at the top of the page
2. Click to copy it
3. Share with the sender

### Share a QR Code
1. Click **"Share"** in the top menu
2. Show the QR code to the sender
3. They can scan it with their wallet app

### Register a .unsu.eth Name (Optional)
1. Click **"ENS"** in the top menu
2. Enter your desired name (e.g., `yourname.unsu.eth`)
3. Enter your wallet address
4. Click **"Set"**
5. Now people can send to `yourname.unsu.eth` instead of your long address

---

## Step 6: Switch to Mainnet (For Real Funds)

**⚠️ WARNING**: Mainnet uses REAL money. Start with small amounts!

1. Click the **"⚙️ Settings"** button (top right)
2. Under **"Network Mode"**, click **"Mainnet"**
3. Read the warning carefully
4. Check the confirmation box
5. Click **"Switch to Mainnet"**

**Visual indicator**: A pulsing orange **"⚠️ MAINNET"** badge appears when in mainnet mode.

**To switch back**: Open settings → Click **"Testnet"**

---

## Common Tasks

### Check Your Balance
- Balances automatically load when you unlock your wallet
- Click **"🔄 Refresh"** to update balances

### Switch Networks
- Use the **network selector** dropdown (shows current network like "Ethereum Sepolia")
- Select a different network (e.g., "Base Sepolia")
- Balances automatically reload

### View Transaction History
- Not yet implemented in the UI
- View on block explorer:
  1. Copy your address
  2. Visit:
     - Ethereum: https://sepolia.etherscan.io
     - Base: https://sepolia.basescan.org
     - Arbitrum: https://sepolia.arbiscan.io
  3. Paste your address in the search box

### Log Out
- Simply close the browser tab
- Your seed phrase is only stored in memory (not on disk)
- To access again, re-enter your seed phrase

---

## Troubleshooting

### "Transaction failed"
- **Cause**: Insufficient balance or gas
- **Fix**: Ensure you have enough funds, including gas fees

### "Invalid address"
- **Cause**: Address format is incorrect
- **Fix**: Ensure address starts with `0x` and is 42 characters long

### "ENS name not found"
- **Cause**: Name hasn't been registered yet
- **Fix**: Register the name first via the ENS page

### Balance shows $0 but I received funds
- **Cause**: Price data unavailable or balance not loaded
- **Fix**: Click **"🔄 Refresh"** button

### Can't unlock wallet
- **Cause**: Seed phrase is incorrect or has typos
- **Fix**:
  - Check for extra spaces
  - Ensure 12 words (not 24)
  - Verify spelling of each word

---

## Best Practices

### Security
- ✅ **DO**: Write down your seed phrase on paper
- ✅ **DO**: Store it in a safe place (fireproof safe, safety deposit box)
- ✅ **DO**: Test with small amounts first (especially on mainnet)
- ❌ **DON'T**: Share your seed phrase with anyone
- ❌ **DON'T**: Store it in cloud storage, email, or notes apps
- ❌ **DON'T**: Take screenshots of your seed phrase

### Testing
- ✅ **DO**: Use testnet mode for learning and testing
- ✅ **DO**: Get free testnet funds from faucets
- ✅ **DO**: Practice sending transactions on testnet first
- ❌ **DON'T**: Send large amounts on your first mainnet transaction

### Mainnet Usage
- ✅ **DO**: Double-check recipient addresses
- ✅ **DO**: Start with small amounts
- ✅ **DO**: Verify transactions on block explorers
- ❌ **DON'T**: Rush when sending real money
- ❌ **DON'T**: Ignore the mainnet warning

---

## Next Steps

### Learn More
- **Technical Documentation**: See `app/README.md` for developer details
- **Design System**: View `app/frontend/asta-example.html` for UI components
- **Wallet Derivation**: Visit the "Derivation" page to understand how wallets are generated

### Advanced Features
- **Custom RPC**: Configure your own RPC endpoints in `.env`
- **Add Tokens**: Edit `app/frontend/js/app.js` to add custom ERC-20 tokens
- **Self-Host**: Deploy your own instance with Docker (see `app/README.md`)

### Get Help
- **Documentation**: Check the main README and technical docs
- **Browser Console**: Open DevTools (F12) to see detailed error messages
- **Logs**: If self-hosting, check `./_start logs`

---

## FAQ

**Q: Do I need to create an account?**
A: No! Just a seed phrase is enough.

**Q: Where are my private keys stored?**
A: Only in your browser's memory while the page is open. They never touch our servers.

**Q: Can I use this on mobile?**
A: Yes! It works in any mobile browser. For best security, use a dedicated wallet app for large amounts.

**Q: What if I lose my seed phrase?**
A: Your funds are permanently inaccessible. There's no recovery option. Always keep backups!

**Q: Can I import my MetaMask wallet?**
A: Yes! If you use the same seed phrase, you'll get the same addresses (assuming same derivation path).

**Q: Are there fees?**
A: unsu.com itself is free. You only pay network gas fees (paid to blockchain validators).

**Q: Is this open source?**
A: Yes! The code is available for review and self-hosting.

**Q: What's the difference between testnet and mainnet?**
- **Testnet**: Uses fake money, free to use, safe for testing
- **Mainnet**: Uses real money, requires purchasing crypto, permanent transactions

**Q: Can I use .eth names from ENS?**
A: Regular `.eth` names work on Ethereum mainnet. Our `.unsu.eth` names are a custom resolver.

---

## Quick Reference Card

| Task | Steps |
|------|-------|
| **Create Wallet** | Generate phrase → Save it → Unlock |
| **Unlock Wallet** | Enter phrase → Unlock |
| **Send Crypto** | Send → Enter address → Amount → Confirm |
| **Receive Crypto** | Copy address or show QR code |
| **Get Test Funds** | Copy address → Visit faucet → Request |
| **Switch Network** | Click network dropdown → Select network |
| **Mainnet Mode** | Settings → Mainnet → Confirm warning |
| **Register ENS** | ENS page → Enter name + address → Set |
| **Refresh Balance** | Click 🔄 Refresh button |
| **Log Out** | Close browser tab |

---

**Total Time**: ~5 minutes from zero to first transaction ✓

**Need more help?** See the full technical documentation in `app/README.md` or visit the root README for project overview.

---

**Version**: 1.0
**Last Updated**: 2026-02-10
