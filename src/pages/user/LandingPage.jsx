// src/pages/user/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { motion } from 'framer-motion';
import { Trophy, Zap, ShieldCheck, Star, Sparkles, ChevronRight, Gem } from 'lucide-react';

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
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-40"
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
      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(251, 191, 36, 0.4)" }}
      whileTap={{ scale: 0.95 }}
      className={`relative group overflow-hidden rounded-full bg-gradient-to-br from-yellow-400 via-yellow-600 to-yellow-700 px-8 py-4 text-black font-black uppercase tracking-tighter shadow-xl transition-all ${className}`}
      {...props}
    >
      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-20deg)]">
        <motion.div 
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative h-full w-10 bg-white/30 blur-md" 
        />
      </div>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
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

  // Copywriting diganti ala situs Gacor lokal
  const features = [
    { icon: <Trophy />, title: "RTP Live 98%", desc: "Update win rate tertinggi secara real-time. Bocoran game paling gacor hari ini.", color: "from-yellow-500/20" },
    { icon: <Zap />, title: "Server VVIP", desc: "Main mulus tanpa ngelag. Engine server luar negeri jaminan anti rungkad.", color: "from-blue-500/20" },
    { icon: <ShieldCheck />, title: "WD Garansi 100%", desc: "Menang berapapun pasti dibayar lunas. Proses depo & withdraw secepat kilat.", color: "from-emerald-500/20" },
    { icon: <Star />, title: "Pola & Jam Hoki", desc: "Disediakan pola putaran dan jam gacor khusus member setia NantaGacor88.", color: "from-purple-500/20" },
  ];

  return (
    <main className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-yellow-500/30 flex flex-col">
      <Spotlight />
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <Header />

      {/* HERO SECTION */}
      <section className="relative z-10 pt-40 pb-20 px-6 flex flex-col items-center flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-8 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
        >
          <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">SITUS SLOT TERPERCAYA NO.1 DI INDONESIA</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic leading-[0.9]">
            NANTAGACOR<span className="text-yellow-500">88</span> <br /> 
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 bg-clip-text text-transparent">AUTO MAXWIN</span>
          </h1>
          <p className="mt-8 text-slate-400 text-lg md:text-xl max-w-xl mx-auto font-medium leading-relaxed">
            Nikmati sensasi jackpot progresif tanpa batas. <br className="hidden md:block"/>
            Daftar sekarang dan buktikan sendiri pola gacormu malam ini!
          </p>
        </motion.div>

       <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 flex flex-col md:flex-row gap-6"
        >
          {user ? (
             <ShimmerButton onClick={() => navigate('/gacha')}>
                <Gem className="w-5 h-5" /> MAIN SEKARANG
             </ShimmerButton>
          ) : (
            <Link to="/register">
              <ShimmerButton>
                DAFTAR & KLAIM BONUS <ChevronRight className="w-5 h-5" />
              </ShimmerButton>
            </Link>
          )}
        </motion.div>
      </section>

      {/* FEATURES - BENTO GRID STYLE */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className={`p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br ${f.color} to-transparent backdrop-blur-sm flex flex-col gap-4 shadow-xl`}
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-yellow-500 shadow-inner">
                {f.icon}
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter">{f.title}</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default LandingPage;