import { Button } from "../../components/Button";
import { DashboardLayout } from "@/src/components/Dashboard";
import { HPPData, Transaction } from "@/types";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";
import { formatCurrency } from "../../lib/format-currency";

const chartData = [
  { name: "Sen", income: 4200, expense: 2100 },
  { name: "Sel", income: 3800, expense: 1900 },
  { name: "Rab", income: 5100, expense: 3200 },
  { name: "Kam", income: 4700, expense: 2800 },
  { name: "Jum", income: 5900, expense: 4100 },
  { name: "Sab", income: 7200, expense: 4500 },
  { name: "Min", income: 6800, expense: 3900 },
];
// Mock HPP Data
const hppData: HPPData = {
  totalRevenue: 42500000,
  rawMaterialCost: 18500000,
  productionCost: 5000000,
  grossProfit: 19000000,
  marginPercent: 44.7,
};

export const initialTransactions: Transaction[] = [
  {
    id: "TX-001",
    date: "24 Okt 2023, 10:30",
    desc: "Penjualan Kopi Susu (20 cup)",
    category: "Penjualan",
    amount: 360000,
    type: "in",
    source: "POS",
    status: "completed",
  },
  {
    id: "TX-002",
    date: "24 Okt 2023, 09:15",
    desc: "Restock Susu UHT",
    category: "Bahan Baku",
    amount: 850000,
    type: "out",
    source: "Bank",
    status: "completed",
  },
  {
    id: "TX-003",
    date: "23 Okt 2023, 20:00",
    desc: "Settlement QRIS",
    category: "Pencairan",
    amount: 2450000,
    type: "in",
    source: "E-Wallet",
    status: "completed",
  },
  {
    id: "TX-004",
    date: "23 Okt 2023, 14:20",
    desc: "Token Listrik",
    category: "Operasional",
    amount: 200000,
    type: "out",
    source: "E-Wallet",
    status: "completed",
  },
  {
    id: "TX-005",
    date: "23 Okt 2023, 11:00",
    desc: "Uang Tunai Kasir",
    category: "Kas",
    amount: 500000,
    type: "in",
    source: "Cash",
    status: "completed",
  },
  {
    id: "TX-006",
    date: "22 Okt 2023, 16:45",
    desc: "Servis Mesin Espresso",
    category: "Maintenance",
    amount: 1200000,
    type: "out",
    source: "Bank",
    status: "pending",
  },
];

export default function DashboardPage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Simulate new transaction
      const newTx: Transaction = {
        id: `TX-NEW-${Date.now()}`,
        date: "Baru Saja",
        desc: "Pembayaran QRIS Masuk",
        category: "Penjualan",
        amount: 150000,
        type: "in",
        source: "E-Wallet",
        status: "completed",
      };
      setTransactions([newTx, ...transactions]);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Ringkasan Bisnis
            </h2>
            <p className="text-slate-500 text-sm">Update terakhir: Real-time</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              //   onClick={() => setActiveTab("reports")}
              className="hidden md:flex"
            >
              <FileSpreadsheet size={16} className="mr-2" /> Laporan
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSync}
              className="flex items-center gap-2"
            >
              <RefreshCw
                size={16}
                className={isSyncing ? "animate-spin" : ""}
              />
              {isSyncing ? "Sinkronisasi..." : "Sync Data"}
            </Button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-2">
              Total Pemasukan
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {formatCurrency(hppData.totalRevenue)}
            </h3>
            <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
              <TrendingUp size={14} className="mr-1" /> +12% vs bulan lalu
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-2">
              Total Pengeluaran
            </p>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {formatCurrency(
                hppData.rawMaterialCost + hppData.productionCost + 4700000
              )}
            </h3>
            <div className="flex items-center text-xs font-semibold text-red-600 bg-red-50 w-fit px-2 py-1 rounded-full">
              <TrendingDown size={14} className="mr-1" /> +5% vs bulan lalu
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
            <p className="text-sm font-medium text-emerald-100 mb-2">
              Saldo Bersih
            </p>
            <h3 className="text-3xl font-bold mb-2">Rp 14.300.000</h3>
            <p className="text-xs text-emerald-100 opacity-80">
              Aman untuk operasional 2 bulan.
            </p>
          </div>
        </div>

        {/* HPP & Margin Analysis Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Analisis HPP & Margin
              </h3>
              <p className="text-sm text-slate-500">
                Hitungan Harga Pokok Penjualan vs Laba Kotor
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
              Sehat
            </span>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Visualization */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-slate-600">Pendapatan (Revenue)</span>
                <span className="text-slate-900">
                  {formatCurrency(hppData.totalRevenue)}
                </span>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-4"></div>

              <div className="pl-4 border-l-2 border-slate-200 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Biaya Bahan Baku</span>
                    <span className="text-slate-700 font-semibold">
                      {formatCurrency(hppData.rawMaterialCost)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-2"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Biaya Produksi Lain</span>
                    <span className="text-slate-700 font-semibold">
                      {formatCurrency(hppData.productionCost)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-400 h-2"
                      style={{ width: "12%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-emerald-700">
                    Margin Kotor (Gross Profit)
                  </span>
                  <span className="text-emerald-700">
                    {formatCurrency(hppData.grossProfit)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-4 rounded-full"
                    style={{ width: `${hppData.marginPercent}%` }}
                  ></div>
                </div>
                <p className="text-right text-xs text-emerald-600 mt-1 font-bold">
                  {hppData.marginPercent}% Margin
                </p>
              </div>
            </div>

            {/* Right: Insight */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="text-emerald-600" size={20} />
                <h4 className="font-bold text-slate-800">Insight AI</h4>
              </div>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Margin kotor Anda (44.7%) di atas rata-rata industri F&B sejenis
                (35-40%). Pertahankan efisiensi bahan baku. Namun, biaya
                produksi sedikit meningkat minggu ini.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                Lihat Detail Biaya Produksi
              </Button>
            </div>
          </div>
        </div>

        {/* Cashflow Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            Tren Arus Kas Mingguan
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => [`Rp ${value}k`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Pemasukan"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Pengeluaran"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#colorExpense)"
                />
                <Legend verticalAlign="top" height={36} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
