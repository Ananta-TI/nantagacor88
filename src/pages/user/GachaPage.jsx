// src/pages/user/GachaPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Gem, PackageSearch } from 'lucide-react';

// Import komponen Shadcn
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Komponen Internal Ringkas untuk Spotlight (sama seperti di Login)
const Spotlight = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  return (
    <div 
      className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 opacity-30"
      onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}
      style={{
        background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(170, 59, 255, 0.15), transparent 80%)`,
      }}
    />
  );
};

// Variabel Warna berdasarkan Rarity
const rarityColors = {
  SSR: "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]",
  Rare: "text-purple-400",
  Common: "text-slate-400"
};

const PULL_COST = 100; // Biaya 1x pull

function GachaPage() {
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [gachaResult, setGachaResult] = useState(null);
  const [error, setError] = useState(null);

  // 1. Ambil data profil user (untuk saldo crystals)
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('crystals')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // 2. Fungsi untuk memanggil Supabase Edge Function (Pull Gacha)
const handlePullGacha = async () => {
    setLoading(true);
    setError(null);
    setGachaResult(null);

    if (userProfile.crystals < PULL_COST) {
      setError("Crystals tidak cukup! Butuh 100 Crystals.");
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Ambil daftar item dan bobotnya dari database
      const { data: items, error: itemsError } = await supabase
        .from('gacha_items')
        .select('*');

      if (itemsError || !items) throw new Error('Gagal mengambil data gacha pool.');

      // 2. Logika RNG (Weighted Random) di React
      const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
      let randomNum = Math.random() * totalWeight;
      let wonItem = null;

      for (let i = 0; i < items.length; i++) {
        randomNum -= items[i].weight;
        if (randomNum <= 0) {
          wonItem = items[i];
          break;
        }
      }

      // 3. Potong Crystal User
      const newCrystals = userProfile.crystals - PULL_COST;
      await supabase
        .from('profiles')
        .update({ crystals: newCrystals })
        .eq('id', user.id);

      // 4. Masukkan Item ke Inventory
      // (Untuk simulasi, kita insert baru saja tiap gacha)
      await supabase
        .from('user_inventory')
        .insert({ 
          user_id: user.id, 
          item_id: wonItem.id, 
          quantity: 1 
        });

      // 5. Update UI Frontend
      setUserProfile(prev => ({ ...prev, crystals: newCrystals }));
      setGachaResult(wonItem);

    } catch (err) {
      setError(err.message || "Terjadi kesalahan sistem.");
      console.error('Gacha error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-[#020617] p-4 overflow-hidden text-white">
      {/* Background Magic (Sama seperti Login) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-50 contrast-150" />
      <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_80%,transparent_100%)]" />
      <Spotlight />

      {/* Header dengan Saldo Crystals */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-40 w-full max-w-5xl flex items-center justify-between mb-8 p-4 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <PackageSearch className="w-8 h-8 text-purple-400" />
          <h1 className="text-2xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">Gacha Portal</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-purple-950/50 px-4 py-2 rounded-full border border-purple-500/30">
          <Gem className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-amber-300">{userProfile ? userProfile.crystals : '...'}</span>
          <span className="text-xs text-purple-300 ml-1">Crystals</span>
        </div>
      </motion.div>

      {/* Konten Utama */}
      <div className="relative z-40 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Banner Gacha (Kiri) */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2">
          <Card className="border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-xl h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-3xl font-black">Standard Equipment Summon</CardTitle>
              <CardDescription className="text-slate-400">Peluang mendapatkan equipment legendaris (SSR: 5%, Rare: 25%, Common: 70%)</CardDescription>
            </CardHeader>
            
            <CardContent className="flex flex-col items-center justify-center p-8 flex-grow">
              <img 
                src="https://img.icons8.com/plasticine/200/treasure-chest.png" 
                alt="Treasure Chest" 
                className="w-48 h-48 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              />
            </CardContent>

            <div className="p-6 border-t border-white/5 bg-slate-950/30 rounded-b-xl flex flex-col items-center gap-4">
              {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
              <Button 
                onClick={handlePullGacha} 
                disabled={loading || !userProfile}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-lg shadow-lg shadow-purple-600/20 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                SUMMON x1 (100 Crystals)
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Hasil Gacha (Kanan) */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-xl h-full flex flex-col">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-xl font-bold text-slate-300">Summon Result</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-grow flex items-center justify-center p-6 relative">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute flex flex-col items-center gap-4"
                  >
                    <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Opening Portal...</p>
                  </motion.div>
                )}

                {gachaResult && !loading && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex flex-col items-center text-center gap-4"
                  >
                    {/* Efek Cahaya Belakang berdasarkan Rarity */}
                    <div className={`absolute w-32 h-32 rounded-full blur-3xl opacity-30 ${gachaResult.rarity === 'SSR' ? 'bg-amber-400' : 'bg-purple-600'}`} />
                    
                    <img src={gachaResult.image_url} alt={gachaResult.name} className="w-32 h-32 relative z-10" />
                    
                    <div className="relative z-10">
                      <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 bg-slate-800 rounded-full border border-white/5 ${rarityColors[gachaResult.rarity]}`}>
                        {gachaResult.rarity}
                      </span>
                      <h3 className="text-2xl font-black mt-2 leading-tight">{gachaResult.name}</h3>
                    </div>
                  </motion.div>
                )}

                {!gachaResult && !loading && (
                  <motion.p key="empty" className="text-slate-600 text-center text-sm font-medium">Portal is closed.<br/> Press 'Summon' to open.</motion.p>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </main>
  );
}

export default GachaPage;