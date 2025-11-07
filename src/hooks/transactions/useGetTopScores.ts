// src/hooks/transactions/useGetTopScores.ts — FIX: decode full MultiValueEncoded
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { contractAddressScoreBoard } from 'config';
import { useGetNetworkConfig, Address } from 'lib';

export type TopItem = { address: string; score: number };

function b64ToBytes(b64: string): Uint8Array {
  const bin = typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const toHex = (u8: Uint8Array) => Array.from(u8, (b) => b.toString(16).padStart(2, '0')).join('');
const readUnsignedBE = (u8: Uint8Array, off: number, len: number) => Number(u8.slice(off, off + len).reduce((acc, b) => (acc << 8n) | BigInt(b), 0n));

function pubkeyToBech32(pubkey: Uint8Array): string {
  try {
    const a: any = typeof Buffer !== 'undefined' ? new (Address as any)(Buffer.from(pubkey)) : new (Address as any)(pubkey);
    if (a && typeof a.bech32 === 'function') return a.bech32();
  } catch {}
  return '0x' + toHex(pubkey);
}

// Robust decoder: supports both encodings
// A) one big item (all tuples concatenated)
// B) one item per tuple (most common for MultiValueEncoded of tuples)
async function queryAndParse(api: string, forceRefresh = false): Promise<TopItem[]> {
  // Add timestamp to URL to bust any URL-level caching
  const timestamp = Date.now();
  const url = `${api.replace(/\/$/, '')}/vm-values/query${forceRefresh ? `?_t=${timestamp}` : ''}`;
  
  // Request body - keep it clean for the API
  const requestBody = { 
    scAddress: contractAddressScoreBoard, 
    funcName: 'getTop', 
    args: [] 
  };
  
  const config = forceRefresh ? {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Request-Time': String(timestamp) // Custom header for cache busting
    }
  } : {};
  
  const { data: resp } = await axios.post(
    url, 
    requestBody,
    config
  );
  const rd: string[] = resp?.data?.data?.returnData || resp?.data?.returnData || resp?.returnData || [];
  if (!rd?.length) return [];

  const parseBuffer = (bytes: Uint8Array): TopItem[] => {
    const tuple40 = 40, tuple36 = 36;
    const total = bytes.length;
    // if it is exactly one tuple, length should be 36/40
    if (total === tuple36 || total === tuple40) {
      const scoreLen = total - 32;
      const pk = bytes.slice(0, 32);
      const score = readUnsignedBE(bytes, 32, scoreLen);
      return [{ address: pubkeyToBech32(pk), score }];
    }
    // otherwise, read as concatenated tuples
    const tuple = total % tuple40 === 0 ? tuple40 : total % tuple36 === 0 ? tuple36 : tuple40;
    const scoreLen = tuple - 32;
    const out: TopItem[] = [];
    for (let off = 0; off + tuple <= bytes.length; off += tuple) {
      const pk = bytes.slice(off, off + 32);
      const score = readUnsignedBE(bytes, off + 32, scoreLen);
      out.push({ address: pubkeyToBech32(pk), score });
    }
    return out;
  };

  // Collect from all returnData items
  const items: TopItem[] = [];
  for (const b64 of rd) items.push(...parseBuffer(b64ToBytes(b64)));

  items.sort((a, b) => b.score - a.score);
  return items.slice(0, 10);
}

export function useGetTopScores() {
  const { network } = useGetNetworkConfig();
  const [data, setData] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (forceRefresh = true) => {
    console.log('🔄 Refreshing top scores from blockchain...', forceRefresh ? '(forced, cache-busted)' : '');
    setLoading(true);
    setError(null);
    
    // Store previous data for comparison
    let previousData: TopItem[] = [];
    setData(prev => {
      previousData = prev;
      return []; // Clear immediately to show loading state
    });
    
    try {
      const newData = await queryAndParse(network.apiAddress, forceRefresh);
      console.log('✅ Top scores fetched:', newData);
      
      // Force a complete state update by creating new objects with fresh references
      const freshData = newData.map((item, index) => ({ 
        address: String(item.address), 
        score: Number(item.score),
        _key: `${item.address}-${item.score}-${Date.now()}-${index}` // Add unique key
      }));
      
      // Compare data to see if it changed
      const prevStr = JSON.stringify(previousData.map(d => ({ address: d.address, score: d.score })));
      const newStr = JSON.stringify(freshData.map(d => ({ address: d.address, score: d.score })));
      const dataChanged = prevStr !== newStr;
      
      if (dataChanged) {
        console.log('📊 Scoreboard data changed - updating UI');
      } else {
        console.log('⚠️ Scoreboard data unchanged - but forcing re-render anyway');
      }
      
      // Always update state, even if data appears the same (to force re-render)
      // Use a small delay to ensure React processes the state change
      await new Promise(resolve => setTimeout(resolve, 10));
      setData(freshData.map(({ _key, ...item }) => item)); // Remove _key before setting state
      
    } catch (e: any) {
      console.error('❌ Error fetching top scores:', e);
      setError(e?.message || 'parse failed');
      setData([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [network.apiAddress]);

  useEffect(() => { refresh(false); }, [refresh]); // Initial load without force refresh
  return { data, loading, error, refresh };
}
