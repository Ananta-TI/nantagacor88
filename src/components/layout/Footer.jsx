// src/components/layout/Footer.jsx
import React from 'react';
import { 
  Gem, 
  ShieldCheck, 
  MessageCircle, 
  Headphones, 
  ChevronRight,
  Landmark,
  CreditCard
} from 'lucide-react';

export default function Footer() {
  const providers = ['PRAGMATIC PLAY', 'PG SOFT', 'MICROGAMING', 'HABANERO', 'SPADEGAMING', 'JOKER123'];
  const payments = ['BCA', 'MANDIRI', 'BNI', 'BRI', 'DANA', 'OVO', 'GOPAY', 'LINKAJA'];

  return (
    <footer className="relative z-10 border-t border-yellow-500/20 pt-60 pb-6 bg-gradient-to-b -mt-19 from-[#020617] to-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* PROVIDER & PAYMENT SECTION (TRUST INDICATORS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 pb-10 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-4 text-yellow-500">
              <Gem className="w-5 h-5" />
              <h3 className="font-black italic uppercase tracking-wider text-sm">Official Partners</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {providers.map((provider, i) => (
                <span key={i} className="text-[10px] md:text-xs font-bold text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-md transition-all cursor-default bg-white/5">
                  {provider}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4 text-yellow-500">
              <Landmark className="w-5 h-5" />
              <h3 className="font-black italic uppercase tracking-wider text-sm">Metode Pembayaran</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {payments.map((payment, i) => (
                <span key={i} className="text-[10px] md:text-xs font-bold text-white/40 hover:text-green-400 border border-white/10 hover:border-green-400/30 px-3 py-1.5 rounded-md transition-all cursor-default bg-white/5">
                  {payment}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN FOOTER LINKS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                <Gem className="w-4 h-4 text-black" />
              </div>
              <span className="font-black italic text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                NANTAGACOR88
              </span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed font-medium mb-4">
              Platform hiburan mesin slot online terpercaya nomor 1 di Indonesia. Menjamin keamanan data dan transaksi diproses di bawah 3 menit.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-2 rounded-lg border border-emerald-400/20 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Verified by PAGCOR</span>
            </div>
          </div>

          {[
            { title: 'Permainan Favorit', links: ['Slot Gacor Hari Ini', 'Live Casino VIP', 'Taruhan Bola', 'Tembak Ikan Arcade', 'Togel Online'] },
            { title: 'Pusat Informasi', links: ['Tentang Kami', 'Syarat & Ketentuan', 'Kebijakan Privasi', 'Promo & Bonus', 'RTP Live Slot'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-black text-sm uppercase tracking-widest text-white mb-5 flex items-center gap-2">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l} className="group">
                    <a href="#" className="flex items-center text-sm text-white/50 group-hover:text-yellow-400 transition-all duration-300">
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-1 text-yellow-500" />
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* HUBUNGI KAMI SECTION */}
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest text-white mb-5 flex items-center gap-2">
              Layanan 24/7
            </h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 hover:border-white/20">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-bold text-white">WhatsApp VIP</p>
                  <p className="text-[10px]">Respon Cepat</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 hover:border-white/20">
                <Headphones className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-bold text-white">Live Chat</p>
                  <p className="text-[10px]">Online 24 Jam</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* SEO TEXT BLOCK (Khas Judol) */}
        <div className="border-t border-white/5 pt-8 mb-8 text-[10px] text-white/20 text-justify leading-relaxed hidden md:block">
          <p>
            <strong className="text-white/30">NANTAGACOR88 - Situs Slot Gacor Terpercaya Auto Maxwin.</strong> Kami adalah penyedia layanan permainan slot online terkemuka yang menawarkan berbagai macam game slot dengan RTP tertinggi hari ini. Bergabunglah bersama jutaan member lainnya dan nikmati sensasi jackpot progresif terbesar. Kami berkomitmen untuk menyediakan lingkungan bermain yang aman, adil, dan transparan didukung oleh teknologi enkripsi terbaru. Segala bentuk kecurangan akan ditindak tegas. Pastikan Anda telah membaca syarat dan ketentuan yang berlaku sebelum mulai bermain.
          </p>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p className="font-medium tracking-wide">© {new Date().getFullYear()} NANTAGACOR88. All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-black text-[10px]">18+</div>
            <p className="text-[10px] max-w-xs text-center md:text-right">Dilarang keras bagi usia di bawah 18 tahun. Bermainlah dengan bijak dan bertanggung jawab.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}