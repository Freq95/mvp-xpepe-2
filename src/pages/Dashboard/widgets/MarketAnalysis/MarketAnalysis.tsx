// --- file: src/pages/Dashboard/widgets/XpepeWidget/XpepeMarketWidget.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGetAccount } from 'lib';
import { OutputContainer, Button } from 'components';
import { useGetNFTs } from 'hooks/transactions/useGetNFTs';
import lockSvg from 'assets/img/lock-34.svg?url';


/**
 * XPEPE Market Widget (NFT-gated)
 * - Shows 2 progress bars (Hold/Sell and Bitcoin↔Altseason)
 * - Table with 6 cols: Indicator, Current, Reference, Hit, Timestamp, Progress
 * - Live data sources (same as HTML): CBBI JSON, CoinGecko/Binance (prices & dominance), Altseason scraper via allorigins proxy
 * - Gated (blur) for wallets without at least 1 NFT from XPEPE-937414
 * - All code self-contained in this file (hooks + bus cache)
 */

// =====================
// Small utils
// =====================
const fmt = (n: any) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  if (Math.abs(v) >= 1e12) return (v / 1e12).toFixed(2) + 'T';
  if (Math.abs(v) >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'k';
  if (Math.abs(v) < 1 && v !== 0) return v.toPrecision(3);
  return ('' + v.toFixed(4)).replace(/\.?0+$/, '');
};

const tsNow = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

function movingAverage(arr: number[], p: number) {
  const out: number[] = []; let s = 0;
  for (let i = 0; i < arr.length; i++) {
    s += arr[i]; if (i >= p) s -= arr[i - p];
    if (i >= p - 1) out.push(s / p);
  }
  return out;
}

function RSI(closes: number[], period = 22) {
  if (!closes || closes.length < period + 1) return NaN;
  let g = 0, l = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) g += d; else l -= d;
  }
  g /= period; l /= period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    g = (g * (period - 1) + (d > 0 ? d : 0)) / period;
    l = (l * (period - 1) + (d < 0 ? -d : 0)) / period;
  }
  const rs = l === 0 ? 100 : g / l;
  return 100 - 100 / (1 + rs);
}

function hit(op: '>=' | '<=' | null, cur?: number, refNum?: number) {
  if (!op || cur == null || !Number.isFinite(cur) || refNum == null || !Number.isFinite(refNum)) return { h: false, d: NaN };
  if (op === '>=') return { h: cur >= refNum, d: Math.max(0, refNum - cur) };
  return { h: cur <= refNum, d: Math.max(0, cur - refNum) };
}

function progressPercent(op: '>=' | '<=' | null, cur?: number, refNum?: number) {
  if (!op || refNum == null || !Number.isFinite(refNum)) return null;
  if (!Number.isFinite(cur!)) return 0;
  if (op === '>=') return Math.max(0, Math.min(100, (cur! / refNum) * 100));
  return Math.max(0, Math.min(100, (refNum / cur!) * 100));
}

// =====================
// Shared Bus (cache like in HTML)
// =====================
const Bus = {
  prices: null as null | { closes: number[]; now: number; src: string },
  dominance: null as null | number,
};

async function fetchPrices(): Promise<{ closes: number[]; now: number; src: string }> {
  if (Bus.prices) return Bus.prices;
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=2000', { cache: 'no-store' });
    const j = await r.json();
    const closes: number[] = (j.prices || []).map((p: [number, number]) => p[1]);
    if (closes.length) {
      const now = closes.at(-1)!;
      Bus.prices = { closes, now, src: 'CoinGecko' };
      return Bus.prices;
    }
  } catch {}
  // fallback to Binance (2 calls to get ~2k days)
  const p1 = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=1000');
  const a1 = await p1.json();
  const start = a1[a1.length - 1][0] + 86400000;
  const p2 = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${start}&limit=1000`);
  const a2 = await p2.json();
  const arr = [...a1, ...a2];
  const closes = arr.map((x: any[]) => +x[4]);
  const now = closes.at(-1)!;
  Bus.prices = { closes, now, src: 'Binance' };
  return Bus.prices;
}

async function fetchDominance(): Promise<number> {
  if (Bus.dominance != null) return Bus.dominance;
  const j = await fetch('https://api.coingecko.com/api/v3/global', { cache: 'no-store' }).then(r => r.json());
  const dom = (j.data ? j.data.market_cap_percentage.btc : j.market_cap_percentage.btc) as number;
  Bus.dominance = dom;
  return dom;
}

async function fetchCBBI(): Promise<any> {
  return fetch('https://colintalkscrypto.com/cbbi/data/latest.json', { cache: 'no-store' }).then(r => r.json());
}

async function fetchAltseason(): Promise<number | null> {
  try {
    const proxy = 'https://api.allorigins.win/raw?url=';
    const target = 'https://www.blockchaincenter.net/en/altcoin-season-index/';
    const html = await fetch(proxy + encodeURIComponent(target), { cache: 'no-store' }).then(r => r.text());
    // Try to extract a 0-100 number — mimic HTML patterns
    const main = html.match(/<div[^>]*font-size:\s*\d+px[^>]*>(\d{1,3})<\/div>/i);
    if (main) {
      const v = Number(main[1]);
      if (v >= 0 && v <= 100) return v;
    }
    const fallback = [...html.matchAll(/>(\d{1,3})<\/div>/g)].map(m => Number(m[1])).find(v => v >= 0 && v <= 100);
    return fallback ?? null;
  } catch {
    return null;
  }
}

// =====================
// Types
// =====================
interface RowMeta {
  key: string;
  name: string;
  op: '>=' | '<=' | null;
  refNum: number | null;
  loader: () => Promise<Partial<RowData> & { cur?: number; op?: '>=' | '<='; refNum?: number } | null>;
}

interface RowData {
  key: string;
  name: string;
  op: '>=' | '<=' | null;
  refNum: number | null;
  cur?: number;
  h: boolean;
  d: number;
  t: string;
  src?: string;
}

// =====================
// Build indicator definitions (same sources)
// =====================
function useIndicatorDefs() {
  const defs = useMemo<RowMeta[]>(() => [
    // Dominance (CG)
    {
      key: 'Dominance', name: 'Bitcoin Dominance', op: '<=', refNum: 45,
      loader: async () => {
        const dom = await fetchDominance();
        const cur = dom + 2 /* TV offset like HTML */;
        return { cur, src: 'CoinGecko' };
      }
    },
    // Pi Cycle Top (price derived)
    {
      key: 'PiCycleTop', name: 'Pi Cycle Top', op: '>=', refNum: 1,
      loader: async () => {
        const { closes, src } = await fetchPrices();
        const ma350 = movingAverage(closes, 350).at(-1)!;
        const ma111 = movingAverage(closes, 111).at(-1)!;
        const ratio = ma111 / (2 * ma350);
        return { cur: ratio, src: `${src} (calc)` };
      }
    },
    // RSI 22D (price)
    {
      key: 'RSI22D', name: 'RSI — 22 Day', op: '>=', refNum: 80,
      loader: async () => {
        const { closes, src } = await fetchPrices();
        const r = RSI(closes, 22);
        return { cur: r, src: `${src} (calc)` };
      }
    },
    // Mayer Multiple (price)
    {
      key: 'MayerMultiple', name: 'Mayer Multiple', op: '>=', refNum: 2.2,
      loader: async () => {
        const { closes, now, src } = await fetchPrices();
        const ma200 = movingAverage(closes, 200).at(-1)!;
        const mm = now / ma200;
        return { cur: mm, src: `${src} (calc)` };
      }
    },
    // Golden Ratio (φ * MA350)
    {
      key: 'GRM', name: 'Golden Ratio (φ · MA350)', op: '>=', refNum: undefined as any, // dynamic
      loader: async () => {
        const { closes, now, src } = await fetchPrices();
        const phi = 1.61803398875;
        const ma350 = movingAverage(closes, 350).at(-1)!;
        const thr = ma350 * Math.pow(phi, 1);
        return { cur: now, op: '>=', refNum: thr, src: `${src} (calc)` };
      }
    },
    // CBBI fan-out subset
    {
      key: 'PuellMultiple', name: 'Puell Multiple', op: '>=', refNum: 2,
      loader: async () => {
        const j = await fetchCBBI();
        const obj = j.PuellMultiple || j.puell_multiple || j.data?.PuellMultiple || j.data?.puell_multiple;
        if (!obj) return null;
        const entries = Object.entries(obj).map(([k, v]) => [Number(k), Number(v)]).sort((a, b) => a[0] - b[0]);
        const [ts, val] = entries.at(-1)!;
        const value = val * 1.342; // HTML calibration
        return { cur: value, src: 'CBBI JSON', t: new Date(ts * 1000).toISOString().replace('T', ' ').slice(0, 19) };
      }
    },
    {
      key: 'Price', name: "Bitcoin Smithson's Forecast", op: '>=', refNum: 175000,
      loader: async () => {
        const j = await fetchCBBI();
        const obj = j.Price || j.data?.Price || j.price;
        const entries = Object.entries(obj).map(([k, v]) => [Number(k), Number(v)]).sort((a, b) => a[0] - b[0]);
        const [ts, val] = entries.at(-1)!;
        return { cur: Number(val), src: 'CBBI JSON', t: new Date(ts * 1000).toISOString().replace('T', ' ').slice(0, 19) };
      }
    },
    {
      key: 'RUPL', name: 'RUPL', op: '>=', refNum: 15,
      loader: async () => {
        const j = await fetchCBBI();
        const obj = j.RUPL || j.data?.RUPL;
        const entries = Object.entries(obj).map(([k, v]) => [Number(k), Number(v)]).sort((a, b) => a[0] - b[0]);
        const [ts, val] = entries.at(-1)!;
        return { cur: Number(val), src: 'CBBI JSON', t: new Date(ts * 1000).toISOString().replace('T', ' ').slice(0, 19) };
      }
    },
    {
      key: 'Trolololo', name: 'Trolololo', op: '>=', refNum: 1.4,
      loader: async () => {
        const j = await fetchCBBI();
        const obj = j.Trolololo || j.data?.Trolololo;
        const entries = Object.entries(obj).map(([k, v]) => [Number(k), Number(v)]).sort((a, b) => a[0] - b[0]);
        const [ts, val] = entries.at(-1)!;
        return { cur: Number(val), src: 'CBBI JSON', t: new Date(ts * 1000).toISOString().replace('T', ' ').slice(0, 19) };
      }
    },
    {
      key: 'Confidence', name: 'CBBI Confidence', op: '>=', refNum: 0.9,
      loader: async () => {
        const j = await fetchCBBI();
        const val = Number(j.cbbi || j.data?.cbbi || j.score || j.latest?.cbbi);
        return { cur: val, src: 'CBBI JSON', t: tsNow() };
      }
    },
    // Altseason
    {
      key: 'Altseason', name: 'Altcoin Season Index', op: '>=', refNum: 75,
      loader: async () => {
        const v = await fetchAltseason();
        if (v == null) return { cur: undefined, src: 'allorigins proxy (failed)' } as any;
        return { cur: v, src: 'blockchaincenter (via proxy)' };
      }
    }
  ], []);
  return defs;
}

// =====================
// Main component
// =====================
export const MarketAnalysis: React.FC = () => {
  const { address } = useGetAccount();
  const { nfts, isLoading: nftsLoading } = useGetNFTs(address);
  const ownsXpepe = useMemo(() => nfts?.some((n) => n.collection === 'XPEPE-937414') ?? false, [nfts]);

  const defs = useIndicatorDefs();

  const [rows, setRows] = useState<Record<string, RowData>>(() => {
    const seed: Record<string, RowData> = {};
    defs.forEach(d => {
      seed[d.key] = {
        key: d.key, name: d.name, op: d.op, refNum: d.refNum ?? null,
        cur: undefined, h: false, d: NaN, t: '—', src: undefined
      };
    });
    return seed;
  });

  const [loading, setLoading] = useState(true);
  const [holdSellPct, setHoldSellPct] = useState({ hold: 0, sell: 0 });
  const [altIndex, setAltIndex] = useState<number | null>(null);

  const refresh = async () => {
    setLoading(true);
    // run all loaders concurrently; update rows progressively
    const updates = defs.map(async (d) => {
      try {
        const r = await d.loader();
        if (!r) return; // skip
        setRows(prev => {
          const prevRow = prev[d.key];
          const op = (r as any).op ?? prevRow.op;
          const refNum = (r as any).refNum ?? prevRow.refNum;
          const cur = (r as any).cur ?? prevRow.cur;
          const H = hit(op, cur as number, refNum as number);
          const next: RowData = {
            key: d.key,
            name: d.name,
            op,
            refNum: refNum ?? null,
            cur: cur as number,
            h: H.h,
            d: H.d,
            t: (r as any).t || tsNow(),
            src: (r as any).src || prevRow.src
          };
          return { ...prev, [d.key]: next };
        });
        if (d.key === 'Altseason' && (r as any).cur != null) {
          setAltIndex((r as any).cur as number);
        }
      } catch (e) {
        // leave row as skeleton
      }
    });
    await Promise.allSettled(updates);
    setLoading(false);
  };

  // first load
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // recompute Hold/Sell bar whenever rows change
  useEffect(() => {
    const list = Object.values(rows);
    const filled = list.filter(r => r.cur != null && Number.isFinite(r.cur) && r.op && r.refNum != null);
    const hits = filled.filter(r => r.h).length;
    const total = filled.length;
    const sell = total > 0 ? Math.round((hits / total) * 100) : 0;
    setHoldSellPct({ sell, hold: 100 - sell });
  }, [rows]);

  const blurAll = !ownsXpepe && !nftsLoading;

  // styling helpers for progress bars
  const markerStyle = (pct: number) => ({ left: `${Math.max(0, Math.min(100, pct))}%` });

  const orderedKeys = useMemo(() => [
    'Dominance', 'PiCycleTop', 'RSI22D', 'MayerMultiple', 'GRM',
    'PuellMultiple', 'Price', 'RUPL', 'Trolololo', 'Confidence', 'Altseason'
  ].filter(k => rows[k]), [rows]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold"></h3>
        <div className="flex items-center gap-2">
          <Button onClick={refresh}>Refresh</Button>
        </div>
      </div>

      <OutputContainer>
        <div className={(blurAll ? 'blur-sm pointer-events-none select-none ' : '') + 'space-y-3'}>
          {/* Hold/Sell bar */}
          <div className="flex items-center gap-3">
            <span className="opacity-70 w-24 shrink-0">Hold {holdSellPct.hold}%</span>
            <div className="flex-1 h-3 rounded-full border border-white/10 bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 relative overflow-hidden">
              <span className="absolute top-[-2px] w-[2px] h-[18px] bg-white/90 shadow" style={markerStyle(holdSellPct.sell)} />
            </div>
            <span className="opacity-70 w-16 shrink-0 text-right">{holdSellPct.sell}% Sell</span>
          </div>

          {/* Bitcoin ↔ Altseason bar */}
          <div className="flex items-center gap-3">
            <span className="opacity-70 w-32 shrink-0">Bitcoin Season</span>
            <div className="flex-1 h-3 rounded-full border border-white/10 bg-gradient-to-r from-blue-900 via-blue-500 via-cyan-400 via-green-400 via-amber-400 to-red-500 relative overflow-hidden">
              <span className="absolute top-[-2px] w-[2px] h-[18px] bg-white/90 shadow" style={markerStyle(altIndex ?? 0)} />
              <span className="absolute -top-6 text-xs px-2 py-0.5 rounded-md border border-white/10 bg-black/40" style={{ left: `${Math.max(0, Math.min(100, altIndex ?? 0))}%`, transform: 'translateX(-50%)' }}>
                Index: {altIndex != null ? Math.round(altIndex) : '—'}
              </span>
            </div>
            <span className="opacity-70 w-32 shrink-0 text-right">Altcoin Season</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left opacity-70">
                  <th className="py-2">Indicator</th>
                  <th className="py-2">Current</th>
                  <th className="py-2">Reference</th>
                  <th className="py-2">Hit</th>
                  <th className="py-2">Timestamp</th>
                  <th className="py-2">Progress</th>
                </tr>
              </thead>
              <tbody>
                {orderedKeys.map((k) => {
                  const r = rows[k];
                  const op = r.op;
                  const ref = r.refNum;
                  const perc = progressPercent(op, r.cur, ref ?? undefined);
                  return (
                    <tr key={k} className="border-t">
                      <td className="py-2 pr-2">{r.name}</td>
                      <td className="py-2 min-w-[90px]">{r.cur == null ? <span className="opacity-60">loading…</span> : fmt(r.cur)}</td>
                      <td className="py-2">{op && ref != null ? (<code className="rounded px-2 py-0.5 bg-white/5 border border-white/10">{op} {fmt(ref)}</code>) : '—'}</td>
                      <td className="py-2">{r.cur == null ? '—' : (r.h ? '✔️' : '✖️')}</td>
                      <td className="py-2">{r.t}</td>
                      <td className="py-2 min-w-[160px]">
                        {perc == null ? '—' : (
                          <div className="h-2 rounded-full border border-white/10 bg-black/30 relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0" style={{ width: `${Math.max(0, Math.min(100, perc)).toFixed(2)}%` }} />
                            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-400 via-sky-300 to-white/80" style={{ width: `${Math.max(0, Math.min(100, perc)).toFixed(2)}%` }} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {orderedKeys.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center opacity-70">No indicators</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gate message */}
        {!ownsXpepe && !nftsLoading && (
          <p className="mt-2 text-center text-sm opacity-70 flex items-center justify-center gap-2">
                <img src={lockSvg} alt="lock" className="h-4 w-4" />
                view access granted only to xPEPE NFT holders
          </p>
        )}
      </OutputContainer>
    </div>
  );
};

export default MarketAnalysis;
