import React from 'react';
import { ScanSearch, BellRing, Smartphone } from 'lucide-react';

export const Solution: React.FC = () => {
  const features = [
    {
      icon: ScanSearch,
      title: "Auto-Detect Pengeluaran Aneh",
      desc: "AI kami mempelajari pola bisnismu. Jika ada belanja bahan yang harganya tidak wajar, kamu langsung tahu."
    },
    {
      icon: BellRing,
      title: "Alert Real-time ke HP",
      desc: "Dapatkan notifikasi WhatsApp/App saat cashflow menipis atau ada transaksi mencurigakan."
    },
    {
      icon: Smartphone,
      title: "Dashboard Anti-Ribet",
      desc: "Lupakan istilah akuntansi yang rumit. Kami pakai bahasa manusia: Uang Masuk, Uang Keluar, Sisa Uang."
    }
  ];

  return (
    <section id="features" className="py-20 bg-slate-900 text-white overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <div className="inline-block px-4 py-1 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 font-medium text-sm mb-6">
              Solusi Kami
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">
              AI Financial Leak Detector: <br/>
              <span className="text-emerald-400">Satpam Digital untuk Uangmu</span>
            </h2>
            <p className="text-slate-300 text-lg mb-10">
              SmartKas bekerja 24/7 memantau setiap rupiah yang keluar masuk, menganalisis anomali, dan memberimu saran tindakan nyata untuk menyelamatkan profit.
            </p>

            <div className="space-y-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
             {/* Abstract visual representing 'Safety' and 'AI' */}
             <div className="aspect-square bg-gradient-to-tr from-slate-800 to-slate-800 rounded-3xl border border-slate-700 p-8 shadow-2xl relative">
                {/* Simulated AI Interface Elements */}
                <div className="absolute top-8 left-8 right-8 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-emerald-500"></div>
                </div>
                <div className="mt-8 flex justify-between text-sm text-slate-400 mb-8">
                    <span>Scan progress</span>
                    <span>75%</span>
                </div>
                
                <div className="space-y-4">
                    {[1,2,3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                <div className="h-2 w-24 bg-slate-700 rounded"></div>
                            </div>
                            <div className="h-2 w-12 bg-slate-700 rounded"></div>
                        </div>
                    ))}
                     <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl mt-6">
                        <div className="flex gap-3 text-emerald-400 mb-2">
                             <ScanSearch size={20} />
                             <span className="font-bold">Insight Ditemukan</span>
                        </div>
                        <p className="text-sm text-slate-300">Pengeluaran listrik bulan ini 15% lebih tinggi dari biasanya. Cek penggunaan AC di gudang.</p>
                     </div>
                </div>
             </div>
             {/* Floating decorative elements */}
             <div className="absolute -top-6 -right-6 bg-white text-slate-900 p-4 rounded-xl shadow-xl font-bold animate-bounce hidden md:block">
                 Hemat 2jt bulan ini! 💰
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};