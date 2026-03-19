// src/pages/user/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Trophy, Gift, Zap, Star, Menu, X, Crown, Coins, ChevronRight, ShieldCheck, Sparkles, User, Loader2 } from 'lucide-react';

// Import komponen Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // --- STATE UNTUK EDIT PROFILE ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });

  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 100], ["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // --- FUNGSI UPDATE PROFILE ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMsg({ type: '', text: '' });

    try {
      // 1. Update metadata di Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: { username: newUsername }
      });
      if (authError) throw authError;

      // 2. Update kolom username di tabel profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', user.id);
      if (profileError) throw profileError;

      // 3. Sukses
      setUser(authData.user); // Update state lokal
      setUpdateMsg({ type: 'success', text: 'Identitas berhasil diperbarui!' });
      
      // Tutup modal otomatis setelah 1.5 detik
      setTimeout(() => {
        setIsProfileOpen(false);
        setUpdateMsg({ type: '', text: '' });
      }, 1500);

    } catch (error) {
      setUpdateMsg({ type: 'error', text: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const features = [
    { icon: <Trophy />, title: "Rare Drops", desc: "Dapatkan equipment SSR dengan drop rate transparan.", color: "from-yellow-500/20" },
    { icon: <Zap />, title: "Instant Summon", desc: "Animasi mulus dan respons server secepat kilat.", color: "from-blue-500/20" },
    { icon: <ShieldCheck />, title: "Fair RNG", desc: "Sistem probabilitas aman menggunakan Edge Functions.", color: "from-emerald-500/20" },
    { icon: <Star />, title: "Pity System", desc: "Garansi item langka setelah beberapa kali summon.", color: "from-purple-500/20" },
  ];

  return (
    <main className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-yellow-500/30">
      <Spotlight />
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* NAVBAR */}
      <motion.nav 
        style={{ backgroundColor: navBg }}
        className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-yellow-500 rounded-lg group-hover:rotate-12 transition-transform">
              <Crown className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">CrystalGacha</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <div className="flex items-center bg-white/5 p-1 pr-4 rounded-full border border-white/10">
                {/* --- UBAH JADI LINK MENGARAH KE /profile --- */}
                <Link 
                  to="/profile"
                  className="flex items-center gap-3 hover:bg-white/10 p-1 pr-3 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold shadow-lg">
                    {user.user_metadata?.username?.[0].toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-yellow-500">{user.user_metadata?.username}</span>
                </Link>

                <div className="w-[1px] h-4 bg-white/20 mx-2" />
                <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-400 font-bold transition-colors">LOGOUT</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold hover:text-yellow-500 transition-colors uppercase tracking-widest">Login</Link>
                <Link to="/register">
                  <Button className="bg-white text-black font-black hover:bg-yellow-500 transition-all rounded-full px-8">REGISTER</Button>
                </Link>
              </>
            )}
          </div>
          
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-yellow-500">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </motion.nav>

      {/* MODAL EDIT PROFILE */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay gelap */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Kotak Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <User className="text-yellow-500" /> Edit Identity
                </h2>
                <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Username Baru</Label>
                  <Input 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-black/50 border-white/10 text-white focus:border-yellow-500 h-12 rounded-xl"
                    placeholder="Masukkan nama kerenmu"
                    required
                  />
                </div>

                {/* Pesan Sukses/Error */}
                {updateMsg.text && (
                  <div className={`text-xs font-bold p-3 rounded-lg border ${updateMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {updateMsg.text}
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsProfileOpen(false)} className="flex-1 rounded-xl">Batal</Button>
                  <Button type="submit" disabled={isUpdating || !newUsername || newUsername === user.user_metadata?.username} className="flex-1 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                    {isUpdating ? <Loader2 className="animate-spin" /> : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-40 pb-20 px-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">Gacha Simulator 2026</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic leading-[0.9]">
            SUMMON <br /> 
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 bg-clip-text text-transparent">YOUR DESTINY</span>
          </h1>
          <p className="mt-8 text-slate-400 text-lg md:text-xl max-w-xl mx-auto font-medium leading-relaxed">
            Kumpulkan equipment legendaris dari portal dimensi. <br className="hidden md:block"/>
            RNG yang adil dengan visual yang memukau.
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
                <Gift className="w-5 h-5" /> OPEN GACHA PORTAL
             </ShimmerButton>
          ) : (
            <Link to="/register">
              <ShimmerButton>
                START SUMMONING <ChevronRight className="w-5 h-5" />
              </ShimmerButton>
            </Link>
          )}
        </motion.div>
      </section>

      {/* FEATURES - BENTO GRID STYLE */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className={`p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br ${f.color} to-transparent backdrop-blur-sm flex flex-col gap-4`}
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

      {/* FOOTER MINI */}
      <footer className="relative z-10 border-t border-white/5 py-10 text-center text-slate-600 text-[10px] uppercase font-bold tracking-[0.5em]">
        © 2026 CRYSTAL GACHA SIMULATOR. ALL RIGHTS RESERVED.
      </footer>
    </main>
  );
}

export default LandingPage;