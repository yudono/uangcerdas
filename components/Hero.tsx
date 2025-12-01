import React from 'react';
import { Button } from './Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { DashboardDemo } from './DashboardDemo';

interface HeroProps {
  onStartClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-slate-50">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-100/50 rounded-bl-full blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AI Cashflow Guardian Pertama di Indonesia
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Stop Kebocoran <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Uang</span> Sebelum Terlambat
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Jaga cashflow bisnis lokalmu secara otomatis. Deteksi pengeluaran aneh, pantau profit real-time, dan tidur nyenyak tanpa pusing mikirin uang hilang.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="shadow-emerald-300/50" onClick={onStartClick}>
                Mulai Gratis 30 Hari <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={onStartClick}>
                Lihat Demo
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tanpa Kartu Kredit
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Setup 2 Menit
              </div>
            </div>
          </div>

          {/* Visual Content */}
          <div className="relative">
            <div className="relative z-10">
              <DashboardDemo />
            </div>
            {/* Decor circles */}
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-yellow-200 rounded-full blur-2xl opacity-60 z-0"></div>
            <div className="absolute top-10 -right-10 w-32 h-32 bg-emerald-200 rounded-full blur-2xl opacity-60 z-0"></div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
