// src/pages/user/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { motion } from 'framer-motion';
import { Trophy, Zap, ShieldCheck, Star, Sparkles, ChevronRight, Gem, Flame, MessageCircle } from 'lucide-react';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

// --- KOMPONEN SPOTLIGHT ---
const Spotlight = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => setPosition({ x: e.clientX, y: e.clientY });

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-40 hidden md:block"
      style={{
        background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(251, 191, 36, 0.07), transparent 80%)`,
      }}
    />
  );
};

// --- KOMPONEN SHIMMER BUTTON ---
const ShimmerButton = ({ children, className, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(251, 191, 36, 0.5)" }}
      whileTap={{ scale: 0.95 }}
      className={`relative group overflow-hidden rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 px-6 py-3 md:px-8 md:py-4 text-black font-black uppercase tracking-tighter shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all text-sm md:text-base ${className}`}
      {...props}
    >
      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-20deg)]">
        <motion.div 
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative h-full w-10 bg-white/40 blur-md" 
        />
      </div>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

// --- KOMPONEN JACKPOT PROGRESIF ---
const JackpotCounter = () => {
  const [jackpot, setJackpot] = useState(8754320150);

  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot(prev => prev + Math.floor(Math.random() * 50000) + 10000);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 bg-black/40 border border-yellow-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden text-center shadow-[0_0_40px_rgba(234,179,8,0.15)]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
      <h2 className="text-yellow-500 text-sm md:text-lg font-bold tracking-widest uppercase mb-2">💎 Progressive Global Jackpot 💎</h2>
      <div className="text-4xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 drop-shadow-2xl font-mono">
        IDR {jackpot.toLocaleString('id-ID')}
      </div>
    </div>
  );
};

function LandingPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const features = [
    { icon: <Trophy />, title: "RTP Live 98.9%", desc: "Update win rate tertinggi real-time. Anti rungkad club.", color: "from-yellow-500/20" },
    { icon: <Zap />, title: "Server VVIP Kamboja", desc: "Engine server luar negeri jaminan ringan & responsif.", color: "from-blue-500/20" },
    { icon: <ShieldCheck />, title: "WD Garansi Lunas", desc: "Maxwin berapapun pasti dibayar lunas detik ini juga.", color: "from-emerald-500/20" },
    { icon: <Star />, title: "Pola & Jam Hoki", desc: "Bocoran pola putaran admin jarwo khusus member.", color: "from-purple-500/20" },
  ];

  const hotGames = [
    { name: "Gates of Olympus", provider: "Pragmatic Play", rtp: "98.5%", img: "https://images.unsplash.com/photo-1631580231572-c2c62c9540a9?auto=format&fit=crop&q=80&w=200&h=200" },
    { name: "Mahjong Ways 2", provider: "PG Soft", rtp: "97.8%", img: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=200&h=200" },
    { name: "Starlight Princess", provider: "Pragmatic Play", rtp: "96.9%", img: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=200&h=200" },
    { name: "Koi Gate", provider: "Habanero", rtp: "95.5%", img: "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?auto=format&fit=crop&q=80&w=200&h=200" },
  ];

  return (
// Ubah bagian ini (hapus pb-20)
<main className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-yellow-500/30 flex flex-col w-full">      <Spotlight />
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] md:w-[40%] md:h-[40%] bg-yellow-600/10 blur-[100px] md:blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] md:w-[40%] md:h-[40%] bg-red-600/10 blur-[100px] md:blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <Header />

      {/* RUNNING TEXT (MARQUEE) */}
      <div className="relative z-20 w-full bg-yellow-500/10 border-y border-yellow-500/20 py-2 overflow-hidden flex items-center mt-[70px]">
        <motion.div 
          animate={{ x: ["100%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="whitespace-nowrap flex gap-10 text-xs md:text-sm font-semibold text-yellow-500 tracking-wider"
        >
          <span>🎉 SELAMAT! User Budi*** WD Rp 15.000.000 di Gates of Olympus</span>
          <span>⚡ User Jono*** WD Rp 8.500.000 di Mahjong Ways 2</span>
          <span>🔥 User Siska*** WD Rp 22.000.000 di Sweet Bonanza</span>
          <span>💎 INFO: Event Turnover Bulanan berhadiah Motor NMAX Segera Dimulai!</span>
        </motion.div>
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 md:pt-24 pb-16 md:pb-20 px-4 md:px-6 flex flex-col items-center flex-grow w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6 md:mb-8 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
        >
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 animate-pulse" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-yellow-500 text-center">
            SITUS GACOR TERPERCAYA 2024
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center w-full max-w-[100vw]"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter italic leading-[1] px-2 break-words drop-shadow-2xl">
            NANTA<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">GACOR88</span>
          </h1>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight mt-2 text-white/90 uppercase">
            Situs Slot <span className="bg-red-600 text-white px-2 py-1 rounded-md rotate-2 inline-block shadow-lg">Auto Maxwin</span>
          </h2>
          <p className="mt-6 md:mt-8 text-slate-400 text-sm md:text-xl max-w-xs sm:max-w-md md:max-w-2xl mx-auto font-medium leading-relaxed px-2">
            Nikmati sensasi perkalian x500 tiap hari. Daftar sekarang, klaim bonus New Member 100%, dan buktikan sendiri pola gacormu malam ini!
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto px-4"
        >
          {user ? (
             <ShimmerButton onClick={() => navigate('/gacha')} className="w-full sm:w-auto justify-center">
                <Gem className="w-4 h-4 md:w-5 md:h-5" /> MAIN SEKARANG
             </ShimmerButton>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Link to="/register" className="w-full sm:w-auto">
                <ShimmerButton className="w-full justify-center">
                  DAFTAR AKUN VVIP <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </ShimmerButton>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-wider transition-all">
                  LOGIN
                </button>
              </Link>
            </div>
          )}
        </motion.div>

        <JackpotCounter />
      </section>

      {/* GAME SEDANG GACOR (HOT GAMES) */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12 w-full">
        <div className="flex items-center gap-3 mb-8">
          <Flame className="w-8 h-8 text-red-500 animate-pulse" />
          <h2 className="text-2xl md:text-3xl font-black italic uppercase">Game Sedang <span className="text-red-500">Gacor</span></h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {hotGames.map((game, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative rounded-2xl overflow-hidden bg-black/50 border border-white/10 cursor-pointer"
            >
              <div className="aspect-square overflow-hidden relative">
                <img src={game.img} alt={game.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-2 right-2 bg-green-500 text-black text-[10px] md:text-xs font-black px-2 py-1 rounded-full shadow-lg">
                  RTP {game.rtp}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent absolute bottom-0 w-full">
                <p className="text-yellow-500 text-[10px] md:text-xs font-bold uppercase mb-1">{game.provider}</p>
                <h3 className="font-bold text-sm md:text-base leading-tight truncate">{game.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES - BENTO GRID STYLE */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 bg-gradient-to-br ${f.color} to-transparent backdrop-blur-sm flex flex-col gap-3 md:gap-4 shadow-xl`}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-yellow-500 shadow-inner">
                {React.cloneElement(f.icon, { className: "w-5 h-5 md:w-6 md:h-6" })}
              </div>
              <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">{f.title}</h3>
              <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SUPPORTED PAYMENT LOGOS (MOCK) */}


      {/* FLOATING LIVE CHAT BUTTON */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      <Footer />
    </main>
  );
}

export default LandingPage;