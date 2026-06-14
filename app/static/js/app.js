// Network Configurations
const networkConfigs = {
  testnet: {
    label: 'Testnet',
    rpcs: [
      {
        name: 'Ethereum Sepolia',
        url: 'https://eth-sepolia.g.alchemy.com/v2/gr3viaHlqz-Mr-Ao3cBAwAHBerPMtVVs',
        icon: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
        chainId: 11155111,
        ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
      },
      {
        name: 'Base Sepolia',
        url: 'https://sepolia.base.org',
        icon: 'https://altcoinsbox.com/wp-content/uploads/2023/02/base-logo-in-blue.webp',
        chainId: 84532
      },
      {
        name: 'Arbitrum Sepolia',
        url: 'https://sepolia-rollup.arbitrum.io/rpc',
        icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
        chainId: 421614
      }
    ],
    assets: [
      {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
        priceFeed: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        icon: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png'
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        priceFeed: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
        icon: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png'
      },
      {
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        decimals: 8,
        address: '0x92f3B59a79bFf5dc60c0d59eA13a44D082B2bdFC',
        priceFeed: '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43',
        icon: 'https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png'
      }
    ]
  },
  mainnet: {
    label: 'Mainnet',
    rpcs: [
      {
        name: 'Ethereum',
        url: 'https://cloudflare-eth.com',
        icon: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
        chainId: 1,
        ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
      },
      {
        name: 'Base',
        url: 'https://mainnet.base.org',
        icon: 'https://altcoinsbox.com/wp-content/uploads/2023/02/base-logo-in-blue.webp',
        chainId: 8453
      },
      {
        name: 'Arbitrum One',
        url: 'https://arb1.arbitrum.io/rpc',
        icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
        chainId: 42161
      }
    ],
    assets: [
      {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
        priceFeed: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        icon: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png'
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        priceFeed: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
        icon: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png'
      },
      {
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        decimals: 8,
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        priceFeed: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
        icon: 'https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png'
      }
    ]
  }
};

// Custom Chain Management
let customChains = [];

// Load custom chains from localStorage
function loadCustomChains() {
  try {
    const stored = localStorage.getItem('customChains');
    if (stored) {
      customChains = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load custom chains:', error);
    customChains = [];
  }
}

// Save custom chains to localStorage
function saveCustomChains() {
  try {
    localStorage.setItem('customChains', JSON.stringify(customChains));
  } catch (error) {
    console.error('Failed to save custom chains:', error);
  }
}

// Validation functions
function validateChainId(chainId) {
  const num = parseInt(chainId);
  return !isNaN(num) && num > 0;
}

function validateRpcUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateAddress(address) {
  // Check if it's a valid Ethereum address
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Chain CRUD functions
function addCustomChain(chainConfig) {
  // Validate required fields
  if (!chainConfig.name || !chainConfig.chainId || !chainConfig.rpcUrl) {
    throw new Error('Missing required fields: name, chainId, rpcUrl');
  }

  if (!validateChainId(chainConfig.chainId)) {
    throw new Error('Invalid chain ID');
  }

  if (!validateRpcUrl(chainConfig.rpcUrl)) {
    throw new Error('Invalid RPC URL');
  }

  // Validate network mode
  if (!chainConfig.networkMode || !['testnet', 'mainnet', 'both'].includes(chainConfig.networkMode)) {
    throw new Error('Invalid network mode. Must be testnet, mainnet, or both');
  }

  // Check for duplicate chain ID within same network mode
  const isDuplicate = customChains.some(chain =>
    chain.chainId === parseInt(chainConfig.chainId) &&
    (chain.networkMode === chainConfig.networkMode ||
     chain.networkMode === 'both' ||
     chainConfig.networkMode === 'both')
  );
  if (isDuplicate) {
    throw new Error('Chain ID already exists in this network mode');
  }

  // Create new chain object
  const newChain = {
    id: `custom-${Date.now()}`,
    name: chainConfig.name,
    chainId: parseInt(chainConfig.chainId),
    rpcUrl: chainConfig.rpcUrl,
    networkMode: chainConfig.networkMode,
    nativeCurrency: chainConfig.nativeCurrency || {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorer: chainConfig.blockExplorer || '',
    ensSupport: chainConfig.ensSupport || false,
    ensAddress: chainConfig.ensAddress || null,
    icon: chainConfig.icon || 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
    assets: chainConfig.assets || []
  };

  customChains.push(newChain);
  saveCustomChains();
  return newChain;
}

function updateCustomChain(chainId, updates) {
  const index = customChains.findIndex(chain => chain.id === chainId);
  if (index === -1) {
    throw new Error('Chain not found');
  }

  // Validate updates
  if (updates.chainId && !validateChainId(updates.chainId)) {
    throw new Error('Invalid chain ID');
  }

  if (updates.rpcUrl && !validateRpcUrl(updates.rpcUrl)) {
    throw new Error('Invalid RPC URL');
  }

  // Apply updates
  customChains[index] = { ...customChains[index], ...updates };
  saveCustomChains();
  return customChains[index];
}

function deleteCustomChain(chainId) {
  const index = customChains.findIndex(chain => chain.id === chainId);
  if (index === -1) {
    throw new Error('Chain not found');
  }

  customChains.splice(index, 1);
  saveCustomChains();
}

function getCustomChain(chainId) {
  return customChains.find(chain => chain.id === chainId);
}

function getAllChains() {
  // Combine built-in and custom chains
  const builtInChains = [
    ...networkConfigs.testnet.rpcs.map(rpc => ({
      ...rpc,
      type: 'built-in',
      networkMode: 'testnet',
      assets: networkConfigs.testnet.assets
    })),
    ...networkConfigs.mainnet.rpcs.map(rpc => ({
      ...rpc,
      type: 'built-in',
      networkMode: 'mainnet',
      assets: networkConfigs.mainnet.assets
    }))
  ];

  const customChainsFormatted = customChains.map(chain => ({
    ...chain,
    type: 'custom',
    url: chain.rpcUrl,
    name: chain.name
  }));

  return [...builtInChains, ...customChainsFormatted];
}

// Token management functions
function addCustomToken(chainId, tokenConfig) {
  const chain = getCustomChain(chainId);
  if (!chain) {
    throw new Error('Chain not found');
  }

  // Validate token fields
  if (!tokenConfig.symbol || !tokenConfig.decimals) {
    throw new Error('Missing required fields: symbol, decimals');
  }

  if (tokenConfig.address && !validateAddress(tokenConfig.address)) {
    throw new Error('Invalid token address');
  }

  const newToken = {
    name: tokenConfig.name || tokenConfig.symbol,
    symbol: tokenConfig.symbol,
    decimals: parseInt(tokenConfig.decimals),
    address: tokenConfig.address || null,
    priceFeed: tokenConfig.priceFeed || null,
    icon: tokenConfig.icon || 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png'
  };

  if (!chain.assets) {
    chain.assets = [];
  }

  chain.assets.push(newToken);
  saveCustomChains();
  return newToken;
}

function updateCustomToken(chainId, tokenIndex, updates) {
  const chain = getCustomChain(chainId);
  if (!chain) {
    throw new Error('Chain not found');
  }

  if (!chain.assets || !chain.assets[tokenIndex]) {
    throw new Error('Token not found');
  }

  // Validate updates
  if (updates.address && !validateAddress(updates.address)) {
    throw new Error('Invalid token address');
  }

  chain.assets[tokenIndex] = { ...chain.assets[tokenIndex], ...updates };
  saveCustomChains();
  return chain.assets[tokenIndex];
}

function deleteCustomToken(chainId, tokenIndex) {
  const chain = getCustomChain(chainId);
  if (!chain) {
    throw new Error('Chain not found');
  }

  if (!chain.assets || !chain.assets[tokenIndex]) {
    throw new Error('Token not found');
  }

  chain.assets.splice(tokenIndex, 1);
  saveCustomChains();
}

// Import/Export functionality
function exportChains() {
  const exportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    chains: customChains
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `unsu-chains-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

function importChains(jsonString) {
  try {
    const importData = JSON.parse(jsonString);

    if (!importData.chains || !Array.isArray(importData.chains)) {
      throw new Error('Invalid import format');
    }

    // Validate each chain before importing
    for (const chain of importData.chains) {
      if (!chain.name || !chain.chainId || !chain.rpcUrl) {
        throw new Error(`Invalid chain: ${chain.name || 'unknown'}`);
      }

      if (!validateChainId(chain.chainId)) {
        throw new Error(`Invalid chain ID for ${chain.name}`);
      }

      if (!validateRpcUrl(chain.rpcUrl)) {
        throw new Error(`Invalid RPC URL for ${chain.name}`);
      }
    }

    // Merge imported chains (avoiding duplicates)
    for (const importedChain of importData.chains) {
      const exists = customChains.some(chain => chain.chainId === importedChain.chainId);
      if (!exists) {
        // Ensure it has a unique ID
        importedChain.id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        customChains.push(importedChain);
      }
    }

    saveCustomChains();
    return importData.chains.length;
  } catch (error) {
    throw new Error(`Import failed: ${error.message}`);
  }
}

// Active configuration
let currentNetworkMode = localStorage.getItem('networkMode') || 'testnet';
let rpcConfigs = networkConfigs[currentNetworkMode].rpcs;
let assets = networkConfigs[currentNetworkMode].assets;

// Hidden chains management
let hiddenChains = [];

// Custom RPC URLs for built-in chains
let customBuiltInRpcUrls = {}; // Format: { 'networkMode-chainId': 'https://...' }

// Required chains that cannot be hidden
const REQUIRED_CHAINS = {
  testnet: [11155111], // Ethereum Sepolia
  mainnet: [1]          // Ethereum Mainnet
};

function isRequiredChain(networkMode, chainId) {
  return REQUIRED_CHAINS[networkMode]?.includes(chainId) || false;
}

function loadCustomBuiltInRpcUrls() {
  try {
    const stored = localStorage.getItem('customBuiltInRpcUrls');
    if (stored) {
      customBuiltInRpcUrls = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load custom RPC URLs:', error);
    customBuiltInRpcUrls = {};
  }
}

function saveCustomBuiltInRpcUrls() {
  try {
    localStorage.setItem('customBuiltInRpcUrls', JSON.stringify(customBuiltInRpcUrls));
  } catch (error) {
    console.error('Failed to save custom RPC URLs:', error);
  }
}

function setCustomRpcUrl(networkMode, chainId, rpcUrl) {
  if (!validateRpcUrl(rpcUrl)) {
    throw new Error('Invalid RPC URL');
  }
  const key = `${networkMode}-${chainId}`;
  customBuiltInRpcUrls[key] = rpcUrl;
  saveCustomBuiltInRpcUrls();
}

function getCustomRpcUrl(networkMode, chainId) {
  const key = `${networkMode}-${chainId}`;
  return customBuiltInRpcUrls[key] || null;
}

function resetCustomRpcUrl(networkMode, chainId) {
  const key = `${networkMode}-${chainId}`;
  delete customBuiltInRpcUrls[key];
  saveCustomBuiltInRpcUrls();
}

function loadHiddenChains() {
  try {
    const stored = localStorage.getItem('hiddenChains');
    if (stored) {
      hiddenChains = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load hidden chains:', error);
    hiddenChains = [];
  }
}

function saveHiddenChains() {
  try {
    localStorage.setItem('hiddenChains', JSON.stringify(hiddenChains));
  } catch (error) {
    console.error('Failed to save hidden chains:', error);
  }
}

function hideBuiltInChain(networkMode, chainId) {
  // Prevent hiding required chains
  if (isRequiredChain(networkMode, chainId)) {
    showMessage('Cannot hide required chain', false);
    return;
  }

  const key = `${networkMode}-${chainId}`;
  if (!hiddenChains.includes(key)) {
    hiddenChains.push(key);
    saveHiddenChains();
  }
}

function showBuiltInChain(networkMode, chainId) {
  const key = `${networkMode}-${chainId}`;
  const index = hiddenChains.indexOf(key);
  if (index > -1) {
    hiddenChains.splice(index, 1);
    saveHiddenChains();
  }
}

function isChainHidden(networkMode, chainId) {
  const key = `${networkMode}-${chainId}`;
  return hiddenChains.includes(key);
}

// Function to merge built-in and custom chains
function getMergedChains() {
  // Get built-in chains for current network mode, excluding hidden ones
  const builtInChains = networkConfigs[currentNetworkMode].rpcs
    .filter(rpc => !isChainHidden(currentNetworkMode, rpc.chainId))
    .map(rpc => {
      // Check if there's a custom RPC URL for this built-in chain
      const customRpcUrl = getCustomRpcUrl(currentNetworkMode, rpc.chainId);
      return {
        ...rpc,
        url: customRpcUrl || rpc.url, // Use custom RPC if available
        type: 'built-in',
        hasCustomRpc: !!customRpcUrl
      };
    });

  // Convert custom chains to RPC config format, filtering by network mode
  const customRpcs = customChains
    .filter(chain => chain.networkMode === currentNetworkMode || chain.networkMode === 'both')
    .map(chain => ({
      name: chain.name,
      url: chain.rpcUrl,
      icon: chain.icon,
      chainId: chain.chainId,
      ensAddress: chain.ensSupport ? chain.ensAddress : undefined,
      type: 'custom',
      customChainId: chain.id,
      assets: chain.assets
    }));

  return [...builtInChains, ...customRpcs];
}

// Function to update rpcConfigs with merged chains
function updateRpcConfigs() {
  rpcConfigs = getMergedChains();
}

// Custom Assets Management (per chain)
let customAssets = {}; // Format: { 'networkMode-chainId': [assets] }
let hiddenAssets = {}; // Format: { 'networkMode-chainId': ['USDC', 'WBTC'] }
let builtInAssetOverrides = {}; // Format: { 'networkMode-chainId-symbol': { overrides } }

// Required assets that cannot be hidden or edited (symbol-based)
const REQUIRED_ASSETS = ['ETH'];

function isRequiredAsset(assetSymbol) {
  return REQUIRED_ASSETS.includes(assetSymbol);
}

function loadBuiltInAssetOverrides() {
  try {
    const stored = localStorage.getItem('builtInAssetOverrides');
    if (stored) {
      builtInAssetOverrides = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load built-in asset overrides:', error);
    builtInAssetOverrides = {};
  }
}

function saveBuiltInAssetOverrides() {
  try {
    localStorage.setItem('builtInAssetOverrides', JSON.stringify(builtInAssetOverrides));
  } catch (error) {
    console.error('Failed to save built-in asset overrides:', error);
  }
}

function getBuiltInAssetOverride(networkMode, chainId, assetSymbol) {
  const key = `${networkMode}-${chainId}-${assetSymbol}`;
  return builtInAssetOverrides[key] || null;
}

function setBuiltInAssetOverride(networkMode, chainId, assetSymbol, overrides) {
  const key = `${networkMode}-${chainId}-${assetSymbol}`;
  builtInAssetOverrides[key] = overrides;
  saveBuiltInAssetOverrides();
}

function resetBuiltInAssetOverride(networkMode, chainId, assetSymbol) {
  const key = `${networkMode}-${chainId}-${assetSymbol}`;
  delete builtInAssetOverrides[key];
  saveBuiltInAssetOverrides();
}

function loadCustomAssets() {
  try {
    const stored = localStorage.getItem('customAssets');
    if (stored) {
      customAssets = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load custom assets:', error);
    customAssets = {};
  }
}

function saveCustomAssets() {
  try {
    localStorage.setItem('customAssets', JSON.stringify(customAssets));
  } catch (error) {
    console.error('Failed to save custom assets:', error);
  }
}

function loadHiddenAssets() {
  try {
    const stored = localStorage.getItem('hiddenAssets');
    if (stored) {
      hiddenAssets = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load hidden assets:', error);
    hiddenAssets = {};
  }
}

function saveHiddenAssets() {
  try {
    localStorage.setItem('hiddenAssets', JSON.stringify(hiddenAssets));
  } catch (error) {
    console.error('Failed to save hidden assets:', error);
  }
}

function hideBuiltInAsset(networkMode, chainId, assetSymbol) {
  // Prevent hiding required assets
  if (isRequiredAsset(assetSymbol)) {
    showMessage('Cannot hide required asset', false);
    return;
  }

  const key = getChainKey(networkMode, chainId);
  if (!hiddenAssets[key]) {
    hiddenAssets[key] = [];
  }

  if (!hiddenAssets[key].includes(assetSymbol)) {
    hiddenAssets[key].push(assetSymbol);
    saveHiddenAssets();
  }
}

function showBuiltInAsset(networkMode, chainId, assetSymbol) {
  const key = getChainKey(networkMode, chainId);
  if (!hiddenAssets[key]) return;

  const index = hiddenAssets[key].indexOf(assetSymbol);
  if (index > -1) {
    hiddenAssets[key].splice(index, 1);
    saveHiddenAssets();
  }
}

function isAssetHidden(networkMode, chainId, assetSymbol) {
  const key = getChainKey(networkMode, chainId);
  return hiddenAssets[key]?.includes(assetSymbol) || false;
}

function getChainKey(networkMode, chainId) {
  return `${networkMode}-${chainId}`;
}

function getCustomAssetsForChain(networkMode, chainId) {
  const key = getChainKey(networkMode, chainId);
  return customAssets[key] || [];
}

function addCustomAsset(networkMode, chainId, assetConfig) {
  // Validate asset fields
  if (!assetConfig.symbol || !assetConfig.decimals) {
    throw new Error('Missing required fields: symbol, decimals');
  }

  if (assetConfig.address && !validateAddress(assetConfig.address)) {
    throw new Error('Invalid asset address');
  }

  const key = getChainKey(networkMode, chainId);
  if (!customAssets[key]) {
    customAssets[key] = [];
  }

  const newAsset = {
    name: assetConfig.name || assetConfig.symbol,
    symbol: assetConfig.symbol,
    decimals: parseInt(assetConfig.decimals),
    address: assetConfig.address || null,
    priceFeed: assetConfig.priceFeed || null,
    icon: assetConfig.icon || 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
    custom: true
  };

  customAssets[key].push(newAsset);
  saveCustomAssets();
  return newAsset;
}

function updateCustomAsset(networkMode, chainId, assetIndex, updates) {
  const key = getChainKey(networkMode, chainId);
  if (!customAssets[key] || !customAssets[key][assetIndex]) {
    throw new Error('Asset not found');
  }

  // Validate updates
  if (updates.address && !validateAddress(updates.address)) {
    throw new Error('Invalid asset address');
  }

  // Merge updates while preserving the custom flag
  customAssets[key][assetIndex] = {
    ...customAssets[key][assetIndex],
    ...updates,
    custom: true  // Ensure custom flag is preserved
  };
  saveCustomAssets();
  return customAssets[key][assetIndex];
}

function deleteCustomAsset(networkMode, chainId, assetIndex) {
  const key = getChainKey(networkMode, chainId);
  if (!customAssets[key] || !customAssets[key][assetIndex]) {
    throw new Error('Asset not found');
  }

  customAssets[key].splice(assetIndex, 1);
  saveCustomAssets();
}

function getAllAssetsForChain(networkMode, chainId) {
  // Get built-in assets for this chain
  let builtInAssets = [];

  // Check if it's a built-in chain
  const builtInChain = networkConfigs[networkMode]?.rpcs.find(rpc => rpc.chainId === chainId);
  if (builtInChain) {
    // For built-in chains, get assets from networkConfigs and apply overrides
    builtInAssets = networkConfigs[networkMode].assets
      .filter(asset => !isAssetHidden(networkMode, chainId, asset.symbol))
      .map(asset => {
        const override = getBuiltInAssetOverride(networkMode, chainId, asset.symbol);
        return {
          ...asset,
          ...(override || {}), // Apply overrides if they exist
          builtin: true
        };
      });
  } else {
    // For custom chains, get assets from the custom chain definition
    const customChain = customChains.find(chain =>
      chain.chainId === chainId &&
      (chain.networkMode === networkMode || chain.networkMode === 'both')
    );
    if (customChain && customChain.assets) {
      builtInAssets = customChain.assets.map(asset => ({
        ...asset,
        builtin: false
      }));
    }
  }

  // Get custom assets for this chain
  const customAssetsForChain = getCustomAssetsForChain(networkMode, chainId);

  // Merge and return
  return [...builtInAssets, ...customAssetsForChain];
}

// Get ALL assets including hidden ones (for management UI)
function getAllAssetsForChainIncludingHidden(networkMode, chainId) {
  // Get built-in assets for this chain
  let builtInAssets = [];

  // Check if it's a built-in chain
  const builtInChain = networkConfigs[networkMode]?.rpcs.find(rpc => rpc.chainId === chainId);
  if (builtInChain) {
    // For built-in chains, get assets from networkConfigs and apply overrides
    builtInAssets = networkConfigs[networkMode].assets.map(asset => {
      const override = getBuiltInAssetOverride(networkMode, chainId, asset.symbol);
      return {
        ...asset,
        ...(override || {}), // Apply overrides if they exist
        builtin: true,
        hidden: isAssetHidden(networkMode, chainId, asset.symbol),
        hasOverride: !!override
      };
    });
  } else {
    // For custom chains, get assets from the custom chain definition
    const customChain = customChains.find(chain =>
      chain.chainId === chainId &&
      (chain.networkMode === networkMode || chain.networkMode === 'both')
    );
    if (customChain && customChain.assets) {
      builtInAssets = customChain.assets.map(asset => ({
        ...asset,
        builtin: false,
        hidden: false
      }));
    }
  }

  // Get custom assets for this chain
  const customAssetsForChain = getCustomAssetsForChain(networkMode, chainId);

  // Merge and return
  return [...builtInAssets, ...customAssetsForChain];
}

// State
let ensName = '';
let wallet;
let provider;
let currentProviderIndex = 0;
let qrCode;
let html5QrCodeInstance;

// Utilities
const _empty = (obj) => Object.keys(obj).length === 0;

// Base URL for API calls (auto-detect development vs production)
const base_url = (() => {
  const host = document.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('127.');

  return isLocal
    ? `${document.location.protocol}//${host}:3333/api/resolver`
    : 'https://unsu.com/api/resolver';
})();

// Price cache to avoid redundant API calls
const priceCache = new Map();
const PRICE_CACHE_TTL = 60000; // 1 minute

// Provider Management
function setProvider(index) {
  currentProviderIndex = index;
  const rpcConfig = rpcConfigs[index];

  if (rpcConfig.ensAddress) {
    // Network with ENS support
    provider = new ethers.providers.JsonRpcProvider(rpcConfig.url, {
      chainId: rpcConfig.chainId,
      ensAddress: rpcConfig.ensAddress,
    });
  } else {
    provider = new ethers.providers.JsonRpcProvider(rpcConfig.url, {
      chainId: rpcConfig.chainId
    });
  }

  // Update provider icon if element exists (old UI compatibility)
  const providerIcon = document.getElementById('icon-details-provider');
  if (providerIcon) {
    providerIcon.src = rpcConfig.icon;
  }

  // Update provider radio buttons
  updateProviderSelector();

  // Update active chain displays in settings and modals
  updateSettingsWalletDetails();
  updateModalActiveChainDisplays();
}

// Network Mode Management
function setNetworkMode(mode) {
  if (mode !== 'testnet' && mode !== 'mainnet') {
    console.error('Invalid network mode:', mode);
    return;
  }

  // Update global state
  currentNetworkMode = mode;
  assets = networkConfigs[mode].assets;

  // Merge custom chains with built-in chains for new network mode
  updateRpcConfigs();

  // Save to localStorage
  localStorage.setItem('networkMode', mode);

  // Update UI
  updateNetworkModeUI();

  // Reinitialize provider selector
  initializeProviderSelector();

  // Reset to first provider
  setProvider(0);

  // Reload balances if logged in
  if (wallet) {
    loadBalances();
  }
}

function updateNetworkModeUI() {
  const isMainnet = currentNetworkMode === 'mainnet';
  const modeIndicator = document.getElementById('network-mode-indicator');
  const modeLabel = document.getElementById('current-network-mode');
  const testnetBadge = document.getElementById('testnet-badge');

  // Update mode label in settings
  if (modeLabel) {
    modeLabel.textContent = networkConfigs[currentNetworkMode].label;
  }

  // Show/hide testnet badge (only show in testnet mode)
  if (testnetBadge) {
    testnetBadge.style.display = isMainnet ? 'none' : 'block';
  }

  // Update toggle switch
  const testnetRadio = document.getElementById('mode-testnet');
  const mainnetRadio = document.getElementById('mode-mainnet');
  if (testnetRadio && mainnetRadio) {
    testnetRadio.checked = !isMainnet;
    mainnetRadio.checked = isMainnet;
  }

  // Add/remove mainnet class to body for styling
  if (isMainnet) {
    document.documentElement.classList.add('mainnet-mode');
  } else {
    document.documentElement.classList.remove('mainnet-mode');
  }
}

function initializeProviderSelector() {
  const providerSelector = document.getElementById('provider-selector');
  if (!providerSelector) return;

  providerSelector.innerHTML = '';

  for (let i = 0; i < rpcConfigs.length; i++) {
    const rpcConfig = rpcConfigs[i];

    // Create label wrapper
    const label = document.createElement('label');
    label.className = 'mode-option';

    // Create radio input
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'provider-mode';
    radio.id = `provider-${i}`;
    radio.value = i;
    radio.checked = (i === currentProviderIndex);
    radio.addEventListener('change', async () => {
      setProvider(i);
      await loadBalances();
    });

    // Create label content
    const modeLabel = document.createElement('div');
    modeLabel.className = 'mode-label';

    const modeName = document.createElement('span');
    modeName.className = 'mode-name';
    modeName.textContent = rpcConfig.name;

    modeLabel.appendChild(modeName);

    label.appendChild(radio);
    label.appendChild(modeLabel);
    providerSelector.appendChild(label);
  }
}

function updateProviderSelector() {
  for (let i = 0; i < rpcConfigs.length; i++) {
    const radio = document.getElementById(`provider-${i}`);
    if (radio) {
      radio.checked = (i === currentProviderIndex);
    }
  }
}

// Wallet Management
function deriveWalletFromString(inputString) {
  const hashTimes = Math.max(1, 20 - inputString.length);
  let seed = inputString;

  for (let i = 0; i < hashTimes; i++) {
    seed = ethers.utils.id(seed);
  }

  return new ethers.Wallet(seed);
}

async function login(seedPhrase) {
  if (typeof seedPhrase === 'undefined') {
    seedPhrase = document.getElementById('inputString').value.trim();
    if (!seedPhrase) {
      alert('Please enter a string.');
      return;
    }
  }

  try {
    localStorage.setItem('seedPhrase', seedPhrase);
    wallet = deriveWalletFromString(seedPhrase);

    // Update old wallet details modal (if exists)
    const detailsAddress = document.getElementById('details-address');
    if (detailsAddress) {
      detailsAddress.textContent = wallet.address;
    }
    const detailsKey = document.getElementById('details-key');
    if (detailsKey) {
      detailsKey.textContent = wallet.privateKey;
    }

    // Update settings modal wallet details
    updateSettingsWalletDetails();

    await loadBalances(false);

    const qrCodeElement = document.getElementById('walletQRCode');
    qrCodeElement.innerHTML = '';

    qrCode = new QRCode(qrCodeElement, {
      text: wallet.address,
      width: 160,
      height: 160,
      correctLevel: QRCode.CorrectLevel.L
    });

    // Update receive modal address display
    const receiveAddressElement = document.getElementById('receive-details-address');
    if (receiveAddressElement) {
      // Preserve the copy icon and add the address text before it
      const copyIcon = receiveAddressElement.querySelector('.copy-address-icon');
      receiveAddressElement.textContent = wallet.address;
      if (copyIcon) {
        receiveAddressElement.appendChild(copyIcon);
      }
    }

    // Update active chain displays in Send and Receive modals
    updateModalActiveChainDisplays();

    document.documentElement.classList.add('logged-in');
    document.documentElement.classList.remove('loader');

    resolveAddressName(wallet.address);
  } catch (error) {
    console.error('Login error:', error);
    showMessage('Login failed. Please try again.', false);
  }
}

function logout() {
  localStorage.removeItem('seedPhrase');
  location.reload();
}

// Balance Management
async function getEtherBalance(address) {
  const balanceBigInt = await provider.getBalance(address);
  return ethers.utils.formatEther(balanceBigInt);
}

async function getERC20Balance(address, token) {
  try {
    const contract = new ethers.Contract(
      token.address,
      ['function balanceOf(address) view returns (uint)'],
      provider
    );
    const balance = await contract.balanceOf(address);
    return balance / (10 ** token.decimals);
  } catch {
    return 0;
  }
}

// Batch fetch all prices in a single API call
async function getAllPrices(assetList) {
  // Map asset symbols to CoinGecko IDs
  const coinGeckoIds = {
    'ETH': 'ethereum',
    'USDC': 'usd-coin',
    'WBTC': 'wrapped-bitcoin'
  };

  // Check if all prices are cached
  const allCached = assetList.every(asset => {
    const cached = priceCache.get(asset.symbol);
    return cached && Date.now() - cached.timestamp < PRICE_CACHE_TTL;
  });

  if (allCached) {
    return assetList.map(asset => priceCache.get(asset.symbol).price);
  }

  // Build list of coin IDs to fetch
  const coinIds = assetList
    .map(asset => coinGeckoIds[asset.symbol])
    .filter(id => id)
    .join(',');

  try {
    // Batch fetch all prices in one call
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('CoinGecko rate limit reached - prices will show as $0.00');
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Update cache and return prices in order
    return assetList.map(asset => {
      const coinId = coinGeckoIds[asset.symbol];
      const price = data[coinId]?.usd || 0;

      if (price > 0) {
        priceCache.set(asset.symbol, { price, timestamp: Date.now() });
      }

      return price;
    });
  } catch (error) {
    console.error('Error fetching prices:', error.message);
    // Return zeros for all assets on error
    return assetList.map(() => 0);
  }
}

async function getPrice(asset) {
  const cached = priceCache.get(asset.symbol);
  if (cached && Date.now() - cached.timestamp < PRICE_CACHE_TTL) {
    return cached.price;
  }

  // Fallback for individual price fetch
  const prices = await getAllPrices([asset]);
  return prices[0] || 0;
}

async function loadBalances(resetBalance = true) {
  if (resetBalance) {
    document.getElementById('walletAssets').innerHTML = '';
    document.getElementsByClassName('container-assets-horizontal')[0].innerHTML = '';
    document.getElementById('walletBalance').innerHTML = '<p class="details-balance">0.00 $</p> <p class="subheader">Balance</p>';
  }

  try {
    // Batch fetch all prices in a single API call
    const balancePromises = assets.map(asset =>
      asset.name === 'Ether'
        ? getEtherBalance(wallet.address)
        : getERC20Balance(wallet.address, asset)
    );

    const [prices, balances] = await Promise.all([
      getAllPrices(assets),
      Promise.all(balancePromises)
    ]);

    const walletAssetsContainer = document.getElementById('walletAssets');
    const horizontalAssetsContainer = document.getElementsByClassName('container-assets-horizontal')[0];

    walletAssetsContainer.innerHTML = '';
    horizontalAssetsContainer.innerHTML = '';

    let walletBalance = 0;
    const fragment = document.createDocumentFragment();
    const horizontalFragment = document.createDocumentFragment();

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const price = prices[i];
      const balance = balances[i];
      const balanceUSD = price * balance;
      walletBalance += balanceUSD;

      const assetDiv = document.createElement('div');
      assetDiv.className = 'asset-row';
      assetDiv.innerHTML = `
        <div class="asset-left">
          <img src="${asset.icon}" alt="${asset.name} Icon">
          <div>
            <p class="asset-name">${asset.name}</p>
            <p class="asset-balance">${balance} ${asset.symbol}</p>
          </div>
        </div>
        <p>$${balanceUSD.toFixed(2)}</p>
      `;
      fragment.appendChild(assetDiv);

      // Create label wrapper for radio button
      const label = document.createElement('label');
      label.className = 'asset-option';

      // Create radio input
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'asset-selection';
      radio.value = asset.symbol;
      radio.checked = (i === 0); // Select first asset by default

      // Create content
      const content = document.createElement('div');
      content.className = 'asset-content';
      content.innerHTML = `
        <div class="asset-left">
          <img src="${asset.icon}" alt="${asset.name} Icon">
          <div>
            <p class="asset-balance">${balance} ${asset.symbol}</p>
          </div>
        </div>
        <p>$${balanceUSD.toFixed(2)}</p>
      `;

      label.appendChild(radio);
      label.appendChild(content);
      horizontalFragment.appendChild(label);
    }

    walletAssetsContainer.appendChild(fragment);
    horizontalAssetsContainer.appendChild(horizontalFragment);

    document.getElementById('walletBalance').innerHTML = `<p class="details-balance">${walletBalance.toFixed(2)} $</p> <p class="subheader">Balance</p>`;
  } catch (error) {
    console.error('Error loading balances:', error);
    showMessage('Failed to load balances', false);
  }
}

// Transaction Management
async function sendEther(recipient, amount) {
  const signer = wallet.connect(provider);
  const tx = await signer.sendTransaction({
    to: recipient,
    value: ethers.utils.parseEther(amount)
  });
  await tx.wait();
}

async function sendERC20(token, recipient, amount) {
  const signer = wallet.connect(provider);
  const contract = new ethers.Contract(
    token.address,
    ['function transfer(address to, uint amount)'],
    signer
  );
  const tx = await contract.transfer(recipient, ethers.utils.parseUnits(amount, token.decimals));
  await tx.wait();
}

async function resolveEnsName(ensName) {
  try {
    // Check if it's a .unsu.eth subdomain - use backend API
    if (ensName.endsWith('.unsu.eth')) {
      const response = await fetch(`${base_url}/addr/${ensName}`, {
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
      const data = await response.json();

      // The API returns { addresses: { 60: "0x..." }, text: {} }
      if (data.addresses && data.addresses['60']) {
        return data.addresses['60'];
      }

      // Name not found
      return null;
    }

    // For other .eth names, use Ethereum Mainnet ENS registry
    const mainnetRpc = networkConfigs.mainnet.rpcs.find(rpc => rpc.chainId === 1);
    if (!mainnetRpc) {
      throw new Error('Ethereum Mainnet not configured');
    }

    // Check for custom RPC URL
    const customRpcUrl = getCustomRpcUrl('mainnet', 1);
    const rpcUrl = customRpcUrl || mainnetRpc.url;

    const ensProvider = new ethers.providers.JsonRpcProvider(rpcUrl, {
      chainId: 1,
      ensAddress: mainnetRpc.ensAddress
    });

    // Resolve the ENS name
    const address = await ensProvider.resolveName(ensName);
    return address;
  } catch (error) {
    console.error('ENS resolution error:', error);
    throw error;
  }
}

async function send() {
  let recipient = document.getElementById('send-recipient').value.trim();
  const selectedRadio = document.querySelector('input[name="asset-selection"]:checked');

  if (!selectedRadio) {
    showMessage('Please select an asset', false);
    return;
  }

  const assetSymbol = selectedRadio.value;
  const asset = assets.find(a => a.symbol === assetSymbol);
  const amount = document.getElementById('send-amount').value;

  if (!amount || parseFloat(amount) <= 0) {
    showMessage('Please enter a valid amount', false);
    return;
  }

  const sendButton = document.getElementById('send-confirm');
  const originalButtonHTML = sendButton.innerHTML;

  // Show loading state
  sendButton.classList.add('disabled');
  sendButton.innerHTML = '<span class="button-spinner"></span>Sending...';

  try {
    // Check if recipient is a plain name (no dots, no 0x prefix) - assume .unsu.eth
    if (!recipient.startsWith('0x') && !recipient.includes('.')) {
      recipient = `${recipient}.unsu.eth`;
      console.log('Assuming .unsu.eth domain:', recipient);
    }

    // Check if recipient is an ENS name
    if (recipient.endsWith('.eth')) {
      console.log('Resolving ENS name:', recipient);
      sendButton.innerHTML = '<span class="button-spinner"></span>Resolving ENS...';

      const resolvedAddress = await resolveEnsName(recipient);

      if (!resolvedAddress) {
        showMessage(`Could not resolve ENS name: ${recipient}`, false);
        return;
      }

      console.log(`Resolved ${recipient} to ${resolvedAddress}`);
      showMessage(`Resolved ${recipient} to ${resolvedAddress.substring(0, 10)}...`, true);
      recipient = resolvedAddress;

      // Update button text back to sending
      sendButton.innerHTML = '<span class="button-spinner"></span>Sending...';
    }

    console.log('Sending', amount, assetSymbol, 'to', recipient, '...');

    if (assetSymbol === 'ETH') {
      await sendEther(recipient, amount);
    } else {
      await sendERC20(asset, recipient, amount);
    }
    showMessage('Transaction success', true);
    await loadBalances(false);
  } catch (error) {
    console.error('Transaction error:', error);
    showMessage('Transaction failed', false);
  } finally {
    // Restore button state
    sendButton.classList.remove('disabled');
    sendButton.innerHTML = originalButtonHTML;
    closeAllModals();
  }
}

// ENS Management
async function setAddress() {
  let name = document.getElementById('iName').value.trim();

  if (!name.endsWith('.unsu.eth')) {
    name += '.unsu.eth';
  }

  const addr = wallet.address;

  if (!addr.match('^0x[0-9a-fA-F]{40}$')) {
    showMessage('Invalid address. Please try again.', false);
    return;
  }

  const setEnsButton = document.getElementById('set-ens-button');
  const originalButtonHTML = setEnsButton.innerHTML;

  // Show loading state
  setEnsButton.classList.add('disabled');
  setEnsButton.innerHTML = '<span class="button-spinner"></span>Setting name...';

  try {
    const response = await fetch(`${base_url}/set/${name}/${addr}`, {
      method: 'POST',
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
    const data = await response.json();

    if (data.updated) {
      showMessage(`Name updated to ${data.updated.name}`, true);
      console.log('Name updated:', data);
      // Clear the input field on success
      document.getElementById('iName').value = '';
      closeAllModals();
    } else if (data.exists) {
      showMessage('Error: name already set.', false);
      console.log('Name already set:', data);
    }
  } catch (error) {
    showMessage(`Error: ${error.message || error}`, false);
    console.error('Error:', error);
  } finally {
    // Restore button state
    setEnsButton.classList.remove('disabled');
    setEnsButton.innerHTML = originalButtonHTML;
  }
}

function formatAddressShort(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

async function resolveAddressName(addr) {
  // Set shortened address for main wallet name only
  const shortAddress = formatAddressShort(addr);
  const mainWalletName = document.getElementById('main-wallet-name');
  if (mainWalletName) {
    mainWalletName.innerHTML = shortAddress;
  }

  try {
    const response = await fetch(`${base_url}/name/${addr}`, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
    const data = await response.json();

    if (_empty(data) || data.name === '') {
      ensName = '';
      // Keep shortened address on main wallet, hide receive wallet name
      const receiveWalletName = document.getElementById('receive-wallet-name');
      if (receiveWalletName) {
        receiveWalletName.innerHTML = '';
        receiveWalletName.style.display = 'none';
      }
    } else {
      ensName = data.name;
      // Update both with ENS name
      if (mainWalletName) {
        mainWalletName.innerHTML = ensName;
      }
      const receiveWalletName = document.getElementById('receive-wallet-name');
      if (receiveWalletName) {
        receiveWalletName.innerHTML = ensName;
        receiveWalletName.style.display = 'block';
      }
    }

    console.log(`info: resolved ${addr} -> ${ensName}`);
  } catch (error) {
    console.error('Error resolving address:', error);
    // Hide receive wallet name on error
    const receiveWalletName = document.getElementById('receive-wallet-name');
    if (receiveWalletName) {
      receiveWalletName.innerHTML = '';
      receiveWalletName.style.display = 'none';
    }
  }
}

// QR Code Management
function startScan() {
  const container = document.querySelector('.container-qr');
  container.style.display = 'block';

  // Lazy load if not already loaded
  if (!html5QrCodeInstance) {
    html5QrCodeInstance = new Html5Qrcode('qrScanner');
  }

  const qrCodeSuccessCallback = (decodedText) => {
    document.querySelector('.qrText').value = decodedText;
    html5QrCodeInstance.stop().catch(err => console.error('QR stop error:', err));
    container.style.display = 'none';
  };

  const config = { fps: 10, qrbox: { width: 250, height: 250 } };

  html5QrCodeInstance.start({ facingMode: 'environment' }, config, qrCodeSuccessCallback)
    .catch(err => {
      console.error('QR scan error:', err);
      showMessage('Camera access denied', false);
      container.style.display = 'none';
    });
}

// UI Management
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('current');
  });

  const detailsKey = document.getElementById('details-key');
  if (detailsKey) {
    detailsKey.classList.remove('revealed');
  }

  const containerQr = document.querySelector('.container-qr');
  if (containerQr) {
    containerQr.style.display = 'none';
  }
}

function toggleModal(targetId) {
  closeAllModals();
  const targetModal = document.getElementById(targetId);
  if (targetModal) {
    targetModal.classList.add('current');
  }
}

function showMessage(message, isSuccess) {
  const messageContainer = document.getElementById('message-container');

  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', isSuccess ? 'success' : 'error');

  // Create message text
  const messageText = document.createElement('p');
  messageText.className = 'message-text';
  messageText.textContent = message;

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.className = 'message-close';
  closeButton.innerHTML = '×';
  closeButton.setAttribute('aria-label', 'Close notification');

  // Close handler
  const closeMessage = () => {
    messageDiv.classList.add('removing');
    setTimeout(() => {
      messageDiv.remove();
    }, 300); // Match animation duration
  };

  closeButton.addEventListener('click', closeMessage);

  // Assemble message
  messageDiv.appendChild(messageText);
  messageDiv.appendChild(closeButton);

  // Add to container (will appear at bottom due to column-reverse)
  messageContainer.appendChild(messageDiv);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    // Only auto-dismiss if still in DOM
    if (messageDiv.parentNode) {
      closeMessage();
    }
  }, 5000);
}

function share() {
  const address = wallet.address;
  const ens = ensName;
  const url = `share.html?address=${address}&ens=${ens}`;
  window.open(url, '_blank');
}

function checkAndAddLoaderClass() {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  const keyFromUrl = urlParams.get('k');
  const sessionInStorage = localStorage.getItem('seedPhrase');

  if (keyFromUrl || sessionInStorage) {
    document.documentElement.classList.add('loader');
  }
}

// Initialize
function init() {
  // Load custom chains, hidden chains, custom assets, hidden assets, custom RPC URLs, and built-in asset overrides from localStorage
  loadCustomChains();
  loadHiddenChains();
  loadCustomAssets();
  loadHiddenAssets();
  loadCustomBuiltInRpcUrls();
  loadBuiltInAssetOverrides();

  // Merge custom chains with built-in chains
  updateRpcConfigs();

  // Initialize network mode UI
  updateNetworkModeUI();

  // Set default provider
  setProvider(0);

  // Initialize provider selector
  initializeProviderSelector();

  // Event listeners
  document.getElementById('inputString').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      login();
    }
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeAllModals();
      }
    });
  });

  document.querySelectorAll('[data-trigger]').forEach(trigger => {
    trigger.addEventListener('click', function() {
      const targetId = this.getAttribute('data-trigger');
      toggleModal(targetId);
    });
  });

  document.querySelectorAll('.close-modal').forEach(element => {
    element.addEventListener('click', closeAllModals);
  });

  // Old wallet details modal handlers (if still exists)
  const detailsKey = document.getElementById('details-key');
  if (detailsKey) {
    detailsKey.addEventListener('click', function() {
      this.classList.add('revealed');
    });
  }

  const sendWallet = document.getElementById('send-wallet');
  if (sendWallet) {
    sendWallet.addEventListener('click', function() {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const seedValue = params.get('k') || localStorage.getItem('seedPhrase');

      if (/Mobi|Android/i.test(navigator.userAgent)) {
        if (navigator.share) {
          navigator.share({
            title: 'Here is your new wallet',
            url: `https://unsu.com/#k=${seedValue}`,
          }).catch((error) => console.log('Error sharing', error));
        }
      } else {
        this.innerText = 'Copied';
        navigator.clipboard.writeText(`https://unsu.com/#k=${seedValue}`)
          .then(() => console.log('Copied to clipboard'))
          .catch(err => console.error('Copy failed:', err));
      }
    });
  }

  // Settings modal wallet handlers
  const settingsDetailsKey = document.getElementById('settings-details-key');
  if (settingsDetailsKey) {
    settingsDetailsKey.addEventListener('click', function() {
      this.classList.add('revealed');
    });
  }

  const settingsSendWallet = document.getElementById('settings-send-wallet');
  if (settingsSendWallet) {
    settingsSendWallet.addEventListener('click', function() {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const seedValue = params.get('k') || localStorage.getItem('seedPhrase');

      if (/Mobi|Android/i.test(navigator.userAgent)) {
        if (navigator.share) {
          navigator.share({
            title: 'Here is your new wallet',
            url: `https://unsu.com/#k=${seedValue}`,
          }).catch((error) => console.log('Error sharing', error));
        }
      } else {
        this.innerText = 'Copied';
        navigator.clipboard.writeText(`https://unsu.com/#k=${seedValue}`)
          .then(() => console.log('Copied to clipboard'))
          .catch(err => console.error('Copy failed:', err));
      }
    });
  }

  // Auto-login
  const params = new URLSearchParams(window.location.hash.substring(1));
  const seedValue = params.get('k') || localStorage.getItem('seedPhrase');

  if (!seedValue) {
    document.getElementById('walletForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      login();
    });
  } else {
    const url = new URL(window.location);
    url.searchParams.delete('k');
    history.pushState({}, '', url);
    login(seedValue);
  }

  checkAndAddLoaderClass();

  // Initialize theme
  initializeTheme();
}

// Settings Tab Management
function switchSettingsTab(tabName) {
  // Update tab buttons
  const tabs = document.querySelectorAll('.settings-tab');
  tabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update panes
  const panes = document.querySelectorAll('.settings-pane');
  panes.forEach(pane => {
    if (pane.id === `settings-pane-${tabName}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  // If switching to wallet tab, update wallet details
  if (tabName === 'wallet' && wallet) {
    updateSettingsWalletDetails();
  }

  // If switching to chains tab, load chain list
  if (tabName === 'chains') {
    loadChainList();
  }

  // If switching to assets tab, load asset chain selector
  if (tabName === 'assets') {
    loadAssetChainSelector();
  }
}

function updateModalActiveChainDisplays() {
  if (currentProviderIndex !== undefined && rpcConfigs[currentProviderIndex]) {
    const currentChain = rpcConfigs[currentProviderIndex];

    const sendChainElement = document.getElementById('send-active-chain');
    if (sendChainElement) {
      sendChainElement.textContent = currentChain.name;
    }

    const receiveChainElement = document.getElementById('receive-active-chain');
    if (receiveChainElement) {
      receiveChainElement.textContent = currentChain.name;
    }
  }
}

function updateSettingsWalletDetails() {
  const notConnected = document.getElementById('wallet-not-connected');
  const connected = document.getElementById('wallet-connected');
  const addressElement = document.getElementById('settings-details-address');
  const keyElement = document.getElementById('settings-details-key');
  const activeChainElement = document.getElementById('settings-active-chain');

  if (wallet) {
    // Show connected state
    if (notConnected) notConnected.style.display = 'none';
    if (connected) connected.style.display = 'block';

    // Update active chain
    if (activeChainElement && currentProviderIndex !== undefined && rpcConfigs[currentProviderIndex]) {
      const currentChain = rpcConfigs[currentProviderIndex];
      activeChainElement.textContent = currentChain.name;
    }

    // Update details - preserve the copy icon
    if (addressElement) {
      // Clear text content but keep the icon
      addressElement.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.remove();
        }
      });

      // Add address text at the beginning
      addressElement.insertBefore(document.createTextNode(wallet.address), addressElement.firstChild);
    }
    if (keyElement) {
      keyElement.textContent = wallet.privateKey;
    }
  } else {
    // Show not connected state
    if (notConnected) notConnected.style.display = 'block';
    if (connected) connected.style.display = 'none';
  }
}

function copyAddress() {
  if (!wallet) return;

  navigator.clipboard.writeText(wallet.address)
    .then(() => {
      console.log('Address copied to clipboard');
      // Show visual feedback
      const addressElement = document.getElementById('settings-details-address');
      if (addressElement) {
        const originalAddress = wallet.address;

        // Find and update only the text node
        addressElement.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = 'Copied!';
          }
        });

        addressElement.style.color = 'var(--primary-color)';
        addressElement.style.fontWeight = 'bold';

        setTimeout(() => {
          // Restore original address
          addressElement.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              node.textContent = originalAddress;
            }
          });
          addressElement.style.color = '';
          addressElement.style.fontWeight = '';
        }, 1500);
      }
    })
    .catch(err => console.error('Failed to copy address:', err));
}

function copyReceiveAddress() {
  if (!wallet) return;

  navigator.clipboard.writeText(wallet.address)
    .then(() => {
      console.log('Address copied to clipboard');
      // Show visual feedback
      const addressElement = document.getElementById('receive-details-address');
      if (addressElement) {
        const originalAddress = wallet.address;

        // Find and update only the text node
        addressElement.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = 'Copied!';
          }
        });

        addressElement.style.color = 'var(--positive-green)';
        addressElement.style.fontWeight = 'bold';

        setTimeout(() => {
          // Restore original address
          addressElement.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              node.textContent = originalAddress;
            }
          });
          addressElement.style.color = '';
          addressElement.style.fontWeight = '';
        }, 1500);
      }
      showMessage('Address copied to clipboard', true);
    })
    .catch(err => {
      console.error('Failed to copy address:', err);
      showMessage('Failed to copy address', false);
    });
}

// Theme Management
let systemThemeListener = null;

function applyTheme(actualTheme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', actualTheme);
}

function setTheme(theme) {
  localStorage.setItem('theme', theme);

  // Remove previous system theme listener if exists
  if (systemThemeListener) {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', systemThemeListener);
    systemThemeListener = null;
  }

  if (theme === 'system') {
    // Use system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const actualTheme = systemPrefersDark ? 'dark' : 'light';
    applyTheme(actualTheme);

    // Listen for system theme changes
    systemThemeListener = (e) => {
      applyTheme(e.matches ? 'dark' : 'light');
    };
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', systemThemeListener);
  } else {
    // Use explicit theme
    applyTheme(theme);
  }

  // Update radio buttons
  const themeSystem = document.getElementById('theme-system');
  const themeLight = document.getElementById('theme-light');
  const themeDark = document.getElementById('theme-dark');
  if (themeSystem && themeLight && themeDark) {
    themeSystem.checked = (theme === 'system');
    themeLight.checked = (theme === 'light');
    themeDark.checked = (theme === 'dark');
  }
}

function initializeTheme() {
  // Check for saved theme preference or default to 'system'
  const savedTheme = localStorage.getItem('theme') || 'system';
  setTheme(savedTheme);
}

// Chain Management UI Functions
let currentEditingChainId = null;
let currentTokenManagementChainId = null;

function showAddChainForm() {
  currentEditingChainId = null;
  document.getElementById('chain-form-title').textContent = 'Add New Chain';
  document.getElementById('chain-form-submit').textContent = 'Save Chain';

  // Clear form
  document.getElementById('chain-name').value = '';
  document.getElementById('chain-id').value = '';
  document.getElementById('chain-rpc-url').value = '';
  document.getElementById('chain-currency-symbol').value = 'ETH';
  document.getElementById('chain-currency-decimals').value = '18';
  document.getElementById('chain-explorer').value = '';
  document.getElementById('chain-icon').value = '';
  document.getElementById('chain-ens-support').checked = false;
  document.getElementById('chain-ens-address').value = '';
  document.getElementById('ens-address-group').style.display = 'none';

  // Reset network mode to current mode
  document.getElementById('chain-mode-testnet').checked = (currentNetworkMode === 'testnet');
  document.getElementById('chain-mode-mainnet').checked = (currentNetworkMode === 'mainnet');
  document.getElementById('chain-mode-both').checked = false;

  // Hide RPC form if open
  hideRpcForm();

  document.getElementById('chain-form-container').style.display = 'block';

  // Toggle ENS address field
  document.getElementById('chain-ens-support').onchange = function() {
    document.getElementById('ens-address-group').style.display = this.checked ? 'block' : 'none';
  };
}

function showEditChainForm(chainId) {
  const chain = getCustomChain(chainId);
  if (!chain) return;

  currentEditingChainId = chainId;
  document.getElementById('chain-form-title').textContent = 'Edit Chain';
  document.getElementById('chain-form-submit').textContent = 'Update Chain';

  // Fill form
  document.getElementById('chain-name').value = chain.name;
  document.getElementById('chain-id').value = chain.chainId;
  document.getElementById('chain-rpc-url').value = chain.rpcUrl;
  document.getElementById('chain-currency-symbol').value = chain.nativeCurrency?.symbol || 'ETH';
  document.getElementById('chain-currency-decimals').value = chain.nativeCurrency?.decimals || 18;
  document.getElementById('chain-explorer').value = chain.blockExplorer || '';
  document.getElementById('chain-icon').value = chain.icon || '';
  document.getElementById('chain-ens-support').checked = chain.ensSupport || false;
  document.getElementById('chain-ens-address').value = chain.ensAddress || '';
  document.getElementById('ens-address-group').style.display = chain.ensSupport ? 'block' : 'none';

  // Set network mode
  document.getElementById('chain-mode-testnet').checked = (chain.networkMode === 'testnet');
  document.getElementById('chain-mode-mainnet').checked = (chain.networkMode === 'mainnet');
  document.getElementById('chain-mode-both').checked = (chain.networkMode === 'both');

  // Hide RPC form if open
  hideRpcForm();

  document.getElementById('chain-form-container').style.display = 'block';

  // Toggle ENS address field
  document.getElementById('chain-ens-support').onchange = function() {
    document.getElementById('ens-address-group').style.display = this.checked ? 'block' : 'none';
  };
}

function hideChainForm() {
  document.getElementById('chain-form-container').style.display = 'none';
  currentEditingChainId = null;
}

function saveChain() {
  // Get network mode from radio buttons
  let networkMode = 'testnet';
  if (document.getElementById('chain-mode-mainnet').checked) {
    networkMode = 'mainnet';
  } else if (document.getElementById('chain-mode-both').checked) {
    networkMode = 'both';
  }

  const chainConfig = {
    name: document.getElementById('chain-name').value.trim(),
    chainId: document.getElementById('chain-id').value,
    rpcUrl: document.getElementById('chain-rpc-url').value.trim(),
    networkMode: networkMode,
    nativeCurrency: {
      name: document.getElementById('chain-currency-symbol').value.trim() || 'ETH',
      symbol: document.getElementById('chain-currency-symbol').value.trim() || 'ETH',
      decimals: parseInt(document.getElementById('chain-currency-decimals').value) || 18
    },
    blockExplorer: document.getElementById('chain-explorer').value.trim(),
    icon: document.getElementById('chain-icon').value.trim(),
    ensSupport: document.getElementById('chain-ens-support').checked,
    ensAddress: document.getElementById('chain-ens-address').value.trim() || null
  };

  try {
    if (currentEditingChainId) {
      // Update existing chain
      updateCustomChain(currentEditingChainId, chainConfig);
      showMessage('Chain updated successfully', true);
    } else {
      // Add new chain
      addCustomChain(chainConfig);
      showMessage('Chain added successfully', true);
    }

    hideChainForm();
    loadChainList();

    // Update provider selector to include new chain
    updateRpcConfigs();
    initializeProviderSelector();
  } catch (error) {
    showMessage(error.message, false);
  }
}

function loadChainList() {
  const chainList = document.getElementById('chain-list');
  if (!chainList) return;

  chainList.innerHTML = '';

  // Separate chains by network mode
  const mainnetChains = [];
  const testnetChains = [];

  // Add mainnet built-in chains
  networkConfigs.mainnet.rpcs.forEach(rpc => {
    const customRpcUrl = getCustomRpcUrl('mainnet', rpc.chainId);
    mainnetChains.push({
      ...rpc,
      url: customRpcUrl || rpc.url,
      type: 'built-in',
      networkMode: 'mainnet',
      hidden: isChainHidden('mainnet', rpc.chainId),
      hasCustomRpc: !!customRpcUrl
    });
  });

  // Add testnet built-in chains
  networkConfigs.testnet.rpcs.forEach(rpc => {
    const customRpcUrl = getCustomRpcUrl('testnet', rpc.chainId);
    testnetChains.push({
      ...rpc,
      url: customRpcUrl || rpc.url,
      type: 'built-in',
      networkMode: 'testnet',
      hidden: isChainHidden('testnet', rpc.chainId),
      hasCustomRpc: !!customRpcUrl
    });
  });

  // Add custom chains to appropriate lists
  customChains.forEach(chain => {
    const chainData = {
      ...chain,
      type: 'custom',
      url: chain.rpcUrl,
      customChainId: chain.id
    };

    if (chain.networkMode === 'mainnet') {
      mainnetChains.push(chainData);
    } else if (chain.networkMode === 'testnet') {
      testnetChains.push(chainData);
    } else if (chain.networkMode === 'both') {
      // Add to both lists
      mainnetChains.push({ ...chainData, networkMode: 'mainnet' });
      testnetChains.push({ ...chainData, networkMode: 'testnet' });
    }
  });

  if (mainnetChains.length === 0 && testnetChains.length === 0) {
    chainList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No chains configured</p>';
    return;
  }

  // Render mainnet section
  if (mainnetChains.length > 0) {
    const mainnetHeader = document.createElement('p');
    mainnetHeader.className = 'subheader';
    mainnetHeader.style.marginTop = '0';
    mainnetHeader.style.marginBottom = '15px';
    mainnetHeader.innerHTML = '<span style="color: #f44336;">Mainnet Chains</span>';
    chainList.appendChild(mainnetHeader);

    mainnetChains.forEach(chain => {
      const chainItem = createChainListItem(chain);
      chainItem.style.marginBottom = '12px';
      chainList.appendChild(chainItem);
    });
  }

  // Add separator between mainnet and testnet
  if (mainnetChains.length > 0 && testnetChains.length > 0) {
    const separator = document.createElement('div');
    separator.style.borderTop = '1.5px solid var(--border-color)';
    separator.style.margin = '30px 0';
    chainList.appendChild(separator);
  }

  // Render testnet section
  if (testnetChains.length > 0) {
    const testnetHeader = document.createElement('p');
    testnetHeader.className = 'subheader';
    testnetHeader.style.marginTop = '0';
    testnetHeader.style.marginBottom = '15px';
    testnetHeader.innerHTML = '<span style="color: #2196F3;">Testnet Chains</span>';
    chainList.appendChild(testnetHeader);

    testnetChains.forEach(chain => {
      const chainItem = createChainListItem(chain);
      chainItem.style.marginBottom = '12px';
      chainList.appendChild(chainItem);
    });
  }
}

function createChainListItem(chain) {
    const chainItem = document.createElement('div');
    chainItem.className = 'chain-item';
    if (chain.hidden) {
      chainItem.style.opacity = '0.5';
    }

    const isCustom = chain.type === 'custom';
    const isRequired = !isCustom && isRequiredChain(chain.networkMode, chain.chainId);
    const hasCustomRpc = chain.hasCustomRpc || false;

    chainItem.innerHTML = `
      <div class="chain-item-header">
        <div class="chain-info">
          <img src="${chain.icon}" alt="${chain.name}" width="24" height="24" onerror="this.src='https://assets.coingecko.com/coins/images/279/standard/ethereum.png'">
          <div>
            <div class="chain-name">${chain.name}${chain.hidden ? ' (Hidden)' : ''}${isRequired ? ' (Required)' : ''}${hasCustomRpc ? ' (Custom RPC)' : ''}</div>
            <div class="chain-details">
              Chain ID: ${chain.chainId} • ${isCustom ? 'Custom' : 'Built-in'}${hasCustomRpc ? ' • ' + chain.url.substring(0, 30) + '...' : ''}
            </div>
          </div>
        </div>
        <div class="chain-actions">
          ${isCustom ? `
            <button class="chain-action-btn" onclick="showTokenManagement('${chain.customChainId}')" title="Manage Tokens">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </button>
            <button class="chain-action-btn" onclick="showEditChainForm('${chain.customChainId}')" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="chain-action-btn" onclick="deleteChainWithConfirm('${chain.customChainId}')" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          ` : `
            <button class="chain-action-btn" onclick="showEditRpcForm('${chain.networkMode}', ${chain.chainId})" title="Edit RPC">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            ${isRequired ? '' : `
              <button class="chain-action-btn" onclick="toggleBuiltInChainVisibility('${chain.networkMode}', ${chain.chainId})" title="${chain.hidden ? 'Show' : 'Hide'}">
                ${chain.hidden ? `
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ` : `
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                `}
              </button>
            `}
          `}
        </div>
      </div>
    `;

    return chainItem;
}

function toggleBuiltInChainVisibility(networkMode, chainId) {
  if (isChainHidden(networkMode, chainId)) {
    showBuiltInChain(networkMode, chainId);
    showMessage('Chain shown', true);
  } else {
    hideBuiltInChain(networkMode, chainId);
    showMessage('Chain hidden', true);
  }

  // Reload the chain list
  loadChainList();

  // Update provider selector if we're in the affected network mode
  if (networkMode === currentNetworkMode || networkMode === 'both') {
    updateRpcConfigs();
    initializeProviderSelector();
  }
}

function deleteChainWithConfirm(chainId) {
  const chain = getCustomChain(chainId);
  if (!chain) return;

  if (confirm(`Are you sure you want to delete ${chain.name}? This cannot be undone.`)) {
    try {
      deleteCustomChain(chainId);
      showMessage('Chain deleted successfully', true);
      loadChainList();

      // Update provider selector
      updateRpcConfigs();
      initializeProviderSelector();
    } catch (error) {
      showMessage(error.message, false);
    }
  }
}

function showImportChainDialog() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = importChains(text);
      showMessage(`Successfully imported ${count} chain(s)`, true);
      loadChainList();

      // Update provider selector
      updateRpcConfigs();
      initializeProviderSelector();
    } catch (error) {
      showMessage(error.message, false);
    }
  };
  input.click();
}

// Token Management UI Functions
function showTokenManagement(chainId) {
  const chain = getCustomChain(chainId);
  if (!chain) return;

  currentTokenManagementChainId = chainId;
  document.getElementById('token-chain-name').textContent = chain.name;
  document.getElementById('token-management-container').style.display = 'block';
  loadTokenList(chainId);
}

function hideTokenManagement() {
  document.getElementById('token-management-container').style.display = 'none';
  currentTokenManagementChainId = null;
}

function showAddTokenForm() {
  // Clear form
  document.getElementById('token-symbol').value = '';
  document.getElementById('token-name').value = '';
  document.getElementById('token-decimals').value = '18';
  document.getElementById('token-address').value = '';
  document.getElementById('token-price-feed').value = '';
  document.getElementById('token-icon').value = '';

  document.getElementById('token-form-container').style.display = 'block';
}

function hideTokenForm() {
  document.getElementById('token-form-container').style.display = 'none';
}

function saveToken() {
  if (!currentTokenManagementChainId) return;

  const tokenConfig = {
    symbol: document.getElementById('token-symbol').value.trim(),
    name: document.getElementById('token-name').value.trim(),
    decimals: document.getElementById('token-decimals').value,
    address: document.getElementById('token-address').value.trim(),
    priceFeed: document.getElementById('token-price-feed').value.trim(),
    icon: document.getElementById('token-icon').value.trim()
  };

  try {
    addCustomToken(currentTokenManagementChainId, tokenConfig);
    showMessage('Token added successfully', true);
    hideTokenForm();
    loadTokenList(currentTokenManagementChainId);
  } catch (error) {
    showMessage(error.message, false);
  }
}

function loadTokenList(chainId) {
  const chain = getCustomChain(chainId);
  if (!chain) return;

  const tokenList = document.getElementById('token-list');
  if (!tokenList) return;

  tokenList.innerHTML = '';

  if (!chain.assets || chain.assets.length === 0) {
    tokenList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No tokens configured</p>';
    return;
  }

  chain.assets.forEach((token, index) => {
    const tokenItem = document.createElement('div');
    tokenItem.className = 'token-item';

    tokenItem.innerHTML = `
      <div class="token-item-header">
        <div class="token-info">
          <img src="${token.icon || 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png'}" alt="${token.symbol}" width="24" height="24" onerror="this.src='https://assets.coingecko.com/coins/images/279/standard/ethereum.png'">
          <div>
            <div class="token-name">${token.name || token.symbol}</div>
            <div class="token-details">${token.symbol} • ${token.decimals} decimals</div>
          </div>
        </div>
        <button class="chain-action-btn" onclick="deleteTokenWithConfirm('${chainId}', ${index})" title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    `;

    tokenList.appendChild(tokenItem);
  });
}

function deleteTokenWithConfirm(chainId, tokenIndex) {
  const chain = getCustomChain(chainId);
  if (!chain || !chain.assets || !chain.assets[tokenIndex]) return;

  const token = chain.assets[tokenIndex];

  if (confirm(`Are you sure you want to delete ${token.symbol}?`)) {
    try {
      deleteCustomToken(chainId, tokenIndex);
      showMessage('Token deleted successfully', true);
      loadTokenList(chainId);
    } catch (error) {
      showMessage(error.message, false);
    }
  }
}

// RPC Edit UI Functions
let currentEditingRpcChain = null; // { networkMode, chainId, chainName }

function showEditRpcForm(networkMode, chainId) {
  const builtInChain = networkConfigs[networkMode]?.rpcs.find(rpc => rpc.chainId === chainId);
  if (!builtInChain) return;

  currentEditingRpcChain = { networkMode, chainId, chainName: builtInChain.name };

  // Get current RPC URL (custom or default)
  const customRpcUrl = getCustomRpcUrl(networkMode, chainId);
  const currentRpcUrl = customRpcUrl || builtInChain.url;
  const isUsingCustomRpc = !!customRpcUrl;

  // Hide other forms
  hideChainForm();
  hideTokenManagement();

  // Show RPC form in its own container
  const formContainer = document.getElementById('rpc-form-container');
  formContainer.style.display = 'block';

  formContainer.innerHTML = `
    <div style="background-color: var(--card-bg); border: 1.5px solid var(--border-color); border-radius: var(--border-radius); padding: 20px; margin-bottom: 20px;">
      <div class="chain-form-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <p class="subheader" style="margin: 0;">Edit RPC for ${builtInChain.name}</p>
        <button onclick="hideRpcForm()" style="background: none; border: none; cursor: pointer; padding: 5px; width: auto; height: auto; margin: 0; box-shadow: none; font-size: 24px; opacity: 0.6; transition: opacity 0.2s ease;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">✕</button>
      </div>

      <div class="form-group">
        <label>RPC URL *</label>
        <input type="url" id="rpc-url-input" placeholder="https://..." value="${currentRpcUrl}" required>
        <small style="display: block; margin-top: 8px; color: var(--text-secondary); font-size: 13px;">
          ${isUsingCustomRpc ? 'Using custom RPC URL' : 'Using default RPC URL'}
        </small>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button onclick="saveRpcUrl()">Save RPC</button>
        ${isUsingCustomRpc ? '<button class="button-secondary" onclick="resetRpcUrl()">Reset to Default</button>' : ''}
        <button class="button-secondary" onclick="hideRpcForm()">Cancel</button>
      </div>
    </div>
  `;
}

function hideRpcForm() {
  const formContainer = document.getElementById('rpc-form-container');
  formContainer.style.display = 'none';
  formContainer.innerHTML = '';
  currentEditingRpcChain = null;
}

function saveRpcUrl() {
  if (!currentEditingRpcChain) return;

  const rpcUrl = document.getElementById('rpc-url-input').value.trim();

  if (!rpcUrl) {
    showMessage('RPC URL is required', false);
    return;
  }

  if (!validateRpcUrl(rpcUrl)) {
    showMessage('Invalid RPC URL format', false);
    return;
  }

  try {
    setCustomRpcUrl(currentEditingRpcChain.networkMode, currentEditingRpcChain.chainId, rpcUrl);
    showMessage('RPC URL updated successfully', true);
    hideRpcForm();
    loadChainList();

    // Update provider configs
    updateRpcConfigs();
    initializeProviderSelector();

    // If currently connected to this chain, reconnect with new RPC
    const currentChain = rpcConfigs[currentProviderIndex];
    if (currentChain && currentChain.chainId === currentEditingRpcChain.chainId) {
      setProvider(currentProviderIndex);
      if (wallet) {
        loadBalances();
      }
    }
  } catch (error) {
    showMessage(error.message, false);
  }
}

function resetRpcUrl() {
  if (!currentEditingRpcChain) return;

  if (confirm('Are you sure you want to reset to the default RPC URL?')) {
    try {
      resetCustomRpcUrl(currentEditingRpcChain.networkMode, currentEditingRpcChain.chainId);
      showMessage('RPC URL reset to default', true);
      hideRpcForm();
      loadChainList();

      // Update provider configs
      updateRpcConfigs();
      initializeProviderSelector();

      // If currently connected to this chain, reconnect with default RPC
      const currentChain = rpcConfigs[currentProviderIndex];
      if (currentChain && currentChain.chainId === currentEditingRpcChain.chainId) {
        setProvider(currentProviderIndex);
        if (wallet) {
          loadBalances();
        }
      }
    } catch (error) {
      showMessage(error.message, false);
    }
  }
}

// Asset Management UI Functions
let currentAssetChain = null; // { networkMode, chainId, chainName }

function loadAssetChainSelector() {
  const selector = document.getElementById('asset-chain-selector');
  if (!selector) return;

  // Clear existing options except the first placeholder
  selector.innerHTML = '<option value="">Choose a chain...</option>';

  // Separate chains by network mode
  const testnetChains = [];
  const mainnetChains = [];

  // Add testnet built-in chains
  networkConfigs.testnet.rpcs.forEach(rpc => {
    testnetChains.push({
      name: rpc.name,
      chainId: rpc.chainId,
      networkMode: 'testnet',
      icon: rpc.icon
    });
  });

  // Add mainnet built-in chains
  networkConfigs.mainnet.rpcs.forEach(rpc => {
    mainnetChains.push({
      name: rpc.name,
      chainId: rpc.chainId,
      networkMode: 'mainnet',
      icon: rpc.icon
    });
  });

  // Add custom chains
  customChains.forEach(chain => {
    if (chain.networkMode === 'both') {
      // Add for both testnet and mainnet
      testnetChains.push({
        name: `${chain.name} (Testnet)`,
        chainId: chain.chainId,
        networkMode: 'testnet',
        icon: chain.icon
      });
      mainnetChains.push({
        name: `${chain.name} (Mainnet)`,
        chainId: chain.chainId,
        networkMode: 'mainnet',
        icon: chain.icon
      });
    } else if (chain.networkMode === 'testnet') {
      testnetChains.push({
        name: chain.name,
        chainId: chain.chainId,
        networkMode: chain.networkMode,
        icon: chain.icon
      });
    } else {
      mainnetChains.push({
        name: chain.name,
        chainId: chain.chainId,
        networkMode: chain.networkMode,
        icon: chain.icon
      });
    }
  });

  // Create mainnet optgroup
  if (mainnetChains.length > 0) {
    const mainnetGroup = document.createElement('optgroup');
    mainnetGroup.label = 'Mainnet Chains';

    mainnetChains.forEach(chain => {
      const option = document.createElement('option');
      option.value = `${chain.networkMode}-${chain.chainId}`;
      option.textContent = `${chain.name} (Chain ID: ${chain.chainId})`;
      option.dataset.networkMode = chain.networkMode;
      option.dataset.chainId = chain.chainId;
      option.dataset.chainName = chain.name;
      mainnetGroup.appendChild(option);
    });

    selector.appendChild(mainnetGroup);
  }

  // Create testnet optgroup
  if (testnetChains.length > 0) {
    const testnetGroup = document.createElement('optgroup');
    testnetGroup.label = 'Testnet Chains';

    testnetChains.forEach(chain => {
      const option = document.createElement('option');
      option.value = `${chain.networkMode}-${chain.chainId}`;
      option.textContent = `${chain.name} (Chain ID: ${chain.chainId})`;
      option.dataset.networkMode = chain.networkMode;
      option.dataset.chainId = chain.chainId;
      option.dataset.chainName = chain.name;
      testnetGroup.appendChild(option);
    });

    selector.appendChild(testnetGroup);
  }

  // Add change event listener
  selector.onchange = function() {
    const selectedOption = this.options[this.selectedIndex];
    if (selectedOption.value) {
      const networkMode = selectedOption.dataset.networkMode;
      const chainId = parseInt(selectedOption.dataset.chainId);
      const chainName = selectedOption.dataset.chainName;
      selectAssetChain(networkMode, chainId, chainName);
    } else {
      // Hide asset management section if no chain selected
      document.getElementById('asset-management-section').style.display = 'none';
    }
  };
}

function selectAssetChain(networkMode, chainId, chainName) {
  currentAssetChain = { networkMode, chainId, chainName };

  document.getElementById('asset-selected-chain-name').textContent = chainName;
  document.getElementById('asset-management-section').style.display = 'block';

  loadAssetListForChain(networkMode, chainId);
}

function loadAssetListForChain(networkMode, chainId) {
  const assetList = document.getElementById('asset-list');
  if (!assetList) return;

  assetList.innerHTML = '';

  const allAssets = getAllAssetsForChainIncludingHidden(networkMode, chainId);

  if (allAssets.length === 0) {
    assetList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No assets configured</p>';
    return;
  }

  // Calculate index offset for custom assets
  const builtInCount = allAssets.filter(a => a.builtin || !a.custom).length;

  allAssets.forEach((asset, index) => {
    const assetItem = document.createElement('div');
    assetItem.className = 'chain-item';

    if (asset.hidden) {
      assetItem.style.opacity = '0.5';
    }

    const isCustom = asset.custom === true;
    const isBuiltIn = asset.builtin === true;
    const isRequired = isBuiltIn && isRequiredAsset(asset.symbol);

    assetItem.innerHTML = `
      <div class="chain-item-header">
        <div class="chain-info">
          <img src="${asset.icon || 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png'}" alt="${asset.symbol}" width="24" height="24" onerror="this.src='https://assets.coingecko.com/coins/images/279/standard/ethereum.png'">
          <div>
            <div class="chain-name">${asset.name || asset.symbol}${asset.hidden ? ' (Hidden)' : ''}${isRequired ? ' (Required)' : ''}${asset.hasOverride ? ' (Custom Config)' : ''}</div>
            <div class="chain-details">
              ${asset.symbol} • ${asset.decimals} decimals${asset.address ? ` • ${asset.address.substring(0, 10)}...` : ' • Native'}
              ${isCustom ? ' • Custom' : ''}
            </div>
          </div>
        </div>
        <div class="chain-actions">
          ${isCustom ? `
            <button class="chain-action-btn" onclick="showEditAssetForm('${networkMode}', ${chainId}, ${index - builtInCount}, false)" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="chain-action-btn" onclick="deleteAssetWithConfirm('${networkMode}', ${chainId}, ${index - builtInCount})" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          ` : isBuiltIn && !isRequired ? `
            <button class="chain-action-btn" onclick="showEditBuiltInAssetForm('${networkMode}', ${chainId}, '${asset.symbol}')" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="chain-action-btn" onclick="toggleBuiltInAssetVisibility('${networkMode}', ${chainId}, '${asset.symbol}')" title="${asset.hidden ? 'Show' : 'Hide'}">
              ${asset.hidden ? `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              ` : `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              `}
            </button>
          ` : ''}
        </div>
      </div>
    `;

    assetList.appendChild(assetItem);
  });
}

let currentEditingAssetIndex = null;
let currentEditingBuiltInAsset = null; // { networkMode, chainId, symbol }

function showAddAssetForm() {
  if (!currentAssetChain) return;

  currentEditingAssetIndex = null;
  currentEditingBuiltInAsset = null;
  document.getElementById('asset-form-title').textContent = 'Add New Asset';
  document.getElementById('asset-form-submit').textContent = 'Save Asset';

  // Clear form
  document.getElementById('asset-symbol').value = '';
  document.getElementById('asset-name').value = '';
  document.getElementById('asset-decimals').value = '18';
  document.getElementById('asset-address').value = '';
  document.getElementById('asset-price-feed').value = '';
  document.getElementById('asset-icon').value = '';

  // Remove reset button if it exists
  const resetBtn = document.getElementById('asset-reset-btn');
  if (resetBtn) resetBtn.remove();

  document.getElementById('asset-form-container').style.display = 'block';
}

function showEditAssetForm(networkMode, chainId, assetIndex) {
  if (!currentAssetChain) return;

  const customAssetsForChain = getCustomAssetsForChain(networkMode, chainId);
  const asset = customAssetsForChain[assetIndex];
  if (!asset) return;

  currentEditingAssetIndex = assetIndex;
  currentEditingBuiltInAsset = null;
  document.getElementById('asset-form-title').textContent = 'Edit Custom Asset';
  document.getElementById('asset-form-submit').textContent = 'Update Asset';

  // Fill form with asset data
  document.getElementById('asset-symbol').value = asset.symbol || '';
  document.getElementById('asset-name').value = asset.name || '';
  document.getElementById('asset-decimals').value = asset.decimals || '18';
  document.getElementById('asset-address').value = asset.address || '';
  document.getElementById('asset-price-feed').value = asset.priceFeed || '';
  document.getElementById('asset-icon').value = asset.icon || '';

  // Remove reset button if it exists
  const resetBtn = document.getElementById('asset-reset-btn');
  if (resetBtn) resetBtn.remove();

  document.getElementById('asset-form-container').style.display = 'block';
}

function showEditBuiltInAssetForm(networkMode, chainId, assetSymbol) {
  if (!currentAssetChain) return;

  // Get the built-in asset from networkConfigs
  const builtInChain = networkConfigs[networkMode]?.rpcs.find(rpc => rpc.chainId === chainId);
  if (!builtInChain) return;

  const asset = networkConfigs[networkMode].assets.find(a => a.symbol === assetSymbol);
  if (!asset) return;

  // Get any existing overrides
  const override = getBuiltInAssetOverride(networkMode, chainId, assetSymbol);
  const currentConfig = override ? { ...asset, ...override } : asset;

  currentEditingAssetIndex = null;
  currentEditingBuiltInAsset = { networkMode, chainId, symbol: assetSymbol };
  document.getElementById('asset-form-title').textContent = `Edit ${assetSymbol}`;
  document.getElementById('asset-form-submit').textContent = 'Update Asset';

  // Fill form with current asset data (including overrides)
  document.getElementById('asset-symbol').value = currentConfig.symbol || '';
  document.getElementById('asset-name').value = currentConfig.name || '';
  document.getElementById('asset-decimals').value = currentConfig.decimals || '18';
  document.getElementById('asset-address').value = currentConfig.address || '';
  document.getElementById('asset-price-feed').value = currentConfig.priceFeed || '';
  document.getElementById('asset-icon').value = currentConfig.icon || '';

  // Add reset button if there's an override
  const submitBtn = document.getElementById('asset-form-submit');
  let resetBtn = document.getElementById('asset-reset-btn');

  if (override && !resetBtn) {
    resetBtn = document.createElement('button');
    resetBtn.id = 'asset-reset-btn';
    resetBtn.textContent = 'Reset to Default';
    resetBtn.onclick = resetBuiltInAsset;
    submitBtn.parentNode.insertBefore(resetBtn, submitBtn.nextSibling);
  } else if (!override && resetBtn) {
    resetBtn.remove();
  }

  document.getElementById('asset-form-container').style.display = 'block';
}

function hideAssetForm() {
  document.getElementById('asset-form-container').style.display = 'none';
  currentEditingAssetIndex = null;
  currentEditingBuiltInAsset = null;

  // Remove reset button if it exists
  const resetBtn = document.getElementById('asset-reset-btn');
  if (resetBtn) resetBtn.remove();
}

function saveAsset() {
  if (!currentAssetChain) return;

  const assetConfig = {
    symbol: document.getElementById('asset-symbol').value.trim(),
    name: document.getElementById('asset-name').value.trim(),
    decimals: parseInt(document.getElementById('asset-decimals').value) || 18,
    address: document.getElementById('asset-address').value.trim(),
    priceFeed: document.getElementById('asset-price-feed').value.trim(),
    icon: document.getElementById('asset-icon').value.trim()
  };

  try {
    if (currentEditingBuiltInAsset) {
      // Update built-in asset override
      const overrideConfig = {};
      if (assetConfig.name) overrideConfig.name = assetConfig.name;
      if (assetConfig.decimals) overrideConfig.decimals = assetConfig.decimals;
      if (assetConfig.address) overrideConfig.address = assetConfig.address;
      if (assetConfig.priceFeed) overrideConfig.priceFeed = assetConfig.priceFeed;
      if (assetConfig.icon) overrideConfig.icon = assetConfig.icon;

      setBuiltInAssetOverride(
        currentEditingBuiltInAsset.networkMode,
        currentEditingBuiltInAsset.chainId,
        currentEditingBuiltInAsset.symbol,
        overrideConfig
      );
      showMessage('Asset configuration updated successfully', true);
    } else if (currentEditingAssetIndex !== null) {
      // Update existing custom asset
      updateCustomAsset(currentAssetChain.networkMode, currentAssetChain.chainId, currentEditingAssetIndex, assetConfig);
      showMessage('Asset updated successfully', true);
    } else {
      // Add new custom asset
      addCustomAsset(currentAssetChain.networkMode, currentAssetChain.chainId, assetConfig);
      showMessage('Asset added successfully', true);
    }
    hideAssetForm();
    loadAssetListForChain(currentAssetChain.networkMode, currentAssetChain.chainId);
  } catch (error) {
    showMessage(error.message, false);
  }
}

function resetBuiltInAsset() {
  if (!currentEditingBuiltInAsset) return;

  if (confirm(`Reset ${currentEditingBuiltInAsset.symbol} to default configuration?`)) {
    resetBuiltInAssetOverride(
      currentEditingBuiltInAsset.networkMode,
      currentEditingBuiltInAsset.chainId,
      currentEditingBuiltInAsset.symbol
    );
    showMessage('Asset reset to default successfully', true);
    hideAssetForm();
    loadAssetListForChain(currentAssetChain.networkMode, currentAssetChain.chainId);
  }
}

function toggleBuiltInAssetVisibility(networkMode, chainId, assetSymbol) {
  if (isAssetHidden(networkMode, chainId, assetSymbol)) {
    showBuiltInAsset(networkMode, chainId, assetSymbol);
    showMessage('Asset shown', true);
  } else {
    hideBuiltInAsset(networkMode, chainId, assetSymbol);
    showMessage('Asset hidden', true);
  }

  // Reload the asset list
  loadAssetListForChain(networkMode, chainId);
}

function deleteAssetWithConfirm(networkMode, chainId, assetIndex) {
  const customAssetsForChain = getCustomAssetsForChain(networkMode, chainId);
  if (!customAssetsForChain[assetIndex]) return;

  const asset = customAssetsForChain[assetIndex];

  if (confirm(`Are you sure you want to delete ${asset.symbol}?`)) {
    try {
      deleteCustomAsset(networkMode, chainId, assetIndex);
      showMessage('Asset deleted successfully', true);
      loadAssetListForChain(networkMode, chainId);
    } catch (error) {
      showMessage(error.message, false);
    }
  }
}

// Export functions for inline handlers (will be removed)
window.closeAllModals = closeAllModals;
window.logout = logout;
window.send = send;
window.startScan = startScan;
window.setAddress = setAddress;
window.share = share;
window.toggleModal = toggleModal;
window.setNetworkMode = setNetworkMode;
window.setTheme = setTheme;
window.switchSettingsTab = switchSettingsTab;
window.copyAddress = copyAddress;
window.copyReceiveAddress = copyReceiveAddress;
window.showAddChainForm = showAddChainForm;
window.hideChainForm = hideChainForm;
window.saveChain = saveChain;
window.showEditChainForm = showEditChainForm;
window.deleteChainWithConfirm = deleteChainWithConfirm;
window.showImportChainDialog = showImportChainDialog;
window.exportChains = exportChains;
window.showTokenManagement = showTokenManagement;
window.hideTokenManagement = hideTokenManagement;
window.showAddTokenForm = showAddTokenForm;
window.hideTokenForm = hideTokenForm;
window.saveToken = saveToken;
window.deleteTokenWithConfirm = deleteTokenWithConfirm;
window.toggleBuiltInChainVisibility = toggleBuiltInChainVisibility;
window.showEditRpcForm = showEditRpcForm;
window.hideRpcForm = hideRpcForm;
window.saveRpcUrl = saveRpcUrl;
window.resetRpcUrl = resetRpcUrl;
window.showAddAssetForm = showAddAssetForm;
window.showEditAssetForm = showEditAssetForm;
window.showEditBuiltInAssetForm = showEditBuiltInAssetForm;
window.hideAssetForm = hideAssetForm;
window.saveAsset = saveAsset;
window.resetBuiltInAsset = resetBuiltInAsset;
window.deleteAssetWithConfirm = deleteAssetWithConfirm;
window.toggleBuiltInAssetVisibility = toggleBuiltInAssetVisibility;

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
