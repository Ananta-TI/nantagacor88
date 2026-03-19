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
      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(251, 191, 36, 0.4)" }}
      whileTap={{ scale: 0.95 }}
      className={`relative group overflow-hidden rounded-full bg-gradient-to-br from-yellow-400 via-yellow-600 to-yellow-700 px-6 py-3 md:px-8 md:py-4 text-black font-black uppercase tracking-tighter shadow-xl transition-all text-sm md:text-base ${className}`}
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

  const features = [
    { icon: <Trophy />, title: "RTP Live 98%", desc: "Update win rate tertinggi secara real-time. Bocoran game paling gacor hari ini.", color: "from-yellow-500/20" },
    { icon: <Zap />, title: "Server VVIP", desc: "Main mulus tanpa ngelag. Engine server luar negeri jaminan anti rungkad.", color: "from-blue-500/20" },
    { icon: <ShieldCheck />, title: "WD Garansi 100%", desc: "Menang berapapun pasti dibayar lunas. Proses depo & withdraw secepat kilat.", color: "from-emerald-500/20" },
    { icon: <Star />, title: "Pola & Jam Hoki", desc: "Disediakan pola putaran dan jam gacor khusus member setia NantaGacor88.", color: "from-purple-500/20" },
  ];

  return (
    <main className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-yellow-500/30 flex flex-col w-full">
      <Spotlight />
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] md:w-[40%] md:h-[40%] bg-yellow-600/10 blur-[100px] md:blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] md:w-[40%] md:h-[40%] bg-green-600/10 blur-[100px] md:blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <Header />

      {/* HERO SECTION */}
      <section className="relative z-10 pt-32 md:pt-40 pb-16 md:pb-20 px-4 md:px-6 flex flex-col items-center flex-grow w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6 md:mb-8 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
        >
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 animate-pulse" />
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-yellow-500 text-center">
            SITUS SLOT TERPERCAYA NO.1
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center w-full max-w-[100vw]"
        >
          {/* 🔥 PERBAIKAN UKURAN FONT DI SINI 🔥 */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter italic leading-[1.1] md:leading-[0.9] px-2 break-words">
            NANTAGACOR<span className="text-yellow-500">88</span> <br /> 
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 bg-clip-text text-transparent">AUTO MAXWIN</span>
          </h1>
          <p className="mt-6 md:mt-8 text-slate-400 text-sm md:text-xl max-w-xs sm:max-w-md md:max-w-xl mx-auto font-medium leading-relaxed px-2">
            Nikmati sensasi jackpot progresif tanpa batas. <br className="hidden md:block"/>
            Daftar sekarang dan buktikan sendiri pola gacormu malam ini!
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
            <Link to="/register" className="w-full sm:w-auto">
              <ShimmerButton className="w-full justify-center">
                DAFTAR & KLAIM BONUS <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </ShimmerButton>
            </Link>
          )}
        </motion.div>
      </section>

      {/* FEATURES - BENTO GRID STYLE */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 w-full">
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

      <Footer />
    </main>
  );
}

export default LandingPage;