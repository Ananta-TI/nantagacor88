// src/pages/user/GachaPage.jsx
// ============================================================
// MAHJONG WAYS — Responsive & Real RTP Engine
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ArrowLeft, Coins, RefreshCcw, Zap, ChevronUp, ChevronDown, Play, Flame, AlertCircle } from 'lucide-react';

// ─── CONSTANTS ───────────────────────────────────────────────
const REELS        = 5;
const VISIBLE_ROWS = 3;
const STRIP_PAD    = 35;
const BET_OPTIONS  = [100, 300, 800, 1000, 2000, 3000, 5000, 8000];
const TARGET_RTP   = 0.92;

// ─── RESPONSIVE ENGINE ───────────────────────────────────────
const getResponsiveDimensions = () => {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
  if (w < 400) return { ITEM_H: 56, TILE_W: 50, GAP: 4, PAD: 8 };  // HP Kecil (iPhone SE)
  if (w < 640) return { ITEM_H: 72, TILE_W: 64, GAP: 5, PAD: 12 }; // HP Sedang/Besar
  if (w < 1024) return { ITEM_H: 90, TILE_W: 80, GAP: 6, PAD: 14 };// Tablet
  return { ITEM_H: 100, TILE_W: 90, GAP: 6, PAD: 16 };             // Desktop
};

// ─── PAYLINES ────────────────────────────────────────────────
const PAYLINES = [
  { id: 0,  label: 'Top',        color: '#f59e0b', coords: [[0,0],[1,0],[2,0],[3,0],[4,0]] },
  { id: 1,  label: 'Middle',     color: '#22c55e', coords: [[0,1],[1,1],[2,1],[3,1],[4,1]] },
  { id: 2,  label: 'Bottom',     color: '#3b82f6', coords: [[0,2],[1,2],[2,2],[3,2],[4,2]] },
  { id: 3,  label: 'V',          color: '#a855f7', coords: [[0,0],[1,1],[2,2],[3,1],[4,0]] },
  { id: 4,  label: 'Inv-V',      color: '#ef4444', coords: [[0,2],[1,1],[2,0],[3,1],[4,2]] },
  { id: 5,  label: 'ZigZag 1',   color: '#14b8a6', coords: [[0,0],[1,1],[2,0],[3,1],[4,0]] },
  { id: 6,  label: 'ZigZag 2',   color: '#f97316', coords: [[0,2],[1,1],[2,2],[3,1],[4,2]] },
  { id: 7,  label: 'Wave Down',  color: '#eab308', coords: [[0,1],[1,0],[2,1],[3,2],[4,1]] },
  { id: 8,  label: 'Wave Up',    color: '#8b5cf6', coords: [[0,1],[1,2],[2,1],[3,0],[4,1]] },
  { id: 9,  label: 'Chaos 1',    color: '#10b981', coords: [[0,0],[1,2],[2,1],[3,0],[4,2]] },
  { id: 10, label: 'Chaos 2',    color: '#f43f5e', coords: [[0,2],[1,0],[2,1],[3,2],[4,0]] },
];

// ─── PAYTABLE ────────────────────────────────────────────────
const PAYTABLE = {
  '5-Wild': 2000, '5-Scatter': 500, '5-Excalibur': 250, '5-Golden Tile': 150,
  '5-Red Dragon': 100, '5-Green Dragon': 80, '5-Circle 1': 50, '5-Bamboo 1': 30, '5-Character 1': 20, '5-Bamboo 2': 10,
  '4-Wild': 100,  '4-Scatter': 50,  '4-Excalibur': 25, '4-Golden Tile': 15,
  '4-Red Dragon': 10, '4-Green Dragon': 8, '4-Circle 1': 5, '4-Bamboo 1': 3, '4-Character 1': 2, '4-Bamboo 2': 1,
  '3-Wild': 10,   '3-Scatter': 5,   '3-Excalibur': 5,  '3-Golden Tile': 3,
  '3-Red Dragon': 2, '3-Green Dragon': 2, '3-Circle 1': 1, '3-Bamboo 1': 1, '3-Character 1': 1, '3-Bamboo 2': 1,
  '2-Wild': 0.5,  '2-Scatter': 0.5, '2-Excalibur': 0.2, '2-Golden Tile': 0.2, '2-Red Dragon': 0.2,
};

const SPIN_PATTERN = ['LOSE', 'LOSE', 'NEAR_MISS', 'MICRO_WIN', 'LOSE', 'SMALL_WIN', 'LOSE', 'NEAR_MISS', 'MICRO_WIN', 'LOSE'];

const BASE_TABLE = [
  { outcome: 'MICRO_WIN', p: 0.50 },
  { outcome: 'NEAR_MISS', p: 0.18 },
  { outcome: 'SMALL_WIN', p: 0.12 },
  { outcome: 'BIG_WIN',   p: 0.02 },
  { outcome: 'LOSE',      p: 1.00 },
];

// ─── HELPERS ────────────────────────────────────────────
function pickWeighted(items, filterFn) {
  const pool = filterFn ? items.filter(filterFn) : items;
  if (!pool.length) return items[0];
  const total = pool.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of pool) { r -= item.weight; if (r <= 0) return item; }
  return pool[pool.length - 1];
}

function buildAdjustedTable(rtpBias) {
  const bias = Math.max(-0.15, Math.min(0.15, rtpBias));
  return BASE_TABLE.map((row) => {
    let p = row.p;
    if (row.outcome === 'MICRO_WIN') p = Math.max(0.10, Math.min(0.72, p + bias * 1.2));
    if (row.outcome === 'SMALL_WIN') p = Math.max(0.03, Math.min(0.25, p + bias * 0.5));
    if (row.outcome === 'BIG_WIN')   p = Math.max(0.005, Math.min(0.06, p + bias * 0.2));
    return { ...row, p };
  });
}

function rollOutcome(table) {
  let cumulative = 0;
  const cumTable = [];
  for (const row of table) {
    cumulative += row.p;
    cumTable.push({ outcome: row.outcome, cum: Math.min(cumulative, 1) });
  }
  const r = Math.random();
  for (const row of cumTable) { if (r < row.cum) return row.outcome; }
  return 'LOSE';
}

function calcRtpBias(sessionWagered, sessionWon, balance, bet) {
  const sessionRtp = sessionWagered > 0 ? sessionWon / sessionWagered : TARGET_RTP;
  const driftBias  = (TARGET_RTP - sessionRtp) * 0.6;  
  const pressure  = Math.min(1, balance / (bet * 60));  
  const pressureBias = pressure < 0.3 ? +0.08 : pressure > 0.7 ? -0.05 : 0;
  return driftBias + pressureBias;
}

function buildFinalGrid(items, outcome, targetLine) {
  const grid = Array.from({ length: REELS }, () => Array.from({ length: VISIBLE_ROWS }, () => pickWeighted(items)));
  const coords = targetLine.coords;

  switch (outcome) {
    case 'BIG_WIN': {
      const sym = pickWeighted(items, i => (PAYTABLE[`5-${i.name}`] ?? 0) > 0);
      coords.forEach(([r, row]) => { grid[r][row] = sym; });
      break;
    }
    case 'SMALL_WIN': {
      const sym = pickWeighted(items, i => (PAYTABLE[`3-${i.name}`] ?? 0) >= 1);
      for (let i = 0; i < 3; i++) grid[coords[i][0]][coords[i][1]] = sym;
      grid[coords[3][0]][coords[3][1]] = pickWeighted(items, i => i.name !== sym.name);
      grid[coords[4][0]][coords[4][1]] = pickWeighted(items, i => i.name !== sym.name);
      break;
    }
    case 'MICRO_WIN': {
      const sym = pickWeighted(items, i => (PAYTABLE[`2-${i.name}`] ?? 0) > 0);
      grid[coords[0][0]][coords[0][1]] = sym;
      grid[coords[1][0]][coords[1][1]] = sym;
      grid[coords[2][0]][coords[2][1]] = pickWeighted(items, i => i.name !== sym.name);
      break;
    }
    case 'NEAR_MISS': {
      const depth = Math.random() < 0.45 ? 2 : (Math.random() < 0.82 ? 3 : 4);
      const bait  = pickWeighted(items, i => (PAYTABLE[`${depth}-${i.name}`] ?? 0) > 0 || (PAYTABLE[`4-${i.name}`] ?? 0) > 0);
      for (let i = 0; i < depth; i++) grid[coords[i][0]][coords[i][1]] = bait;
      grid[coords[depth][0]][coords[depth][1]] = pickWeighted(items, i => i.name !== bait.name);
      for (let i = depth + 1; i < REELS; i++) {
        grid[coords[i][0]][coords[i][1]] = Math.random() < 0.4 ? bait : pickWeighted(items, i => i.name !== bait.name);
      }
      break;
    }
    default: {
      const first = pickWeighted(items);
      grid[coords[0][0]][coords[0][1]] = first;
      grid[coords[1][0]][coords[1][1]] = pickWeighted(items, i => i.name !== first.name);
      break;
    }
  }
  return grid;
}

// ─── COMPONENT ───────────────────────────────────────────────
export default function GachaPage() {
  const navigate = useNavigate();
  
  const [dim, setDim] = useState(getResponsiveDimensions());
  
  useEffect(() => {
    const handleResize = () => setDim(getResponsiveDimensions());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [balance, setBalance] = useState(0);
  const [bet, setBet] = useState(BET_OPTIONS[0]);
  const [strips, setStrips] = useState(Array(REELS).fill([]));
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [winTiles, setWinTiles] = useState(new Set());
  const [lineResults, setLineResults] = useState([]);
  const [nearMiss, setNearMiss] = useState(false);
  const [anticipate, setAnticipate] = useState(false);
  const [autoLeft, setAutoLeft] = useState(0);
  const [stats, setStats] = useState({ spins: 0, wagered: 0, won: 0 });

  const balanceRef     = useRef(0);
  const betRef         = useRef(BET_OPTIONS[0]);
  const autoLeftRef    = useRef(0);
  const spinningRef    = useRef(false);
  const itemsRef       = useRef([]);
  const statsRef       = useRef({ spins: 0, wagered: 0, won: 0 });
  const patternIdxRef  = useRef(0);   
  const reelDivRefs    = useRef(Array.from({ length: REELS }, () => React.createRef()));
  const controls       = [useAnimation(), useAnimation(), useAnimation(), useAnimation(), useAnimation()];

  useEffect(() => { balanceRef.current  = balance; }, [balance]);
  useEffect(() => { betRef.current      = bet;     }, [bet]);
  useEffect(() => { autoLeftRef.current = autoLeft;}, [autoLeft]);
  useEffect(() => { itemsRef.current    = items;   }, [items]);
  useEffect(() => { statsRef.current    = stats;   }, [stats]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase.from('profiles').select('crystals').eq('id', user.id).single();
        if (profile) { setBalance(profile.crystals); balanceRef.current = profile.crystals; }
      }
      const { data: raw } = await supabase.from('gacha_items').select('*');
      if (raw) { setItems(raw); itemsRef.current = raw; }
    })();
  }, []);

  const spin = useCallback(async () => {
    if (spinningRef.current) return;
    const curItems  = itemsRef.current;
    const curBal    = balanceRef.current;
    const curBet    = betRef.current;
    const curStats  = statsRef.current;
    if (!curItems.length || curBal < curBet) return;

    spinningRef.current = true;
    setSpinning(true);
    setLastWin(0);
    setWinTiles(new Set());
    setLineResults([]);
    setNearMiss(false);
    setAnticipate(false);

    const balAfterBet = curBal - curBet;
    setBalance(balAfterBet);
    balanceRef.current = balAfterBet;

    const rtpBias = calcRtpBias(curStats.wagered, curStats.won, balAfterBet, curBet);
    const adjustedTable = buildAdjustedTable(rtpBias);

    let outcome;
    if (Math.random() < 0.20) {
      outcome = SPIN_PATTERN[patternIdxRef.current % SPIN_PATTERN.length];
      patternIdxRef.current++;
    } else {
      outcome = rollOutcome(adjustedTable);
    }

    const targetLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
    const finalGrid  = buildFinalGrid(curItems, outcome, targetLine);
    const fullStrips = finalGrid.map(col => [...Array.from({ length: STRIP_PAD }, () => pickWeighted(curItems)), ...col]);
    setStrips(fullStrips);

    const drama = ['BIG_WIN', 'SMALL_WIN', 'NEAR_MISS'].includes(outcome);

    const animations = controls.map(async (ctrl, i) => {
      const baseDuration = (outcome === 'LOSE' && !drama) ? 1.2 + (i * 0.15) : 2 + (i * 0.3);
      const delay = (outcome === 'LOSE' && !drama) ? i * 0.1 : i * 0.15;
      const isAnticipationReel = drama && i >= 3;
      
      if (isAnticipationReel && i === 3) setTimeout(() => setAnticipate(true), (baseDuration + delay) * 800);

      await ctrl.set({ y: 0 }); 
      await ctrl.start({
        y: -(STRIP_PAD * dim.ITEM_H),
        transition: {
          duration: isAnticipationReel ? baseDuration + 1.5 : baseDuration,
          delay: delay,
          ease: isAnticipationReel ? [0.45, 0.05, 0.55, 0.95] : [0.22, 1, 0.36, 1], 
        }
      });
    });

    await Promise.all(animations);

    setStrips(finalGrid);
    controls.forEach(ctrl => ctrl.set({ y: 0 }));

    // Cek Kemenangan
    let totalAmount = 0;
    const winTileSet = new Set();
    const lrs = [];

    for (const pl of PAYLINES) {
      const symbols = pl.coords.map(([r, row]) => finalGrid[r][row]);
      const first = symbols[0];
      let matchCount = 1;
      for (let i = 1; i < symbols.length; i++) {
        if (symbols[i].name === first.name || symbols[i].name === 'Wild' || first.name === 'Wild') matchCount++;
        else break;
      }
      if (matchCount >= 2) {
        const effectiveName = first.name === 'Wild' ? (symbols.find(s => s.name !== 'Wild')?.name ?? 'Wild') : first.name;
        const multiplier = PAYTABLE[`${matchCount}-${effectiveName}`] ?? 0;
        if (multiplier > 0) {
          const amt = Math.round(multiplier * curBet * 100) / 100;
          totalAmount += amt;
          pl.coords.slice(0, matchCount).forEach(([r, row]) => winTileSet.add(`${r}-${row}`));
          lrs.push({ amount: amt, lineId: pl.id });
        }
      }
    }

    const finalBalance = balAfterBet + totalAmount;
    setBalance(finalBalance);
    balanceRef.current = finalBalance;

    const newStats = { spins: curStats.spins + 1, wagered: curStats.wagered + curBet, won: curStats.won + totalAmount };
    setStats(newStats);
    statsRef.current = newStats;

    if (totalAmount > 0) {
      setLastWin(totalAmount);
      setWinTiles(winTileSet);
      setLineResults(lrs);
    } else if (outcome === 'NEAR_MISS') {
      setNearMiss(true);
    }

    if (userId) supabase.from('profiles').update({ crystals: finalBalance }).eq('id', userId);
    
    spinningRef.current = false;
    setSpinning(false);
    setAnticipate(false);

    if (autoLeftRef.current > 0) {
      const next = autoLeftRef.current - 1;
      setAutoLeft(next); autoLeftRef.current = next;
      setTimeout(() => spin(), totalAmount > 0 ? 1400 : 700);
    }
  }, [dim.ITEM_H, controls, userId]);

  const startAuto = useCallback((n) => {
    setAutoLeft(n); autoLeftRef.current = n;
    if (!spinningRef.current) spin();
  }, [spin]);

  const changeBet = (dir) => {
    if (spinningRef.current) return;
    setBet(cur => {
      const idx = BET_OPTIONS.indexOf(cur);
      if (dir === 'up' && idx < BET_OPTIONS.length - 1) return BET_OPTIONS[idx + 1];
      if (dir === 'down' && idx > 0) return BET_OPTIONS[idx - 1];
      return cur;
    });
  };

  const svgW = dim.PAD * 2 + REELS * dim.TILE_W + (REELS - 1) * dim.GAP;
  const svgH = dim.PAD * 2 + VISIBLE_ROWS * dim.ITEM_H;

  return (
    <div className="min-h-screen bg-[#060f0a] text-white overflow-x-hidden select-none pb-10"
         style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%,#0d2e1a 0%,#060f0a 70%)' }}>

      <div className="relative text-center pt-8 pb-3 max-w-6xl mx-auto px-4">
        <button 
          onClick={() => navigate(-1)} 
          disabled={spinning}
          className="absolute left-4 top-8 flex items-center gap-2 text-yellow-600 hover:text-yellow-400 bg-[#0a1f12] border border-[#1a3d22] px-3 py-2 rounded-xl transition-all active:scale-95 z-50 disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Back</span>
        </button>

        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tight"
            style={{ background: 'linear-gradient(180deg,#fef08a 0%,#eab308 45%,#92400e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Mahjong Ways
        </h1>
        <p className="text-[8px] md:text-[9px] tracking-[0.3em] md:tracking-[0.45em] text-yellow-700 mt-1 uppercase">5 Paylines · RTP Controlled</p>
      </div>

      {/* STATUS BAR */}
      <div className="max-w-3xl mx-auto px-2 md:px-4 mb-4 md:mb-6">
        <div className="flex justify-between items-center bg-[#0a1f12] border border-yellow-900/40 rounded-xl md:rounded-2xl px-3 md:px-5 py-2 md:py-3">
          <Stat label="Balance" value={balance.toLocaleString()} accent="text-yellow-300" />
          <AnimatePresence mode="wait">
            {lastWin > 0 ? (
              <motion.div key="win" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                className="text-green-400 font-black text-sm md:text-xl tabular-nums">
                +{lastWin.toLocaleString()} ✨
              </motion.div>
            ) : nearMiss && !spinning ? (
              <motion.div key="nm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-red-400 font-bold text-[10px] md:text-sm uppercase tracking-widest">
                Hampir! 😤
              </motion.div>
            ) : <div key="empty" className="w-16 md:w-24" />}
          </AnimatePresence>
          <Stat label="Bet" value={bet.toLocaleString()} accent="text-white" align="right" />
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto px-2 md:px-4 flex flex-col lg:flex-row gap-4 md:gap-6 items-center lg:items-start justify-center">

        {/* SLOT MACHINE */}
        <div className="flex flex-col items-center gap-3 w-full lg:w-auto overflow-hidden px-2">
          <div className={`relative rounded-2xl md:rounded-3xl border-4 transition-all duration-500 mx-auto
            ${anticipate ? 'border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.5)]' : 'border-[#1a4028] shadow-[0_20px_50px_rgba(0,0,0,0.7)]'}`}
            style={{ background: 'linear-gradient(180deg,#0c2418 0%,#071510 100%)', width: svgW }}>

            <div className="absolute top-0 inset-x-0 h-10 md:h-16 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none z-10" />

            <div className="relative mx-auto" style={{ height: svgH, width: svgW, padding: dim.PAD }}>
              
              {lineResults.length > 0 && !spinning && (
                <svg className="absolute inset-0 pointer-events-none z-30" width={svgW} height={svgH}>
                  {lineResults.map(lr => {
                    const pl = PAYLINES[lr.lineId];
                    return (
                      <path key={lr.lineId} d={pl.coords.map(([r, row], i) => `${i === 0 ? 'M' : 'L'} ${dim.PAD + r * (dim.TILE_W + dim.GAP) + dim.TILE_W / 2} ${dim.PAD + row * dim.ITEM_H + dim.ITEM_H / 2}`).join(' ')}
                            stroke={pl.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9"
                            style={{ filter: `drop-shadow(0 0 6px ${pl.color})` }} />
                    );
                  })}
                </svg>
              )}

              <div className="flex h-full" style={{ gap: dim.GAP }}>
                {Array.from({ length: REELS }, (_, reelIdx) => (
                  <div key={reelIdx}
                       className={`relative overflow-hidden rounded-lg md:rounded-xl flex-shrink-0 transition-all duration-300 ${anticipate && reelIdx >= 3 ? 'ring-2 ring-yellow-400/60' : ''}`}
                       style={{ width: dim.TILE_W, background: '#040e08', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)' }}>

                    <div className="absolute inset-x-0 top-0 h-6 md:h-8 z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom,#040e08,transparent)' }} />
                    <div className="absolute inset-x-0 bottom-0 h-6 md:h-8 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top,#040e08,transparent)' }} />

                    <motion.div animate={controls[reelIdx]} className="flex flex-col items-center will-change-transform">
                      {(strips[reelIdx] ?? []).map((item, rowIdx) => {
                        if (!item) return null;
                        const isFinal = strips[reelIdx]?.length === VISIBLE_ROWS;
                        const isWin = isFinal && winTiles.has(`${reelIdx}-${rowIdx}`);
                        const isDim = isFinal && winTiles.size > 0 && !isWin;
                        return (
                          <div key={rowIdx} className="flex-shrink-0 w-full" style={{ height: dim.ITEM_H, padding: dim.GAP / 2 }}>
                            <div className={`relative w-full h-full rounded-lg md:rounded-xl flex flex-col items-center justify-center transition-all duration-300
                              ${isWin ? 'ring-2 ring-yellow-400 scale-105 shadow-[0_0_15px_rgba(234,179,8,0.6)]' : ''}
                              ${isDim ? 'opacity-25 grayscale' : ''}`}
                              style={{ background: isWin ? 'linear-gradient(135deg,#fefce8,#fde68a)' : 'linear-gradient(135deg,#f5f5f5,#d1d1d1)', borderBottom: '3px solid rgba(0,0,0,0.2)' }}>
                              {item?.image_url && <img src={item.image_url} alt={item.name} className="w-3/5 h-3/5 object-contain drop-shadow" loading="lazy" />}
                              <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-tight mt-0.5 ${item?.name === 'Wild' ? 'text-red-600' : 'text-slate-700'}`}>
                                {item?.name ?? ''}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-2 md:h-3 bg-gradient-to-r from-yellow-900/30 via-yellow-600/20 to-yellow-900/30" />
          </div>

          <AnimatePresence>
            {lineResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2 flex-wrap justify-center max-w-[300px] md:max-w-full">
                {lineResults.map(lr => (
                  <div key={lr.lineId} className="px-2 py-1 rounded-md text-[10px] md:text-xs font-bold" style={{ background: `${PAYLINES[lr.lineId].color}22`, border: `1px solid ${PAYLINES[lr.lineId].color}55`, color: PAYLINES[lr.lineId].color }}>
                    {PAYLINES[lr.lineId].label}: +{lr.amount.toLocaleString()}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CONTROLS */}
        <div className="w-full lg:w-64 flex flex-col gap-3 md:gap-4 mt-2 md:mt-0">
          <div className="bg-[#0a1f12] border border-[#1a3d22] rounded-xl md:rounded-2xl p-3 md:p-4">
            <p className="text-[9px] md:text-[10px] text-yellow-700 uppercase tracking-widest mb-2">Bet Amount</p>
            <div className="flex items-center justify-between gap-2">
              <button onClick={() => changeBet('down')} disabled={spinning || bet === BET_OPTIONS[0]} className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#0f2e1a] border border-[#1a4028] text-yellow-500 text-lg md:text-xl font-black hover:bg-[#1a4028] disabled:opacity-30 transition-all active:scale-90">−</button>
              <span className="font-mono font-black text-xl md:text-2xl text-white flex-1 text-center">{bet}</span>
              <button onClick={() => changeBet('up')} disabled={spinning || bet === BET_OPTIONS[BET_OPTIONS.length - 1]} className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#0f2e1a] border border-[#1a4028] text-yellow-500 text-lg md:text-xl font-black hover:bg-[#1a4028] disabled:opacity-30 transition-all active:scale-90">+</button>
            </div>
          </div>

          <button onClick={spin} disabled={spinning || balance < bet}
            className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl text-xl md:text-2xl font-black tracking-widest uppercase transition-all active:scale-95
              ${spinning || balance < bet ? 'bg-[#0c2719] text-slate-600 cursor-not-allowed' : 'bg-gradient-to-b from-green-400 to-green-700 text-white shadow-[0_6px_0_#166534,0_10px_15px_rgba(0,0,0,0.5)] md:shadow-[0_8px_0_#166534,0_12px_20px_rgba(0,0,0,0.5)] hover:brightness-110'}`}>
            {spinning ? '⟳' : 'SPIN'}
          </button>

          <div className="bg-[#0a1f12] border border-[#1a3d22] rounded-xl md:rounded-2xl p-3 md:p-4">
            <p className="text-[9px] md:text-[10px] text-yellow-700 uppercase tracking-widest mb-2">Auto Spin</p>
            <div className="flex gap-2 flex-wrap">
              {[0, 10, 25, 50].map(n => (
                <button key={n} onClick={() => n === 0 ? (setAutoLeft(0), autoLeftRef.current = 0) : startAuto(n)} disabled={spinning && n !== 0}
                  className={`flex-1 py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold transition-all
                    ${autoLeft === n && n > 0 ? 'bg-yellow-500 text-black' : 'bg-[#0a1f12] text-slate-400 hover:text-white border border-[#1a3d22]'}`}>
                  {n === 0 ? 'OFF' : `×${n}`}
                </button>
              ))}
            </div>
            {autoLeft > 0 && <p className="text-center text-yellow-500 text-[10px] md:text-xs mt-2 font-bold">{autoLeft} left</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = 'text-white', align = 'left' }) {
  return (
    <div className={`text-${align}`}>
      <p className="text-[8px] md:text-[9px] text-yellow-700 uppercase tracking-widest">{label}</p>
      <p className={`font-mono font-black text-sm md:text-lg ${accent}`}>{value}</p>
    </div>
  );
}