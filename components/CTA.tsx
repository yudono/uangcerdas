import React from 'react';
import { Button } from './Button';
import { ArrowRight } from 'lucide-react';

export const CTA: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-600 rounded-3xl p-8 sm:p-16 text-center shadow-2xl shadow-emerald-200 relative overflow-hidden">
          
          {/* Decor circles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-800 opacity-20 rounded-full translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Mulai Lindungi Cashflow Usahamu Hari Ini
            </h2>
            <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
              Jangan tunggu sampai uang hilang tanpa jejak. Coba gratis 30 hari, tanpa komitmen, batalkan kapan saja.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-emerald-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-emerald-50 transition-colors shadow-lg flex items-center justify-center">
                Coba Gratis 30 Hari
              </button>
              <Button variant="outline" className="border-emerald-400 text-white hover:bg-emerald-700 hover:text-white hover:border-emerald-700">
                Hubungi Sales
              </Button>
            </div>
            
            <p className="mt-6 text-sm text-emerald-200/80">
              *Tersedia untuk Android & iOS
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};