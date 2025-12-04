import React from 'react';
import { AlertOctagon, FileQuestion, TrendingDown } from 'lucide-react';

export const Problem: React.FC = () => {
  const problems = [
    {
      icon: TrendingDown,
      title: "Cashflow Kacau",
      desc: "Uang masuk banyak, tapi akhir bulan saldo kosong. Tidak tahu uangnya lari kemana."
    },
    {
      icon: AlertOctagon,
      title: "Kebocoran Halus",
      desc: "Pengeluaran kecil yang tidak tercatat menumpuk jadi jutaan rupiah setiap bulan tanpa disadari."
    },
    {
      icon: FileQuestion,
      title: "Pusing Rekap Manual",
      desc: "Habis waktu berjam-jam input Excel atau tulis buku, tapi datanya tetap tidak akurat."
    }
  ];

  return (
    <section id="problem" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Pernah Merasa Profit Hilang Diam-Diam?</h2>
          <p className="text-lg text-slate-600">Masalah klasik UMKM bukan di kurang pelanggan, tapi di <span className="text-red-600 font-semibold decoration-red-200 underline decoration-2">kebocoran operasional</span>.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors">
                <item.icon className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};