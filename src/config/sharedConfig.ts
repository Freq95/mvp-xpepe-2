// --- file: src/config/sharedConfig.ts
export const BATCH_TRANSACTIONS_SC = {
  egld_wEGLD: {
    contract: 'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
    data: 'wrapEgld'
  },
  wEGLD_USDC: {
    contract: 'erd1qqqqqqqqqqqqqpgqtqfhy99su9xzjjrq59kpzpp25udtc9eq0n4sr90ax6',
    data: 'ESDTTransfer@5745474C442D613238633539@06f05b59d3b20000@73776170546f6b656e734669786564496e707574@555344432D333530633465@01'
  },
  wEGLD_MEX: {
    contract: 'erd1qqqqqqqqqqqqqpgqzw0d0tj25qme9e4ukverjjjqle6xamay0n4s5r0v9g',
    data: 'ESDTTransfer@5745474C442D613238633539@06f05b59d3b20000@73776170546f6b656e734669786564496e707574@4D45582D613635396430@01'
  },
  lock_MEX: {
    contract: 'erd1qqqqqqqqqqqqqpgq2l97gw2j4wnlem4y2rx7dudqlssjtwpu0n4sd0u3w2',
    data: 'ESDTTransfer@4D45582D613635396430@0de0b6b3a7640000@6c6f636b546f6b656e73@05a0'
  },
  multiTransfer_wEGLD_USDC: {
    data: 'MultiESDTNFTTransfer@address@02@5745474C442D613238633539@00@06f05b59d3b20000@555344432D333530633465@00@0f4240'
  }
};

export const GITHUB_REPO_URL = 'https://github.com/multiversx/mx-template-dapp';
export const apiTimeout = 6000;
export const nativeAuth = true;
export const transactionSize = 10;

// Generate your own WalletConnect 2 ProjectId here: https://cloud.walletconnect.com/app
export const walletConnectV2ProjectId = '9b1a9564f91cb659ffe21b73d5c4f2b8';
export const walletConnectDeepLink =
  process.env.WALLET_CONNECT_DEEP_LINK ?? undefined;

// API configuration
// Note: Vercel environment variables may not be passed to Vite build
// This fallback detects production and uses the deployed backend
const getBackendUrl = () => {
  // First, try environment variable (works if Vercel passes it)
  if (process.env.VITE_ANALYTICS_API_URL) {
    return process.env.VITE_ANALYTICS_API_URL;
  }
  
  // Fallback: detect environment from hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // Production - use deployed backend
    // TODO: Update this if backend URL changes
    return 'https://mvx-xpepe.vercel.app';
  }
  
  // Server-side or build time fallback
  return 'http://localhost:3001';
};

export const ANALYTICS_API_URL = getBackendUrl();

// Debug: Log the API URL (only in development or if explicitly enabled)
if (typeof window !== 'undefined') {
  console.log('🔍 ANALYTICS_API_URL configured as:', ANALYTICS_API_URL);
  console.log('🔍 VITE_ANALYTICS_API_URL env var:', process.env.VITE_ANALYTICS_API_URL || 'NOT SET');
}