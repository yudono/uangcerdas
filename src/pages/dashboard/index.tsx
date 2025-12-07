
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "../../components/Button";
import { DashboardLayout } from "@/src/components/Dashboard";
import { Transaction } from "@/types";
import { useCurrency } from "@/src/hooks/useCurrency";
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
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
// import { formatCurrency } from "../../lib/format-currency"; // Removed in favor of hook
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ChartData {
  name: string;
  income: number;
  expense: number;
}

const fetchChartData = async (): Promise<ChartData[]> => {
  const res = await fetch('/api/dashboard/chart');
  if (!res.ok) throw new Error('Failed to fetch chart data');
  return res.json();
};

interface DashboardMetrics {
  totalIncome: number;
  totalExpense: number;
  netCash: number;
}

// Real Metrics Data
const fetchMetrics = async (): Promise<DashboardMetrics> => {
  const res = await fetch('/api/dashboard/metrics');
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
};

const fetchTransactions = async (): Promise<Transaction[]> => {
  const res = await fetch('/api/transactions');
  if (!res.ok) throw new Error('Failed to fetch transactions');
  const data = await res.json();
  return data.slice(0, 5); // Show top 5
};

// Insight Data
const fetchInsight = async (): Promise<{ insight: string }> => {
  const res = await fetch('/api/dashboard/insight');
  if (!res.ok) throw new Error('Failed to fetch insight');
  return res.json();
};

const fetchAnomalies = async (): Promise<any[]> => {
  const res = await fetch('/api/cron/detect-anomalies'); // Or /api/alerts? Using detect-anomalies as per usage
  if (!res.ok) throw new Error('Failed to fetch anomalies');
  return res.json();
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: fetchTransactions
  });

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery<DashboardMetrics>({
    queryKey: ["dashboardMetrics"],
    queryFn: fetchMetrics,
  });

  const { data: insightData, isLoading: isLoadingInsight } = useQuery({
    queryKey: ["dashboardInsight"],
    queryFn: fetchInsight,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: chartData, isLoading: isLoadingChart } = useQuery<ChartData[]>({
    queryKey: ["dashboardChart"],
    queryFn: fetchChartData,
  });

  const { data: anomalies } = useQuery<any[]>({ // Fetch anomalies
    queryKey: ["anomalies"],
    queryFn: fetchAnomalies,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const syncDataMutation = useMutation({
    mutationFn: async () => {
      // Mock sync for now, or could re-fetch
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboardInsight"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboardChart"] });
      await queryClient.invalidateQueries({ queryKey: ["anomalies"] }); // Invalidate anomalies too
    },
    onSuccess: () => {
      // alert("Data Synced!");
    },
  });

  const { formatCurrency } = useCurrency();



  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        {/* Welcome Section */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Halo, {session?.user?.name || "Juragan"}! 👋
            </h2>
            <p className="text-slate-500">
              Berikut ringkasan keuangan bisnismu hari ini.
            </p>
          </div>
          <div className="hidden md:block">
            <p className="text-sm text-slate-400 text-right">Saldo Saat Ini</p>
            <p className="text-2xl font-bold text-emerald-600">
              {metrics ? formatCurrency(metrics.netCash) : "..."}
            </p>
          </div>
        </div>

        {/* Anomaly Alert Banner */}
        {anomalies && anomalies.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-800">
                Terdeteksi {anomalies.length} Anomali Baru
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Sistem mendeteksi pola transaksi tidak biasa. Segera periksa untuk mencegah kebocoran.
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/alerts')}
              className="px-4 py-2 bg-white border border-amber-200 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-50 transition-colors"
            >
              Periksa
            </button>
          </div>
        )}



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
              className="hidden md:flex"
            >
              <FileSpreadsheet size={16} className="mr-2" /> Laporan
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => syncDataMutation.mutate()}
              className="flex items-center gap-2"
              disabled={syncDataMutation.isPending}
            >
              <RefreshCw
                size={16}
                className={syncDataMutation.isPending ? "animate-spin" : ""}
              />
              {syncDataMutation.isPending ? "Sinkronisasi..." : "Sync Data"}
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
              {metrics ? formatCurrency(metrics.totalIncome) : "..."}
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
              {metrics
                ? formatCurrency(metrics.totalExpense)
                : "..."}
            </h3>
            <div className="flex items-center text-xs font-semibold text-red-600 bg-red-50 w-fit px-2 py-1 rounded-full">
              <TrendingDown size={14} className="mr-1" /> +5% vs bulan lalu
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
            <p className="text-sm font-medium text-emerald-100 mb-2">
              Saldo Bersih (Net Cash)
            </p>
            <h3 className="text-3xl font-bold mb-2">
              {metrics ? formatCurrency(metrics.netCash) : "..."}
            </h3>
            <p className="text-xs text-emerald-100 opacity-80">
              Aman untuk operasional 2 bulan.
            </p>
          </div>
        </div>

        {/* Cashflow Analysis Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Analisis Arus Kas
              </h3>
              <p className="text-sm text-slate-500">
                Pemasukan vs Pengeluaran
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
                <span className="text-slate-600">Total Pemasukan</span>
                <span className="text-slate-900">
                  {metrics ? formatCurrency(metrics.totalIncome) : "..."}
                </span>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-4">
                <div
                  className="bg-emerald-500 h-4 rounded-full"
                  style={{ width: '100%' }}
                ></div>
              </div>

              <div className="pl-4 border-l-2 border-slate-200 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Pengeluaran Operasional</span>
                    <span className="text-slate-700 font-semibold">
                      {metrics
                        ? formatCurrency(metrics.totalExpense * 0.7) // Mock breakdown
                        : "..."}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-2"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Pengeluaran Lainnya</span>
                    <span className="text-slate-700 font-semibold">
                      {metrics ? formatCurrency(metrics.totalExpense * 0.3) : "..."}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-400 h-2"
                      style={{ width: "30%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-2">

                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-emerald-700">
                    Sisa Kas (Net)
                  </span>
                  <span className="text-emerald-700">
                    {metrics ? formatCurrency(metrics.netCash) : "..."}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-4 rounded-full"
                    style={{ width: metrics ? `${(metrics.netCash / metrics.totalIncome) * 100}%` : '0%' }}
                  ></div>
                </div>
                <p className="text-right text-xs text-emerald-600 mt-1 font-bold">
                  {metrics ? `${((metrics.netCash / metrics.totalIncome) * 100).toFixed(1)}% Ratio` : "..."}
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
                {isLoadingInsight ? (
                  <span className="animate-pulse">Sedang menganalisis keuangan Anda...</span>
                ) : (
                  insightData?.insight || "Tidak ada insight saat ini."
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  Lihat Detail
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-slate-600 hover:bg-slate-100"
                  onClick={() => fetch('/api/cron/detect-anomalies')}
                >
                  Cek Anomali
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Cashflow Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            Tren Arus Kas Mingguan
          </h3>
          <div className="h-64 w-full">
            {isLoadingChart ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                Memuat data grafik...
              </div>
            ) : (
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
                  formatter={(value: number) => [formatCurrency(value), ""]}
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
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
