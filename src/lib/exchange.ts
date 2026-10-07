import { getStoredExchangeRate, saveStoredExchangeRate } from './db';

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

export interface ExchangeRateResponse {
  rate: number;
  source: 'api' | 'cache' | 'fallback';
  updatedAt: string;
}

export async function fetchGbpToInrRate(): Promise<ExchangeRateResponse> {
  const cached = getStoredExchangeRate();
  const now = Date.now();

  // If cached rate is fresh, return it immediately
  if (cached && (now - cached.updatedAt) < CACHE_DURATION_MS) {
    return {
      rate: cached.rate,
      source: 'cache',
      updatedAt: new Date(cached.updatedAt).toLocaleTimeString()
    };
  }

  try {
    // Try to fetch from the open.er-api.com (free, no key required API)
    const response = await fetch('https://open.er-api.com/v6/latest/GBP');
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    const rate = data?.rates?.INR;
    
    if (rate && typeof rate === 'number') {
      saveStoredExchangeRate(rate);
      return {
        rate,
        source: 'api',
        updatedAt: new Date().toLocaleTimeString()
      };
    }
  } catch (error) {
    console.warn('Failed to fetch live GBP->INR rate, using cached/fallback rate:', error);
  }

  // Fallback to cache or hardcoded default
  const fallbackRate = cached ? cached.rate : 129.42;
  const lastUpdated = cached ? cached.updatedAt : now;
  
  return {
    rate: fallbackRate,
    source: 'fallback',
    updatedAt: new Date(lastUpdated).toLocaleTimeString() + ' (Offline)'
  };
}
