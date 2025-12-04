import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

const data = [
  { name: 'Ming 1', income: 4000, expense: 2400 },
  { name: 'Ming 2', income: 3000, expense: 1398 },
  { name: 'Ming 3', income: 5000, expense: 8800 }, // Abnormal spike
  { name: 'Ming 4', income: 4780, expense: 2908 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const expense = payload[1]?.value;
    const isAbnormal = expense > 5000;

    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
        <p className="font-semibold text-slate-700 mb-2">{label}</p>
        <p className="text-emerald-600">Masuk: Rp {payload[0].value}k</p>
        <p className={`${isAbnormal ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
          Keluar: Rp {expense}k
        </p>
        {isAbnormal && (
          <div className="mt-2 flex items-center gap-1 text-xs text-red-600 bg-red-50 p-1 rounded">
            <AlertTriangle size={12} />
            <span>Anomaly Detected!</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const DashboardDemo: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-w-lg mx-auto transform hover:scale-[1.01] transition-transform duration-300">
      {/* Fake Browser Header */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="text-xs font-medium text-slate-400">dashboard.uangcerdas.id</div>
        <div className="w-4"></div>
      </div>

      {/* Dashboard Header */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Ringkasan Cashflow</h3>
            <p className="text-sm text-slate-500">Update Real-time</p>
          </div>
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Live
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-slate-50 rounded-xl">
             <div className="flex items-center gap-2 text-slate-500 mb-1">
                <DollarSign size={14} />
                <span className="text-xs font-medium">Saldo</span>
             </div>
             <div className="text-lg font-bold text-slate-800">Rp 12.5jt</div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl border border-red-100 relative overflow-hidden">
             <div className="flex items-center gap-2 text-red-600 mb-1 z-10 relative">
                <AlertTriangle size={14} />
                <span className="text-xs font-bold">Alert Baru</span>
             </div>
             <div className="text-xs text-red-800 leading-snug z-10 relative">
               Kebocoran <strong>Rp 500k</strong> terdeteksi di belanja bahan.
             </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-48 w-full px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* AI Suggestion */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="flex gap-3">
          <div className="bg-emerald-600 rounded-full p-1.5 h-fit mt-1">
             <TrendingUp size={12} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700 mb-1">Saran AI:</p>
            <p className="text-xs text-slate-600">Cek nota pembelian tanggal 18. Harga bahan baku naik 20% dibanding rata-rata.</p>
          </div>
        </div>
      </div>
    </div>
  );
};