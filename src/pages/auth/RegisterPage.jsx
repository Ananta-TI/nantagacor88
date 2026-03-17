import React, { useState } from 'react';
import { supabase } from '../../supabaseClient'; 
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Loader2, UserPlus, ArrowLeft } from 'lucide-react';

// Import komponen Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSuccess, setIsSuccess] = useState(false); 
  
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setIsSuccess(false);

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles').select('username').eq('username', formData.username).maybeSingle();

      if (existingUser) throw new Error('Username sudah digunakan!');

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { username: formData.username, role: 'user' } },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          throw new Error('Email sudah terdaftar!');
        }
        throw error;
      }

      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('Email sudah terdaftar!');
      }

      setIsSuccess(true);
      setMessage({ type: 'success', text: 'Cek email kamu untuk konfirmasi!' });

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-40 w-full max-w-md"
      >
        <Card className="border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(170,59,255,0.2)]">
          <CardHeader className="text-center pb-2">
            <motion.div 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }}
              className="mx-auto w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20"
            >
              <UserPlus className="w-7 h-7 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent text-center">
              New Account
            </CardTitle>
            <CardDescription className="text-slate-400 font-medium text-center">
              Join the terminal to start your journey
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4 p-4 text-center border border-purple-500/20 bg-purple-500/10 rounded-xl"
                >
                  <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-2">
                    <Mail className="text-purple-400" />
                  </div>
                  <h3 className="text-purple-400 font-bold">Verification Sent</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Kami telah mengirimkan link aktivasi ke <b>{formData.email}</b>. Silakan konfirmasi sebelum login.
                  </p>
                  <Button onClick={() => navigate('/login')} className="w-full bg-purple-600 hover:bg-purple-500">
                    Back to Login
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Username</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input 
                        name="username" 
                        placeholder="nta_ananta"
                        className="pl-10 h-12 bg-white/5 border-white/10 focus:border-purple-500/50 transition-all text-white placeholder:text-slate-600 rounded-xl"
                        onChange={handleChange} required 
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input 
                        name="email" 
                        type="email"
                        placeholder="example@gmail.com"
                        className="pl-10 h-12 bg-white/5 border-white/10 focus:border-purple-500/50 transition-all text-white placeholder:text-slate-600 rounded-xl"
                        onChange={handleChange} required 
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Secure Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                      <Input 
                        name="password" 
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-12 bg-white/5 border-white/10 focus:border-purple-500/50 transition-all text-white placeholder:text-slate-600 rounded-xl"
                        onChange={handleChange} required 
                      />
                    </div>
                  </div>

                  {message.text && !isSuccess && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="text-[11px] font-bold p-3 rounded-lg border bg-red-500/10 border-red-500/20 text-red-400"
                    >
                      {message.text}
                    </motion.div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all active:scale-[0.97]"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "CREATE IDENTITY"}
                  </Button>
                </form>
              )}
            </AnimatePresence>
          </CardContent>
          
          {!isSuccess && (
            <CardFooter className="justify-center border-t border-white/5 pt-6 pb-8">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">
                Already have an identity? <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">Sign In</Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </main>
  );
}

export default RegisterPage;