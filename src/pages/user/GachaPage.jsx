// src/pages/user/GachaPage.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ArrowLeft, Coins, Zap, Flame, Volume2, VolumeX, Info, Loader2 } from 'lucide-react';

import { SYMBOLS, PAYLINES, SCATTER_PAY } from '../../engine/slotConfig';
import { pickWeighted } from '../../engine/slotEngine';

const REELS        = 5;
const VISIBLE_ROWS = 3;
const STRIP_PAD    = 28;
const BET_OPTIONS  = [100, 300, 800, 1000, 2000, 3000, 5000, 8000, 10000];
const REEL_GAP     = 6;
const REEL_PAD     = 8;

// ─── KOMPONEN VISUAL ───────────────────────────────────────────────────
const CoinBurst = ({ active }) => {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const dist  = 70 + Math.random() * 60;
        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-yellow-400"
            style={{ left: '50%', top: '50%', translateX: '-50%', translateY: '-50%' }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.7 + Math.random() * 0.4, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
};

const WinFlyUp = ({ amount, id }) => (
  <AnimatePresence>
    {amount > 0 && (
      <motion.div
        key={id}
        initial={{ y: 10, opacity: 0, scale: 0.7 }}
        animate={{ y: -50, opacity: 1, scale: 1 }}
        exit={{ y: -90, opacity: 0, scale: 1.2 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-x-0 top-1/2 flex justify-center pointer-events-none z-50"
      >
        <span
          className="font-black text-3xl md:text-5xl tracking-widest text-yellow-300"
          style={{ fontFamily: "'Bebas Neue', sans-serif", textShadow: '0 0 30px rgba(234,179,8,0.9), 0 0 60px rgba(234,179,8,0.4)' }}
        >
          +{amount.toLocaleString('id-ID')}
        </span>
      </motion.div>
    )}
  </AnimatePresence>
);

const SymbolCell = ({ item, isWin, height }) => (
  <div className="flex items-center justify-center p-[3px] flex-shrink-0" style={{ height }}>
    <div
      className={`w-full h-full rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-200 ${
        isWin
          ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 ring-2 ring-yellow-200 shadow-[0_0_20px_rgba(234,179,8,0.7)] scale-[0.93]'
          : 'bg-gradient-to-b from-white to-slate-200 border-b-4 border-black/10'
      }`}
    >
      {isWin && <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/30 to-transparent animate-pulse" />}
      {item?.image_url ? (
        <img src={item.image_url} alt={item?.name || ''} className="w-[62%] h-[62%] object-contain drop-shadow-md relative z-10" draggable={false} />
      ) : (
        <div className="w-8 h-8 bg-slate-300 rounded-full animate-pulse" />
      )}
    </div>
  </div>
);

const Stat = ({ label, value, accent, align = 'left', icon }) => (
  <div className={align === 'right' ? 'text-right' : 'text-left'}>
    <p className="text-[9px] text-yellow-700/80 uppercase font-black tracking-[0.2em] mb-0.5 leading-none">{label}</p>
    <div className={`flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      {icon}
      <p className={`font-mono font-black text-base md:text-xl leading-none ${accent}`}>{value}</p>
    </div>
  </div>
);

const BetPill = ({ value, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all active:scale-95 disabled:opacity-40 ${
      active ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.4)]' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20'
    }`}
  >
    {value >= 1000 ? `${value / 1000}K` : value}
  </button>
);

const PaytableModal = ({ onClose, dynamicPaytable }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
    <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full max-w-lg bg-[#0a1a0e] border border-[#1a4028] rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[80vh]">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text" style={{ fontFamily: "'Bebas Neue', sans-serif", backgroundImage: 'linear-gradient(to right,#fef08a,#eab308)' }}>Dynamic Paytable (Live DB)</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white text-lg">×</button>
      </div>
      <div className="space-y-2 mb-4">
        {Object.entries(dynamicPaytable).map(([name, pays]) => {
          if (pays[3] === 0 && pays[4] === 0 && pays[5] === 0) return null;
          return (
            <div key={name} className="flex items-center justify-between bg-white/3 border border-white/5 rounded-xl px-4 py-2.5">
              <span className="text-sm font-bold text-white/70">{name}</span>
              <div className="flex gap-3">
                {Object.entries(pays).map(([count, mult]) => (
                  <div key={count} className="text-center">
                    <div className="text-[9px] text-white/30">{count}×</div>
                    <div className="text-xs font-black text-yellow-400">×{mult}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-white/5 pt-4">
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-2">Scatter Bonus (Config Fallback)</p>
        <div className="flex gap-2">
          {Object.entries(SCATTER_PAY).map(([count, mult]) => (
            <div key={count} className="flex-1 bg-purple-500/10 border border-purple-500/20 rounded-xl py-2 text-center">
              <div className="text-[9px] text-purple-300/50">{count} Scatter</div>
              <div className="text-sm font-black text-purple-300">×{mult} Bet</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
export default function GachaPage() {
  const navigate = useNavigate();

  const [items,           setItems]           = useState([]);
  const [balance,         setBalance]         = useState(0);
  const [bet,             setBet]             = useState(BET_OPTIONS[0]);
  const [strips,          setStrips]          = useState(Array.from({ length: REELS }, () => []));
  const [spinning,        setSpinning]        = useState(false);
  const [lastWin,         setLastWin]         = useState(0);
  const [winId,           setWinId]           = useState(0);
  const [winTiles,        setWinTiles]        = useState(new Set());
  const [lineResults,     setLineResults]     = useState([]);
  const [anticipate,      setAnticipate]      = useState(false);
  const [autoLeft,        setAutoLeft]        = useState(0);
  const [burst,           setBurst]           = useState(false);
  const [itemHeight,      setItemHeight]      = useState(80);
  const [reelWidth,       setReelWidth]       = useState(0);
  const [showPaytable,    setShowPaytable]    = useState(false);
  const [muted,           setMuted]           = useState(false);
  const [stats,           setStats]           = useState({ spins: 0, wagered: 0, won: 0 });
  const [insufficient,    setInsufficient]    = useState(false);
  const [dynamicPaytable, setDynamicPaytable] = useState({});

  const balanceRef  = useRef(0);
  const betRef      = useRef(BET_OPTIONS[0]);
  const autoLeftRef = useRef(0);
  const spinningRef = useRef(false);
  const itemsRef    = useRef([]);
  const statsRef    = useRef({ spins: 0, wagered: 0, won: 0 });
  const reelContRef = useRef(null);

  const c0 = useAnimation();
  const c1 = useAnimation();
  const c2 = useAnimation();
  const c3 = useAnimation();
  const c4 = useAnimation();
  const controls = useMemo(() => [c0, c1, c2, c3, c4], [c0, c1, c2, c3, c4]);

  const userIdRef   = useRef(null);
  const paytableRef = useRef({});

  useEffect(() => { balanceRef.current  = balance;  }, [balance]);
  useEffect(() => { betRef.current      = bet;      }, [bet]);
  useEffect(() => { autoLeftRef.current = autoLeft; }, [autoLeft]);
  useEffect(() => { itemsRef.current    = items;    }, [items]);
  useEffect(() => { statsRef.current    = stats;    }, [stats]);

  const updateDimensions = useCallback(() => {
    const el = reelContRef.current;
    if (!el) return;
    const totalW = el.offsetWidth - REEL_PAD * 2;
    const cellW  = (totalW - (REELS - 1) * REEL_GAP) / REELS;
    setItemHeight(Math.max(64, Math.min(128, cellW * 1.05)));
    setReelWidth(totalW);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('crystals').eq('id', user.id).single();
        if (profile) { setBalance(profile.crystals); balanceRef.current = profile.crystals; }
      }

      const { data: raw } = await supabase.from('gacha_items').select('*');
      const loaded = (raw && raw.length > 0) ? raw : SYMBOLS;

      const generatedPaytable = {};
      loaded.forEach(item => {
        generatedPaytable[item.name] = { 3: item.payout_3 || 0, 4: item.payout_4 || 0, 5: item.payout_5 || 0 };
      });

      setDynamicPaytable(generatedPaytable);
      setItems(loaded);
      itemsRef.current = loaded;

      const initGrid = Array.from({ length: REELS }, () => Array.from({ length: VISIBLE_ROWS }, () => pickWeighted(loaded)));
      setStrips(initGrid);
    })();

    const ro = new ResizeObserver(updateDimensions);
    if (reelContRef.current) ro.observe(reelContRef.current);
    return () => ro.disconnect();
  }, [updateDimensions]);

  const getLinePoints = useCallback((pl) => {
    const cellW = (reelWidth - (REELS - 1) * REEL_GAP) / REELS;
    return pl.coords.map(([r, row]) => {
      const x = REEL_PAD + r * (cellW + REEL_GAP) + cellW / 2;
      const y = REEL_PAD / 2 + row * itemHeight + itemHeight / 2;
      return `${x},${y}`;
    }).join(' ');
  }, [reelWidth, itemHeight]);

  // ✅ SPIN: wind-up dan server request berjalan PARALEL
const spin = useCallback(async () => {
    if (spinningRef.current) return;

    const curBal = balanceRef.current || 0;
    const curBet = betRef.current;
    const curStats = statsRef.current;
    const curHeight = itemHeight;

    if (!itemsRef.current || itemsRef.current.length === 0) {
      console.warn("Item belum terload.");
      return; 
    }

    if (curBal < curBet) {
      setInsufficient(true);
      stopAuto();
      setTimeout(() => setInsufficient(false), 1500);
      return;
    }

    spinningRef.current = true;
    setSpinning(true);
    setLastWin(0);
    setWinTiles(new Set());
    setLineResults([]);
    setAnticipate(false);
    setBurst(false);

    // Optimistic UI Update 
    setBalance(curBal - curBet);

    try {
      // 🚀 1. TUNGGU JAWABAN SERVER (Biasanya cuma 100-300ms, biarin aja buttonnya tulisan SPINNING)
      const { data, error } = await supabase.functions.invoke('spin-game', {
        body: { bet: curBet }
      });

      if (error) {
        console.error("Server Error:", error);
        throw new Error(error.message);
      }

      const { finalGrid, totalWin, newBalance, lineResults: lrs, winTileSet: wtsArray } = data;
      const winTileSet = new Set(wtsArray);

      // 🔥 2. RAKIT STRIP SEAMLESS (GABUNGAN GRID LAMA + PADDING + GRID BARU) 🔥
      // Ini rahasia biar gak ada kedip sama sekali pas mulai muter
      setStrips(prevStrips => {
        return finalGrid.map((newCol, rIdx) => {
          // Ambil 3 gambar yang lagi nongkrong di layar saat ini
          const oldCol = prevStrips[rIdx].slice(0, VISIBLE_ROWS); 
          const padding = Array.from({ length: STRIP_PAD }, () => pickWeighted(itemsRef.current));
          // Susun: Lama -> Tengah -> Baru
          return [...oldCol, ...padding, ...newCol];
        });
      });

      const isBigWin = totalWin >= curBet * 10;

      // 🚀 3. MULAILAH MELUNCUR 🚀
      const anims = controls.map(async (ctrl, i) => {
        const dur   = isBigWin ? 2.5 + i * 0.45 : 1.2 + i * 0.18;
        const delay = i * 0.09;
        if (isBigWin && i === 3) setTimeout(() => setAnticipate(true), 1300);
        
        await ctrl.set({ y: 0 }); // Pastikan start di titik 0 (nampilin gambar lama)
        await ctrl.start({
          // Lewati gambar lama & padding, berhenti pas di gambar baru
          y: -((VISIBLE_ROWS + STRIP_PAD) * curHeight),
          transition: { duration: dur, delay, ease: [0.45, 0.05, 0.55, 0.95] },
        });
      });
      await Promise.all(anims);

      // 🔥 4. RESET DIAM-DIAM KE TITIK NOL 🔥
      // Buang gambar padding, sisa final grid doang. User gak bakal sadar karena gambarnya sama persis.
      setStrips(finalGrid);
      controls.forEach(c => c.set({ y: 0 }));

      // 5. UPDATE DATA ASLI DARI SERVER
      setBalance(newBalance);
      balanceRef.current = newBalance;

      const newStats = { spins: curStats.spins + 1, wagered: curStats.wagered + curBet, won: curStats.won + totalWin };
      setStats(newStats);
      statsRef.current = newStats;

      if (totalWin > 0) {
        setLastWin(totalWin);
        setWinId(id => id + 1);
        setWinTiles(winTileSet);
        setLineResults(lrs);
        if (totalWin >= curBet * 5) setBurst(true);
      }

    } catch (err) {
      alert("Terjadi kesalahan jaringan atau saldo tidak cukup!");
      console.error("Spin error details:", err);
      // Reset kalau error
      setBalance(curBal);
      balanceRef.current = curBal;
      stopAuto();
    } finally {
      spinningRef.current = false;
      setSpinning(false);
      setAnticipate(false);

      if (autoLeftRef.current > 0) {
        const next = autoLeftRef.current - 1;
        setAutoLeft(next);
        autoLeftRef.current = next;
        setTimeout(() => spin(), lastWin > 0 ? 2200 : 700);
      }
    }
  }, [controls, itemHeight, lastWin]); // eslint-disable-line

  const changeBet = (dir) => {
    if (spinning) return;
    const idx = BET_OPTIONS.indexOf(bet);
    if (dir === 'up'   && idx < BET_OPTIONS.length - 1) setBet(BET_OPTIONS[idx + 1]);
    if (dir === 'down' && idx > 0)                      setBet(BET_OPTIONS[idx - 1]);
  };

  const stopAuto = () => { setAutoLeft(0); autoLeftRef.current = 0; };

  const sessionRtp = stats.wagered > 0 ? Math.round((stats.won / stats.wagered) * 100) : null;
  const rtpColor   = sessionRtp === null ? 'text-white/40'
    : sessionRtp >= 90 ? 'text-emerald-400'
    : sessionRtp >= 70 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-[#060f0a] text-white overflow-x-hidden select-none pb-10" style={{ backgroundImage: 'radial-gradient(ellipse 90% 50% at 50% 0%, #0e2e18 0%, #06100a 65%)' }}>
      <div className="sticky top-0 z-50 bg-[#06100a]/85 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto px-3 md:px-5 h-14 flex items-center justify-between gap-4">
          <button onClick={() => navigate(-1)} disabled={spinning} className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/50 hover:text-white disabled:opacity-40 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-black text-xl md:text-3xl tracking-[0.12em] text-transparent bg-clip-text" style={{ fontFamily: "'Bebas Neue', sans-serif", backgroundImage: 'linear-gradient(180deg,#fef08a 0%,#eab308 50%,#92400e 100%)' }}>
            Mahjong Ways
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setMuted(m => !m)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/30 hover:text-white transition-all">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowPaytable(true)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-white/30 hover:text-white transition-all">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 md:px-5 pt-4 pb-6 flex flex-col gap-4">
        <div className={`flex justify-between items-center rounded-2xl px-5 py-3 border transition-all duration-300 ${insufficient ? 'bg-red-950/40 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'bg-[#0a1f12]/80 border-yellow-900/30 shadow-[0_0_20px_rgba(234,179,8,0.07)]'}`}>
          <Stat label="Saldo" value={balance.toLocaleString('id-ID')} accent={insufficient ? 'text-red-400' : 'text-yellow-400'} icon={<Coins size={14} className={insufficient ? 'text-red-500' : 'text-yellow-500'} />} />
          <div className="flex-1 flex justify-center">
            <AnimatePresence mode="wait">
              {lastWin > 0 ? (
                <motion.div key={winId} initial={{ y: 10, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -10, opacity: 0 }} className="text-center">
                  <p className="text-[9px] text-green-600 uppercase font-black tracking-widest">Menang!</p>
                  <p className="text-green-400 font-black text-xl md:text-2xl drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]">+{lastWin.toLocaleString('id-ID')}</p>
                </motion.div>
              ) : (
                <motion.div key="idle">
                  {insufficient && <p className="text-red-400 font-black text-sm animate-pulse">SALDO KURANG!</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Stat label="Taruhan" value={bet.toLocaleString('id-ID')} accent="text-white" align="right" icon={<Flame size={14} className="text-red-500" />} />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="w-full">
            <div className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${anticipate ? 'ring-[3px] ring-yellow-400 shadow-[0_0_60px_rgba(234,179,8,0.4),inset_0_0_40px_rgba(234,179,8,0.05)]' : 'ring-[2px] ring-[#1a4028]'}`} style={{ background: '#071510' }}>
              <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-[#071510] to-transparent z-20 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#071510] to-transparent z-20 pointer-events-none" />
              <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.035]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.2) 2px,rgba(255,255,255,0.2) 3px)' }} />

              <AnimatePresence>
                {lineResults.length > 0 && !spinning && reelWidth > 0 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                    {lineResults.map((lr, idx) => {
                      if (lr.lineId === 'SCATTER') return null;
                      const pl = PAYLINES.find(p => p.id === lr.lineId);
                      if (!pl) return null;
                      return (
                        <motion.polyline key={idx} points={getLinePoints(pl)} fill="none" stroke={pl.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 4" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.9 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                      );
                    })}
                  </svg>
                )}
              </AnimatePresence>

              <CoinBurst active={burst} />
              <WinFlyUp amount={lastWin} id={winId} />

              <AnimatePresence>
                {anticipate && (
                  <motion.div className="absolute inset-0 pointer-events-none z-40" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.2, 0, 0.15, 0] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ background: 'radial-gradient(circle at 50% 50%, rgba(234,179,8,0.35), transparent 70%)' }} />
                )}
              </AnimatePresence>

              <div ref={reelContRef} className="relative flex overflow-hidden" style={{ height: itemHeight * VISIBLE_ROWS + REEL_PAD * 2, padding: REEL_PAD, gap: REEL_GAP }}>
                {Array.from({ length: REELS }, (_, rIdx) => (
                  <div key={rIdx} className="flex-1 relative overflow-hidden rounded-xl" style={{ background: '#040e08' }}>
                    <motion.div animate={controls[rIdx]} className="flex flex-col">
                      {(strips[rIdx] ?? []).map((item, rowIdx) => (
                        <SymbolCell key={rowIdx} item={item} isWin={winTiles.has(`${rIdx}-${rowIdx}`)} height={itemHeight} />
                      ))}
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
              {PAYLINES.map(pl => (
                <div key={pl.id} className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 rounded-full opacity-60" style={{ background: pl.color }} />
                  <span className="text-[10px] text-white/25 font-semibold">{pl.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-64 flex flex-col gap-3 flex-shrink-0">
            <div className="bg-[#0a1f12] border border-[#1a3d22] rounded-2xl p-4">
              <p className="text-[10px] text-yellow-700 uppercase font-black tracking-[0.2em] mb-3">Nilai Taruhan</p>
              <div className="flex items-center justify-between gap-2 mb-3">
                <button onClick={() => changeBet('down')} disabled={spinning || BET_OPTIONS.indexOf(bet) === 0} className="w-11 h-11 rounded-xl bg-[#1a3d22] text-yellow-500 text-2xl font-black border border-yellow-900/30 active:scale-90 transition-transform disabled:opacity-30 disabled:cursor-not-allowed">−</button>
                <div className="text-center">
                  <div className="font-black font-mono text-2xl text-white">{bet.toLocaleString('id-ID')}</div>
                  <div className="text-[9px] text-white/20 mt-0.5">crystal / spin</div>
                </div>
                <button onClick={() => changeBet('up')} disabled={spinning || BET_OPTIONS.indexOf(bet) === BET_OPTIONS.length - 1} className="w-11 h-11 rounded-xl bg-[#1a3d22] text-yellow-500 text-2xl font-black border border-yellow-900/30 active:scale-90 transition-transform disabled:opacity-30 disabled:cursor-not-allowed">+</button>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {BET_OPTIONS.map(b => (
                  <BetPill key={b} value={b} active={bet === b} disabled={spinning} onClick={() => setBet(b)} />
                ))}
              </div>
            </div>

            <button onClick={spin} disabled={spinning} style={{ fontFamily: "'Bebas Neue', sans-serif" }} className={`relative h-16 rounded-2xl font-black text-2xl tracking-[0.15em] transition-all overflow-hidden active:translate-y-1 active:shadow-none ${spinning ? 'bg-slate-800 text-slate-500 shadow-[0_4px_0_#1e293b] cursor-not-allowed' : insufficient ? 'bg-red-900/50 border border-red-500/30 text-red-400 cursor-not-allowed' : 'bg-gradient-to-b from-green-400 to-green-700 text-black shadow-[0_6px_0_#14532d] hover:brightness-110'}`}>
              {!spinning && !insufficient && (
                <motion.div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)' }} animate={{ x: ['-120%', '200%'] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', repeatDelay: 1.5 }} />
              )}
              <span className="relative z-10">{spinning ? 'SPINNING…' : insufficient ? 'SALDO KURANG' : 'SPIN NOW'}</span>
            </button>

            <div className="bg-[#0a1f12] border border-[#1a3d22] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-yellow-700 uppercase font-black tracking-[0.2em]">Auto Spin</p>
                {autoLeft > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-[10px] font-black animate-pulse flex items-center gap-1"><Zap size={10} /> {autoLeft} sisa</span>
                    <button onClick={stopAuto} className="text-[10px] text-red-400 hover:text-red-300 font-bold">Stop</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 10, 25, 50, 100].map(n => (
                  <button key={n} onClick={() => { if (n === 0) { stopAuto(); return; } setAutoLeft(n); autoLeftRef.current = n; if (!spinningRef.current) spin(); }} className={`py-2 rounded-lg text-[10px] font-black tracking-wider transition-all active:scale-95 ${(n === 0 ? autoLeft === 0 : autoLeft === n) ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'bg-[#1a4028] border border-white/5 text-white/60 hover:text-white'}`}>
                    {n === 0 ? 'OFF' : n}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0a1f12] border border-[#1a3d22] rounded-2xl p-4">
              <p className="text-[10px] text-yellow-700 uppercase font-black tracking-[0.2em] mb-3">Sesi Ini</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Spins',   value: stats.spins,                          color: 'text-white' },
                  { label: 'Taruhan', value: stats.wagered.toLocaleString('id-ID'), color: 'text-amber-400' },
                  { label: 'Menang',  value: stats.won.toLocaleString('id-ID'),     color: stats.won >= stats.wagered ? 'text-emerald-400' : 'text-rose-400' },
                ].map(s => (
                  <div key={s.label}>
                    <div className={`font-black font-mono text-sm leading-none ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] text-white/25 mt-1 uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
              {sessionRtp !== null && (
                <div className="mt-3">
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className={`h-full rounded-full ${sessionRtp >= 90 ? 'bg-emerald-500' : sessionRtp >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} animate={{ width: `${Math.min(sessionRtp, 100)}%` }} transition={{ duration: 0.5 }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-white/20">RTP Sesi</span>
                    <span className={`text-[9px] font-black ${rtpColor}`}>{sessionRtp}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPaytable && <PaytableModal onClose={() => setShowPaytable(false)} dynamicPaytable={dynamicPaytable} />}
      </AnimatePresence>
    </div>
  );
}