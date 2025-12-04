import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Daftar & Login",
      desc: "Cukup pakai Nomor HP dan Nama Usaha. Tidak perlu dokumen ribet."
    },
    {
      num: "02",
      title: "Hubungkan Transaksi",
      desc: "Input manual super cepat, atau sambungkan dengan e-wallet/POS kasirmu."
    },
    {
      num: "03",
      title: "AI Bekerja",
      desc: "Sistem otomatis memantau pola cashflow dan mencari kebocoran."
    },
    {
      num: "04",
      title: "Terima Laporan",
      desc: "Dapat insight mingguan dan prediksi arus kas bulan depan."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Semudah Pesan Ojek Online</h2>
          <p className="mt-4 text-lg text-slate-600">Teknologi canggih, tapi cara pakainya simple banget.</p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white p-6 relative group">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 mx-auto md:mx-0 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 text-center md:text-left">{step.title}</h3>
                <p className="text-slate-600 text-center md:text-left text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};