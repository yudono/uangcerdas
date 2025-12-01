import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BellRing, 
  PieChart, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Download,
  Receipt,
  RefreshCw,
  Wallet,
  CreditCard,
  Store,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  FileSpreadsheet,
  Upload,
  PlayCircle,
  Clock,
  Save
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from 'recharts';
import { Button } from './Button';
import { AIAlert, DashboardStat, Transaction, HPPData } from '../types';

interface DashboardProps {
  onLogout: () => void;
}

// --- DUMMY DATA ---

const chartData = [
  { name: 'Sen', income: 4200, expense: 2100 },
  { name: 'Sel', income: 3800, expense: 1900 },
  { name: 'Rab', income: 5100, expense: 3200 },
  { name: 'Kam', income: 4700, expense: 2800 },
  { name: 'Jum', income: 5900, expense: 4100 },
  { name: 'Sab', income: 7200, expense: 4500 },
  { name: 'Min', income: 6800, expense: 3900 },
];

const initialTransactions: Transaction[] = [
  { id: 'TX-001', date: '24 Okt 2023, 10:30', desc: 'Penjualan Kopi Susu (20 cup)', category: 'Penjualan', amount: 360000, type: 'in', source: 'POS', status: 'completed' },
  { id: 'TX-002', date: '24 Okt 2023, 09:15', desc: 'Restock Susu UHT', category: 'Bahan Baku', amount: 850000, type: 'out', source: 'Bank', status: 'completed' },
  { id: 'TX-003', date: '23 Okt 2023, 20:00', desc: 'Settlement QRIS', category: 'Pencairan', amount: 2450000, type: 'in', source: 'E-Wallet', status: 'completed' },
  { id: 'TX-004', date: '23 Okt 2023, 14:20', desc: 'Token Listrik', category: 'Operasional', amount: 200000, type: 'out', source: 'E-Wallet', status: 'completed' },
  { id: 'TX-005', date: '23 Okt 2023, 11:00', desc: 'Uang Tunai Kasir', category: 'Kas', amount: 500000, type: 'in', source: 'Cash', status: 'completed' },
  { id: 'TX-006', date: '22 Okt 2023, 16:45', desc: 'Servis Mesin Espresso', category: 'Maintenance', amount: 1200000, type: 'out', source: 'Bank', status: 'pending' },
];

const initialAlerts: AIAlert[] = [
  {
    id: '1',
    severity: 'high',
    title: 'Lonjakan Tagihan Listrik',
    description: 'Tagihan listrik terdeteksi 40% lebih tinggi dari rata-rata.',
    date: 'Hari ini, 09:00',
    amount: '-Rp 850.000',
    recommendation: 'Analisis menunjukkan penggunaan tinggi di jam 22:00-06:00. Kemungkinan AC gudang lupa dimatikan.',
    suggestedActions: ['Cek Timer AC Gudang', 'Briefing Staff Malam', 'Set Reminder Otomatis'],
    status: 'new',
    impact: 'Hemat Rp 350rb/bln'
  },
  {
    id: '2',
    severity: 'medium',
    title: 'Supplier Overcharge',
    description: 'Harga "Biji Kopi Arabica" Supplier A naik 12% minggu ini.',
    date: 'Kemarin, 14:20',
    amount: 'Selisih Rp 150.000',
    recommendation: 'Supplier B menawarkan harga lebih murah dengan kualitas setara.',
    suggestedActions: ['Hubungi Supplier A (Nego)', 'Lihat Kontak Supplier B', 'Order Test Batch Supplier B'],
    status: 'new',
    impact: 'Potensi Hemat 12%'
  },
  {
    id: '3',
    severity: 'low',
    title: 'Pengeluaran Rutin Naik',
    description: 'Biaya packaging naik 5% bulan ini.',
    date: '22 Okt, 10:00',
    recommendation: 'Coba beli grosir dalam jumlah lebih besar untuk diskon.',
    suggestedActions: ['Cek Stok Gudang', 'Buat PO Bulk Order'],
    status: 'in_progress',
    userNotes: 'Sedang cek kapasitas gudang sebelum order banyak.',
    impact: 'Hemat Rp 50rb/trx'
  }
];

// Mock HPP Data
const hppData: HPPData = {
  totalRevenue: 42500000,
  rawMaterialCost: 18500000,
  productionCost: 5000000,
  grossProfit: 19000000,
  marginPercent: 44.7
};

// --- UTILS ---

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
};

// --- COMPONENT ---

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'alerts' | 'reports' | 'settings'>('overview');
  const [alerts, setAlerts] = useState<AIAlert[]>(initialAlerts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Alert Filtering
  const [alertFilter, setAlertFilter] = useState<'all' | 'new' | 'history'>('new');
  
  // Transaction Filtering
  const [txSearch, setTxSearch] = useState('');

  // Handlers
  const handleAlertAction = (id: string, actionStatus: 'in_progress' | 'resolved') => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: actionStatus } : a));
  };

  const handleUpdateNote = (id: string, note: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, userNotes: note } : a));
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Simulate new transaction
      const newTx: Transaction = {
        id: `TX-NEW-${Date.now()}`,
        date: 'Baru Saja',
        desc: 'Pembayaran QRIS Masuk',
        category: 'Penjualan',
        amount: 150000,
        type: 'in',
        source: 'E-Wallet',
        status: 'completed'
      };
      setTransactions([newTx, ...transactions]);
    }, 1500);
  };

  const handleImport = () => {
    setShowImportModal(false);
    alert("Simulasi: Data Excel berhasil diimpor! 15 transaksi baru ditambahkan.");
    // In real app, parse CSV here
  };

  // --- RENDERERS ---

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ringkasan Bisnis</h2>
          <p className="text-slate-500 text-sm">Update terakhir: Real-time</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveTab('reports')} className="hidden md:flex">
                <FileSpreadsheet size={16} className="mr-2"/> Laporan
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSync} className="flex items-center gap-2">
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? 'Sinkronisasi...' : 'Sync Data'}
            </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-2">Total Pemasukan</p>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{formatCurrency(hppData.totalRevenue)}</h3>
            <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
                <TrendingUp size={14} className="mr-1" /> +12% vs bulan lalu
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-2">Total Pengeluaran</p>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{formatCurrency(hppData.rawMaterialCost + hppData.productionCost + 4700000)}</h3>
            <div className="flex items-center text-xs font-semibold text-red-600 bg-red-50 w-fit px-2 py-1 rounded-full">
                <TrendingDown size={14} className="mr-1" /> +5% vs bulan lalu
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
            <p className="text-sm font-medium text-emerald-100 mb-2">Saldo Bersih</p>
            <h3 className="text-3xl font-bold mb-2">Rp 14.300.000</h3>
            <p className="text-xs text-emerald-100 opacity-80">Aman untuk operasional 2 bulan.</p>
        </div>
      </div>

      {/* HPP & Margin Analysis Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold text-slate-800">Analisis HPP & Margin</h3>
                <p className="text-sm text-slate-500">Hitungan Harga Pokok Penjualan vs Laba Kotor</p>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Sehat</span>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Visualization */}
            <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-slate-600">Pendapatan (Revenue)</span>
                    <span className="text-slate-900">{formatCurrency(hppData.totalRevenue)}</span>
                </div>
                <div className="w-full bg-emerald-100 rounded-full h-4"></div>
                
                <div className="pl-4 border-l-2 border-slate-200 space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Biaya Bahan Baku</span>
                            <span className="text-slate-700 font-semibold">{formatCurrency(hppData.rawMaterialCost)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-amber-400 h-2" style={{width: '45%'}}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Biaya Produksi Lain</span>
                            <span className="text-slate-700 font-semibold">{formatCurrency(hppData.productionCost)}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-blue-400 h-2" style={{width: '12%'}}></div>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <div className="flex justify-between text-sm font-bold mb-1">
                        <span className="text-emerald-700">Margin Kotor (Gross Profit)</span>
                        <span className="text-emerald-700">{formatCurrency(hppData.grossProfit)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                         <div className="bg-emerald-500 h-4 rounded-full" style={{width: `${hppData.marginPercent}%`}}></div>
                    </div>
                    <p className="text-right text-xs text-emerald-600 mt-1 font-bold">{hppData.marginPercent}% Margin</p>
                </div>
            </div>

            {/* Right: Insight */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="text-emerald-600" size={20} />
                    <h4 className="font-bold text-slate-800">Insight AI</h4>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Margin kotor Anda (44.7%) di atas rata-rata industri F&B sejenis (35-40%). Pertahankan efisiensi bahan baku. Namun, biaya produksi sedikit meningkat minggu ini.
                </p>
                <Button size="sm" variant="outline" className="w-full bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                    Lihat Detail Biaya Produksi
                </Button>
            </div>
        </div>
      </div>

      {/* Cashflow Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Tren Arus Kas Mingguan</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
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
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(value) => `${value/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`Rp ${value}k`, '']}
              />
              <Area type="monotone" dataKey="income" name="Pemasukan" stroke="#10b981" strokeWidth={2} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpense)" />
              <Legend verticalAlign="top" height={36}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => {
    // Filter alerts
    const displayedAlerts = alerts.filter(a => {
        if (alertFilter === 'new') return a.status === 'new';
        if (alertFilter === 'history') return a.status === 'resolved';
        return true; // 'all' - actually used for mixed, but let's stick to simple logic
    });
    // Include 'in_progress' in 'new' view for simplicity, or make a separate filter. 
    // Let's refine: Active (New + In Progress) vs History (Resolved)
    const activeAlerts = alerts.filter(a => ['new', 'in_progress'].includes(a.status));
    const historyAlerts = alerts.filter(a => a.status === 'resolved');

    const listToShow = alertFilter === 'history' ? historyAlerts : activeAlerts;

    return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financial Leak Detector</h2>
          <p className="text-slate-500">AI memantau anomali dan memberikan rekomendasi tindakan.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setAlertFilter('new')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${alertFilter === 'new' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Perlu Tindakan ({activeAlerts.length})
            </button>
            <button 
                onClick={() => setAlertFilter('history')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${alertFilter === 'history' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Riwayat ({historyAlerts.length})
            </button>
        </div>
      </div>

      <div className="grid gap-4">
        {listToShow.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">Tidak ada alert</h3>
                <p className="text-slate-500">Cashflow bisnis Anda terlihat aman!</p>
            </div>
        )}

        {listToShow.map((alert) => (
          <div 
            key={alert.id} 
            className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden ${
              alert.status === 'resolved' ? 'border-slate-200 bg-slate-50/50' : 
              alert.severity === 'high' ? 'border-red-200 shadow-sm' : 'border-slate-200 shadow-sm'
            }`}
          >
            {/* Alert Header */}
            <div 
              className="p-5 cursor-pointer flex items-start gap-4 hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
            >
              <div className={`mt-1 p-2 rounded-lg flex-shrink-0 ${
                alert.status === 'resolved' ? 'bg-slate-200 text-slate-500' :
                alert.severity === 'high' ? 'bg-red-100 text-red-600' : 
                alert.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {alert.status === 'resolved' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-lg ${alert.status === 'resolved' ? 'text-slate-500' : 'text-slate-800'}`}>
                        {alert.title}
                    </h4>
                    {alert.status === 'in_progress' && (
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Sedang Diproses</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-medium text-slate-400">{alert.date}</span>
                     {expandedAlert === alert.id ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                  </div>
                </div>
                <p className="text-slate-600">{alert.description}</p>
                {alert.amount && <p className="text-red-600 font-bold mt-1 text-sm">{alert.amount}</p>}
              </div>
            </div>

            {/* Expanded Action Area */}
            {expandedAlert === alert.id && (
              <div className="bg-slate-50 px-5 pb-5 pt-0 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                <div className="mt-4 bg-white border border-emerald-100 rounded-xl p-5 relative overflow-hidden shadow-sm">
                   
                   {/* Recommendation Section */}
                   <div className="flex gap-4 mb-6">
                      <div className="bg-emerald-100 p-2 rounded-full h-fit flex-shrink-0">
                        <ShieldCheck size={20} className="text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-slate-800 mb-2">Rekomendasi Cerdas AI</h5>
                        <p className="text-sm text-slate-600 mb-3 leading-relaxed">{alert.recommendation}</p>
                        {alert.impact && (
                            <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                                💡 {alert.impact}
                            </div>
                        )}
                      </div>
                   </div>

                   {/* Actions Buttons */}
                   {alert.status !== 'resolved' && (
                       <div className="mb-6">
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tindakan yang Disarankan</p>
                           <div className="flex flex-wrap gap-3">
                                {alert.suggestedActions.map((action, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleAlertAction(alert.id, 'in_progress')}
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all flex items-center gap-2"
                                    >
                                        <PlayCircle size={14} />
                                        {action}
                                    </button>
                                ))}
                           </div>
                       </div>
                   )}

                   {/* User Notes & Finalize */}
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Catatan Tindakan</p>
                        <textarea 
                            className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none mb-3"
                            placeholder="Tulis catatan hasil tindakan Anda di sini... (Contoh: Sudah telpon supplier, harga baru efektif minggu depan)"
                            rows={2}
                            value={alert.userNotes || ''}
                            onChange={(e) => handleUpdateNote(alert.id, e.target.value)}
                            disabled={alert.status === 'resolved'}
                        ></textarea>
                        
                        <div className="flex justify-end gap-3">
                            {alert.status !== 'resolved' ? (
                                <>
                                    <Button variant="ghost" size="sm" onClick={() => setExpandedAlert(null)}>Tutup</Button>
                                    <Button size="sm" onClick={() => handleAlertAction(alert.id, 'resolved')}>
                                        <CheckCircle2 size={16} className="mr-2" /> Tandai Selesai
                                    </Button>
                                </>
                            ) : (
                                <span className="text-sm text-emerald-600 font-medium flex items-center">
                                    <CheckCircle2 size={16} className="mr-2" /> Masalah Terselesaikan
                                </span>
                            )}
                        </div>
                   </div>

                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )};

  const renderTransactions = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Riwayat Transaksi</h2>
          <p className="text-slate-500 text-sm">Integrasi aktif: BCA, GoPay, Moka POS</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowImportModal(true)}>
             <Upload size={16} /> Import Excel
          </Button>
          <Button variant="primary" className="flex items-center gap-2">
             <Receipt size={16} /> Input Manual
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
                type="text" 
                placeholder="Cari deskripsi, nominal, atau kategori..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
             />
         </div>
         <div className="flex gap-2 overflow-x-auto no-scrollbar">
             <select className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:border-emerald-500">
                 <option>Semua Tanggal</option>
                 <option>Hari Ini</option>
                 <option>Minggu Ini</option>
                 <option>Bulan Ini</option>
             </select>
             <select className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:border-emerald-500">
                 <option>Semua Kategori</option>
                 <option>Penjualan</option>
                 <option>Bahan Baku</option>
                 <option>Operasional</option>
             </select>
             <select className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:border-emerald-500">
                 <option>Semua Sumber</option>
                 <option>Bank</option>
                 <option>E-Wallet</option>
                 <option>POS</option>
             </select>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-slate-50 border-b border-slate-100">
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deskripsi</th>
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sumber</th>
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Jumlah</th>
                 <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {transactions
                .filter(t => t.desc.toLowerCase().includes(txSearch.toLowerCase()) || t.amount.toString().includes(txSearch))
                .map((tx) => (
                 <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                   <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{tx.date}</td>
                   <td className="p-4 text-sm font-medium text-slate-800">{tx.desc}</td>
                   <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        {tx.source === 'Bank' && <CreditCard size={14} className="text-blue-600" />}
                        {tx.source === 'E-Wallet' && <Wallet size={14} className="text-purple-600" />}
                        {tx.source === 'POS' && <Store size={14} className="text-orange-600" />}
                        {tx.source === 'Cash' && <Receipt size={14} className="text-emerald-600" />}
                        {tx.source === 'Import' && <FileSpreadsheet size={14} className="text-slate-600" />}
                        {tx.source}
                      </div>
                   </td>
                   <td className="p-4">
                     <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 whitespace-nowrap">
                       {tx.category}
                     </span>
                   </td>
                   <td className={`p-4 text-sm font-bold text-right whitespace-nowrap ${tx.type === 'in' ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {tx.type === 'in' ? '+' : '-'}{formatCurrency(tx.amount)}
                   </td>
                   <td className="p-4 text-center">
                     {tx.status === 'completed' ? (
                       <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 size={14} /></span>
                     ) : (
                       <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-medium">Pending</span>
                     )}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Laporan & Prediksi</h2>
          <p className="text-slate-500 text-sm">Analisis 360° performa bisnis Anda.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2"><Download size={16}/> Excel</Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2"><Download size={16}/> PDF</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Prediction Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-emerald-100 p-2 rounded-lg"><TrendingUp size={20} className="text-emerald-600"/></div>
             <div>
                 <h3 className="text-lg font-bold text-slate-800">Prediksi Cashflow</h3>
                 <p className="text-xs text-slate-500">Estimasi AI untuk bulan depan</p>
             </div>
          </div>
          
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Sep', val: 32000, color: '#94a3b8' },
                { name: 'Okt', val: 42500, color: '#10b981' },
                { name: 'Nov (Est)', val: 51000, color: '#34d399', isPrediction: true },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tickFormatter={(val) => `${val/1000}jt`} fontSize={12} />
                <Tooltip cursor={{fill: 'transparent'}} formatter={(val) => `Rp ${Number(val).toLocaleString()}`} />
                <Bar dataKey="val" radius={[6, 6, 0, 0]} barSize={60}>
                  {
                    [0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? 'url(#striped-pattern)' : (index === 1 ? '#10b981' : '#cbd5e1')} />
                    ))
                  }
                </Bar>
                <defs>
                   <pattern id="striped-pattern" patternUnits="userSpaceOnUse" width="8" height="8" transform="rotate(45)">
                      <rect width="4" height="8" fill="#d1fae5"/>
                   </pattern>
                </defs>
              </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* AI Efficiency Impact */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1">
           <div className="flex items-center gap-2 mb-4">
             <div className="bg-blue-100 p-2 rounded-lg"><ShieldCheck size={20} className="text-blue-600"/></div>
             <div>
                 <h3 className="text-lg font-bold text-slate-800">Efisiensi AI Guardian</h3>
                 <p className="text-xs text-slate-500">Dampak tindakan Anda terhadap profit</p>
             </div>
          </div>

           <div className="space-y-6">
               <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                   <div>
                       <p className="text-sm text-emerald-800 font-medium">Estimasi Penghematan Bulan Ini</p>
                       <p className="text-2xl font-bold text-emerald-600">Rp 1.450.000</p>
                   </div>
                   <div className="h-10 w-10 bg-emerald-200 rounded-full flex items-center justify-center">
                       <TrendingUp className="text-emerald-700" size={20} />
                   </div>
               </div>

               <div>
                   <p className="text-sm font-bold text-slate-700 mb-3">Tindakan Berdampak Tinggi</p>
                   <ul className="space-y-3">
                       <li className="flex items-start gap-3 text-sm">
                           <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
                           <span className="text-slate-600">Nego harga supplier kopi (Hemat Rp 850k)</span>
                       </li>
                       <li className="flex items-start gap-3 text-sm">
                           <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
                           <span className="text-slate-600">Optimasi penggunaan listrik gudang (Hemat Rp 350k)</span>
                       </li>
                       <li className="flex items-start gap-3 text-sm">
                           <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
                           <span className="text-slate-600">Switch vendor packaging (Hemat Rp 250k)</span>
                       </li>
                   </ul>
               </div>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed overflow-y-auto z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">UangCerdas</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Menu Utama</p>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <LayoutDashboard size={20} /> Ringkasan
          </button>
          
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'alerts' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <div className="relative">
              <BellRing size={20} />
              {alerts.some(a => a.status === 'new') && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
            </div>
            AI Guardian
          </button>

          <button 
            onClick={() => setActiveTab('transactions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'transactions' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Receipt size={20} /> Transaksi
          </button>
          
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'reports' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <PieChart size={20} /> Laporan
          </button>

          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-8">Preferensi</p>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Settings size={20} /> Pengaturan
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
             <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 shadow-sm">K</div>
             <div className="overflow-hidden">
                <p className="font-bold text-slate-800 text-sm truncate">Kopi Senja</p>
                <p className="text-slate-500 text-xs truncate">Pro Plan • Aktif</p>
             </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors mt-2">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100 sticky top-0 z-10">
           <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1 rounded">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">UangCerdas</span>
          </div>
          <button onClick={onLogout}><LogOut size={22} className="text-slate-500" /></button>
        </div>
        
        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex space-x-2 overflow-x-auto mb-6 pb-2 no-scrollbar">
           {['overview', 'alerts', 'transactions', 'reports'].map((tab) => (
             <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
             >
               {tab === 'overview' ? 'Ringkasan' : tab === 'alerts' ? 'AI Guardian' : tab === 'transactions' ? 'Transaksi' : 'Laporan'}
             </button>
           ))}
        </div>

        {/* Dynamic Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'transactions' && renderTransactions()}
          {activeTab === 'alerts' && renderAlerts()}
          {activeTab === 'reports' && renderReports()}
          {activeTab === 'settings' && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
              <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-700">Pengaturan</h2>
              <p className="text-slate-500">Halaman profil dan konfigurasi integrasi.</p>
            </div>
          )}
        </div>
      </main>

      {/* Import Modal */}
      {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Import Transaksi</h3>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer mb-6">
                      <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 font-medium">Klik untuk upload file Excel / CSV</p>
                      <p className="text-xs text-slate-400 mt-1">Maksimal 5MB</p>
                  </div>
                  <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 justify-center" onClick={() => setShowImportModal(false)}>Batal</Button>
                      <Button className="flex-1 justify-center" onClick={handleImport}>Upload & Proses</Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};