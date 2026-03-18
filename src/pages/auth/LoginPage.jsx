import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, User, Loader2, ArrowRight } from 'lucide-react';

// Import komponen Shadcn & Magic UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Komponen Internal Ringkas
const Spotlight = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  return (
    <div 
      className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 opacity-50"
      onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(170, 59, 255, 0.1), transparent 80%)`,
      }}
    />
  );
};

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. TAMBAHKAN 'role' DI SINI
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, role') // Ambil email DAN role
        .eq('username', formData.username)
        .maybeSingle();

      if (profileError || !profileData) throw new Error('Username tidak ditemukan!');

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: profileData.email, 
        password: formData.password,
      });

      if (authError) throw authError;

      setMessage({ type: 'success', text: 'Berhasil masuk! Mengalihkan...' });
      
      // 2. CEK ROLE DARI profileData ATAU user_metadata
      const userRole = profileData.role || authData.user.user_metadata?.role;
      
      // 3. ARAHKAN SESUAI ROLE
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500);

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-[#020617] p-4 overflow-hidden">
      {/* Background Magic */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <Spotlight />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-40 w-full max-w-md"
      >
        <Card className="border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(170,59,255,0.2)]">
          <CardHeader className="text-center pb-2">
            <motion.div 
              initial={{ rotate: -10 }} 
              animate={{ rotate: 0 }}
              className="mx-auto w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20"
            >
              <Lock className="w-7 h-7 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Access Terminal
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium">
              Identify yourself to proceed
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Username</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input 
                    name="username" 
                    placeholder="daniel_john"
                    className="pl-10 h-12 bg-white/5 border-white/10 focus:border-purple-500/50 transition-all text-white placeholder:text-slate-600 rounded-xl"
                    onChange={handleChange} required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Password</Label>
                  <button type="button" className="text-[10px] uppercase font-bold text-purple-400 hover:text-purple-300 transition-colors">Forgot?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <Input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    className="pl-10 pr-12 h-12 bg-white/5 border-white/10 focus:border-purple-500/50 transition-all text-white placeholder:text-slate-600 rounded-xl"
                    onChange={handleChange} required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {message.text && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`text-xs font-bold p-3 rounded-lg border ${
                      message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                  >
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all active:scale-[0.97]"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <span className="flex items-center gap-2">LOG IN <ArrowRight size={16} /></span>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="justify-center border-t border-white/5 pt-6 pb-8">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">
              New here? <Link to="/register" className="text-purple-400 hover:text-purple-300 transition-colors">Create Identity</Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </main>
  );
}

export default LoginPage;