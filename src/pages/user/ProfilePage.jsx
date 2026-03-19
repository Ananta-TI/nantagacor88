// src/pages/user/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, ArrowLeft, Loader2, Save, ShieldCheck, Gem } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Ambil data Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Gagal mengambil data user");
      
      setUser(user);
      setNewUsername(user.user_metadata?.username || '');

      // Ambil data tambahan (seperti crystals & role) dari tabel profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (!profileError && profile) {
        setProfileData(profile);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Update metadata di Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { username: newUsername }
      });
      if (authError) throw authError;

      // 2. Update kolom username di tabel profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', user.id);
      if (profileError) throw profileError;

      setMessage({ type: 'success', text: 'Identitas berhasil diperbarui!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-yellow-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 mt-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-slate-400 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <span className="text-4xl font-black text-black">
                    {newUsername?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-3xl font-black text-white">{newUsername}</CardTitle>
                  <CardDescription className="text-slate-400 flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" /> {user?.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form Update */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-200">
                  <User className="text-yellow-500 w-5 h-5" /> Edit Profile
                </h3>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Username</Label>
                    <Input 
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="bg-black/50 border-white/10 text-white focus:border-yellow-500 h-12"
                      required
                    />
                  </div>

                  <AnimatePresence>
                    {message.text && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className={`text-xs font-bold p-3 rounded-lg border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                      >
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button type="submit" disabled={updating || newUsername === user?.user_metadata?.username} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12">
                    {updating ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
                    Simpan Perubahan
                  </Button>
                </form>
              </div>

              {/* Stats / Info Tambahan */}
              <div className="space-y-6 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-200">
                  <ShieldCheck className="text-yellow-500 w-5 h-5" /> Account Status
                </h3>
                
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Role</p>
                    <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${profileData?.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-800 text-slate-300'}`}>
                      {profileData?.role || 'USER'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Crystals Balance</p>
                    <div className="flex items-center gap-2 text-2xl font-black text-amber-400">
                      <Gem className="w-6 h-6" /> {profileData?.crystals || 0}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}

export default ProfilePage;