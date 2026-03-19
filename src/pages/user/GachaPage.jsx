// src/pages/user/GachaPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ArrowLeft, Coins, RefreshCcw, Zap, ChevronUp, ChevronDown, Play, Flame, AlertCircle } from 'lucide-react';

// ─── CONSTANTS ───────────────────────────────────────────────
const REELS = 5;
const VISIBLE_ROWS = 3;
const STRIP_PAD = 30; // Sedikit dikurangi untuk performa mobile
const BET_OPTIONS = [100, 300, 800, 1000, 2000, 3000, 5000, 8000];
const TARGET_RTP = 0.92;

const PAYLINES = [
  { id: 0, label: 'Top', color: '#f59e0b', coords: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
  { id: 1, label: 'Middle', color: '#22c55e', coords: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1]] },
  { id: 2, label: 'Bottom', color: '#3b82f6', coords: [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]] },
  { id: 3, label: 'V', color: '#a855f7', coords: [[0, 0], [1, 1], [2, 2], [3, 1], [4, 0]] },
  { id: 4, label: 'Inv-V', color: '#ef4444', coords: [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]] },
];

const PAYTABLE = {
  '5-Wild': 2000, '5-Scatter': 500, '5-Excalibur': 250, '5-Golden Tile': 150,
  '5-Red Dragon': 100, '5-Green Dragon': 80, '5-Circle 1': 50, '5-Bamboo 1': 30,
  '4-Wild': 100, '4-Scatter': 50, '3-Wild': 10, '2-Wild': 0.5,
};

const BASE_TABLE = [
  { outcome: 'MICRO_WIN', p: 0.50 },
  { outcome: 'NEAR_MISS', p: 0.18 },
  { outcome: 'SMALL_WIN', p: 0.12 },
  { outcome: 'BIG_WIN', p: 0.02 },
  { outcome: 'LOSE', p: 1.00 },
];

// ─── HELPERS ────────────────────────────────────────────
function pickWeighted(items, filterFn) {
  const pool = filterFn ? items.filter(filterFn) : items;
  if (!pool || !pool.length) return items[0];
  const total = pool.reduce((s, i) => s + (i.weight || 1), 0);
  let r = Math.random() * total;
  for (const item of pool) { r -= (item.weight || 1); if (r <= 0) return item; }
  return pool[pool.length - 1];
}

function buildAdjustedTable(rtpBias) {
  const bias = Math.max(-0.15, Math.min(0.15, rtpBias));
  return BASE_TABLE.map((row) => {
    let p = row.p;
    if (row.outcome === 'MICRO_WIN') p = Math.max(0.10, Math.min(0.72, p + bias * 1.2));
    if (row.outcome === 'SMALL_WIN') p = Math.max(0.03, Math.min(0.25, p + bias * 0.5));
    return { ...row, p };
  });
}

function rollOutcome(table) {
  let cumulative = 0;
  const r = Math.random();
  for (const row of table) {
    cumulative += row.p;
    if (r < Math.min(cumulative, 1)) return row.outcome;
  }
  return 'LOSE';
}

function buildFinalGrid(items, outcome, targetLine) {
  const grid = Array.from({ length: REELS }, () => Array.from({ length: VISIBLE_ROWS }, () => pickWeighted(items)));
  const coords = targetLine.coords;
  switch (outcome) {
    case 'BIG_WIN':
      const symB = pickWeighted(items, i => (PAYTABLE[`5-${i.name}`] ?? 0) > 0);
      coords.forEach(([r, row]) => { grid[r][row] = symB; });
      break;
    case 'SMALL_WIN':
      const symS = pickWeighted(items, i => (PAYTABLE[`3-${i.name}`] ?? 0) >= 1);
      for (let i = 0; i < 3; i++) grid[coords[i][0]][coords[i][1]] = symS;
      break;
    case 'MICRO_WIN':
      const symM = pickWeighted(items, i => (PAYTABLE[`2-${i.name}`] ?? 0) > 0);
      grid[coords[0][0]][coords[0][1]] = symM;
      grid[coords[1][0]][coords[1][1]] = symM;
      break;
    case 'NEAR_MISS':
      const bait = pickWeighted(items, i => (PAYTABLE[`4-${i.name}`] ?? 0) > 0);
      for (let i = 0; i < 3; i++) grid[coords[i][0]][coords[i][1]] = bait;
      grid[coords[3][0]][coords[3][1]] = pickWeighted(items, i => i.name !== bait.name);
      break;
  }
  return grid;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function GachaPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [balance, setBalance] = useState(0);
  const [bet, setBet] = useState(BET_OPTIONS[0]);
  const [strips, setStrips] = useState(Array(REELS).fill([]));
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [winTiles, setWinTiles] = useState(new Set());
  const [lineResults, setLineResults] = useState([]);
  const [anticipate, setAnticipate] = useState(false);
  const [autoLeft, setAutoLeft] = useState(0);
  const [stats, setStats] = useState({ spins: 0, wagered: 0, won: 0 });

  // Responsive Item Height Logic
  const [itemHeight, setItemHeight] = useState(100);
  const reelContainerRef = useRef(null);

  const balanceRef = useRef(0);
  const betRef = useRef(BET_OPTIONS[0]);
  const autoLeftRef = useRef(0);
  const spinningRef = useRef(false);
  const itemsRef = useRef([]);
  const statsRef = useRef({ spins: 0, wagered: 0, won: 0 });
  const controls = [useAnimation(), useAnimation(), useAnimation(), useAnimation(), useAnimation()];

  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { betRef.current = bet; }, [bet]);
  useEffect(() => { autoLeftRef.current = autoLeft; }, [autoLeft]);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  const updateDimensions = useCallback(() => {
    if (reelContainerRef.current) {
        const width = reelContainerRef.current.offsetWidth;
        // Hitung tinggi item berdasarkan lebar kontainer agar tetap proporsional (5 reels + gaps)
        const calculatedHeight = (width / REELS) * 1.1; 
        setItemHeight(calculatedHeight);
    }
  }, []);

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

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  const spin = useCallback(async () => {
    if (spinningRef.current) return;
    const curItems = itemsRef.current;
    const curBal = balanceRef.current;
    const curBet = betRef.current;
    const curStats = statsRef.current;

    if (!curItems.length || curBal < curBet) {
        if (curBal < curBet) alert("Saldo tidak cukup!");
        return;
    }

    spinningRef.current = true;
    setSpinning(true);
    setLastWin(0);
    setWinTiles(new Set());
    setLineResults([]);
    setAnticipate(false);

    const balAfterBet = curBal - curBet;
    setBalance(balAfterBet);
    balanceRef.current = balAfterBet;

    // RTP Logic
    const sessionRtp = curStats.wagered > 0 ? curStats.won / curStats.wagered : TARGET_RTP;
    const rtpBias = (TARGET_RTP - sessionRtp) * 0.6;
    
    const outcome = rollOutcome(buildAdjustedTable(rtpBias));
    const targetLine = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
    const finalGrid = buildFinalGrid(curItems, outcome, targetLine);
    
    const fullStrips = finalGrid.map(col => [
        ...Array.from({ length: STRIP_PAD }, () => pickWeighted(curItems)), 
        ...col
    ]);
    setStrips(fullStrips);

    const drama = ['BIG_WIN', 'NEAR_MISS'].includes(outcome);
    const animations = controls.map(async (ctrl, i) => {
      const baseDuration = drama ? 2 + (i * 0.4) : 1.2 + (i * 0.2);
      const delay = i * 0.1;
      
      if (drama && i === 3) setTimeout(() => setAnticipate(true), 1200);
      
      await ctrl.set({ y: 0 });
      await ctrl.start({
        y: -(STRIP_PAD * itemHeight),
        transition: { duration: baseDuration, delay: delay, ease: [0.45, 0.05, 0.55, 0.95] }
      });
    });

    await Promise.all(animations);

    setStrips(finalGrid);
    controls.forEach(ctrl => ctrl.set({ y: 0 }));

    // Win Calculation
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
          const amt = Math.round(multiplier * curBet);
          totalAmount += amt;
          pl.coords.slice(0, matchCount).forEach(([r, row]) => winTileSet.add(`${r}-${row}`));
          lrs.push({ amount: amt, lineId: pl.id });
        }
      }
    }

    const finalBalance = balAfterBet + totalAmount;
    if (userId) {
      await supabase.from('profiles').update({ crystals: finalBalance }).eq('id', userId);
    }

    setBalance(finalBalance);
    balanceRef.current = finalBalance;
    setStats(prev => ({ spins: prev.spins + 1, wagered: prev.wagered + curBet, won: prev.won + totalAmount }));

    if (totalAmount > 0) {
      setLastWin(totalAmount);
      setWinTiles(winTileSet);
      setLineResults(lrs);
    }

    spinningRef.current = false;
    setSpinning(false);
    setAnticipate(false);

    if (autoLeftRef.current > 0) {
      const next = autoLeftRef.current - 1;
      setAutoLeft(next); 
      autoLeftRef.current = next;
      setTimeout(() => spin(), totalAmount > 0 ? 2000 : 800);
    }
  }, [itemHeight, controls, userId, items]);

  const changeBet = (dir) => {
    if (spinning) return;
    const idx = BET_OPTIONS.indexOf(bet);
    if (dir === 'up' && idx < BET_OPTIONS.length - 1) setBet(BET_OPTIONS[idx + 1]);
    if (dir === 'down' && idx > 0) setBet(BET_OPTIONS[idx - 1]);
  };

  return (
    <div className="min-h-screen bg-[#060f0a] text-white overflow-x-hidden select-none pb-10"
         style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%,#0d2e1a 0%,#060f0a 70%)' }}>

      {/* Header */}
      <div className="relative text-center pt-6 pb-2 max-w-6xl mx-auto px-4">
        <button onClick={() => navigate(-1)} disabled={spinning} className="absolute left-4 top-6 p-2 text-yellow-600 bg-[#0a1f12] border border-[#1a3d22] rounded-xl z-50 disabled:opacity-50">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl md:text-5xl font-black uppercase italic tracking-tighter" 
            style={{ background: 'linear-gradient(180deg,#fef08a 0%,#eab308 45%,#92400e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Mahjong Ways
        </h1>
      </div>

      {/* Info Bar */}
      <div className="max-w-xl mx-auto px-4 mb-4">
        <div className="flex justify-between items-center bg-[#0a1f12]/80 border border-yellow-900/40 rounded-2xl px-4 py-2 shadow-lg">
          <Stat label="Balance" value={balance.toLocaleString()} accent="text-yellow-300" />
          <div className="flex-1 flex justify-center">
            <AnimatePresence>
                {lastWin > 0 && (
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="text-green-400 font-black text-lg md:text-xl drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                        +{lastWin.toLocaleString()}
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
          <Stat label="Bet" value={bet.toLocaleString()} accent="text-white" align="right" />
        </div>
      </div>

      {/* Main Game Area */}
      <div className="max-w-6xl mx-auto px-2 flex flex-col lg:flex-row gap-4 items-center justify-center">
        
        {/* Reels Container */}
        <div className="w-full max-w-[500px] lg:max-w-[600px]">
            <div className={`relative rounded-2xl border-[3px] md:border-[6px] transition-all duration-500 overflow-hidden ${anticipate ? 'border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.6)]' : 'border-[#1a4028]'}`}
                style={{ background: '#071510' }}>
                
                <div ref={reelContainerRef} className="relative flex p-1 md:p-2 gap-1 md:gap-2 overflow-hidden" 
                     style={{ height: itemHeight * VISIBLE_ROWS + 16 }}>
                    
                    {/* Payline Overlay */}
                    {lineResults.length > 0 && !spinning && (
                        <svg className="absolute inset-0 pointer-events-none z-30 w-full h-full">
                            {lineResults.map((lr, idx) => {
                                const pl = PAYLINES.find(p => p.id === lr.lineId);
                                const points = pl.coords.map(([r, row]) => {
                                    const x = (r * (reelContainerRef.current.offsetWidth / REELS)) + (reelContainerRef.current.offsetWidth / REELS / 2);
                                    const y = (row * itemHeight) + (itemHeight / 2) + 8;
                                    return `${x},${y}`;
                                }).join(' ');
                                return (
                                    <motion.polyline key={idx} points={points} fill="none" stroke={pl.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
                                );
                            })}
                        </svg>
                    )}

                    {/* Individual Reels */}
                    {Array.from({ length: REELS }, (_, rIdx) => (
                    <div key={rIdx} className="flex-1 relative overflow-hidden rounded-lg bg-[#040e08]">
                        <motion.div animate={controls[rIdx]} className="flex flex-col">
                        {(strips[rIdx] ?? []).map((item, rowIdx) => (
                            <div key={rowIdx} className="flex flex-col items-center justify-center p-1" style={{ height: itemHeight }}>
                                <div className={`w-full h-full rounded-md md:rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${winTiles.has(`${rIdx}-${rowIdx}`) ? 'bg-yellow-400 shadow-[0_0_15px_#eab308] scale-95' : 'bg-white/90'}`}>
                                    {item?.image_url ? (
                                        <img src={item.image_url} alt="" className="w-3/4 h-3/4 object-contain" />
                                    ) : (
                                        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
                                    )}
                                    <span className="hidden md:block text-[10px] text-black font-black mt-1">{item?.name}</span>
                                </div>
                            </div>
                        ))}
                        </motion.div>
                    </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-[500px] lg:w-72 flex flex-col gap-3 md:gap-4">
          
          {/* Bet Selector */}
          <div className="bg-[#0a1f12] p-3 md:p-4 rounded-2xl border border-[#1a3d22] flex lg:flex-col items-center justify-between gap-2">
            <p className="text-[10px] text-yellow-700 uppercase font-bold">Bet Amount</p>
            <div className="flex items-center gap-4">
              <button onClick={() => changeBet('down')} className="w-10 h-10 rounded-xl bg-[#0f2e1a] text-yellow-500 text-xl font-black border border-yellow-900/20 active:scale-90">−</button>
              <span className="text-xl md:text-2xl font-black min-w-[60px] text-center">{bet}</span>
              <button onClick={() => changeBet('up')} className="w-10 h-10 rounded-xl bg-[#0f2e1a] text-yellow-500 text-xl font-black border border-yellow-900/20 active:scale-90">+</button>
            </div>
          </div>

          {/* Spin Button */}
          <button onClick={spin} disabled={spinning || balance < bet}
                  className={`relative py-4 md:py-6 rounded-2xl text-2xl md:text-3xl font-black tracking-widest transition-all active:translate-y-1
                  ${spinning ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-b from-green-400 to-green-700 shadow-[0_6px_0_#166534] hover:brightness-110'}`}>
            {spinning ? 'SPINNING' : 'SPIN'}
          </button>

          {/* Auto Spin */}
          <div className="bg-[#0a1f12] p-3 md:p-4 rounded-2xl border border-[#1a3d22]">
            <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] text-yellow-700 uppercase font-bold">Auto Spin</p>
                {autoLeft > 0 && <span className="text-yellow-400 text-[10px] font-black animate-pulse">{autoLeft} REMAINING</span>}
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[0, 10, 25, 50, 100].map(n => (
                <button key={n} onClick={() => { setAutoLeft(n); autoLeftRef.current = n; if (n > 0 && !spinningRef.current) spin(); }}
                        className={`py-2 rounded-lg text-[10px] md:text-xs font-bold transition-colors ${autoLeft === n ? 'bg-yellow-500 text-black' : 'bg-[#1a4028] text-white'}`}>
                  {n === 0 ? 'OFF' : n}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, align = 'left' }) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <p className="text-[8px] md:text-[10px] text-yellow-700 uppercase font-bold leading-none mb-1">{label}</p>
      <p className={`font-mono font-black text-sm md:text-lg leading-none ${accent}`}>{value}</p>
    </div>
  );
}