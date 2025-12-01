import React from 'react';
import { Check, X } from 'lucide-react';

export const Comparison: React.FC = () => {
  const rows = [
    { name: "Pencatatan Pemasukan/Pengeluaran", traditional: true, app: true },
    { name: "Laporan Laba Rugi", traditional: true, app: true },
    { name: "Deteksi Kebocoran Otomatis", traditional: false, app: true },
    { name: "Notifikasi 'Bahaya' Real-time", traditional: false, app: true },
    { name: "Saran Tindakan Konkret", traditional: false, app: true },
    { name: "Prediksi Cashflow Bulan Depan", traditional: false, app: true },
  ];

  return (
    <section id="advantage" className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Kenapa UangCerdas Beda?</h2>
          <p className="mt-4 text-slate-600">Jangan sekedar mencatat, mulailah mengamankan.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <div className="grid grid-cols-3 bg-slate-900 text-white p-6 items-center">
            <div className="font-semibold">Fitur</div>
            <div className="text-center text-slate-400 font-medium text-sm sm:text-base">Akuntansi Biasa</div>
            <div className="text-center font-bold text-emerald-400 text-lg flex items-center justify-center gap-2">
               UangCerdas
            </div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 p-4 sm:p-6 items-center hover:bg-slate-50 transition-colors">
                <div className="text-sm sm:text-base font-medium text-slate-700">{row.name}</div>
                
                <div className="flex justify-center">
                  {row.traditional ? 
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center"><Check size={14} className="text-slate-600" /></div> : 
                    <X size={18} className="text-slate-300" />
                  }
                </div>
                
                <div className="flex justify-center">
                  {row.app ? 
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm"><Check size={18} className="text-emerald-600 stroke-[3]" /></div> : 
                    <X size={18} className="text-slate-300" />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};