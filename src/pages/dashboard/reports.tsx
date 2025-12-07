import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "../../components/Button";
import { DashboardLayout } from "@/src/components/Dashboard";
import { AIAlert, Transaction } from "@/types";
import {
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  PlayCircle,
  Download,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
// import { formatCurrency } from "../../lib/format-currency"; // Removed in favor of hook
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCurrency } from "@/src/hooks/useCurrency";
import { z } from "zod";

interface CashflowData {
  name: string;
  val: number;
  color: string;
  isPrediction?: boolean;
}

const fetchCashflowPrediction = async (): Promise<CashflowData[]> => {
  const res = await fetch('/api/reports/cashflow');
  if (!res.ok) throw new Error('Failed to fetch report data');
  return res.json();
};

const fetchReportData = async () => {
  const res = await fetch('/api/dashboard/metrics');
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
};

export default function DashboardReportsPage() {
  const { formatCurrency } = useCurrency();
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: cashflowData, isLoading: isLoadingCashflow } = useQuery<
    CashflowData[]
  >({
    queryKey: ["cashflowPrediction"],
    queryFn: fetchCashflowPrediction,
  });

  const { data: reportData } = useQuery({
    queryKey: ["reportMetrics"],
    queryFn: fetchReportData,
  });

  const fetchAlerts = async (): Promise<AIAlert[]> => {
    const res = await fetch('/api/alerts');
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  };

  const { data: alerts, isLoading: isLoadingAlerts } = useQuery<AIAlert[]>({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  });

  const resolvedAlerts = alerts?.filter(a => a.status === 'resolved') || [];
  const resolvedSavings = resolvedAlerts.reduce((sum, a) => {
    return sum + (Number(a.amount) || 0);
  }, 0);

  const downloadReportMutation = useMutation({
    mutationFn: async (reportType: "excel" | "pdf") => {
      // Simulate API call for downloading report
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log(`Downloading ${reportType} report`);
          resolve();
        }, 1000);
      });
    },
    onSuccess: (reportType) => {
      alert(`Laporan ${reportType} berhasil diunduh!`);
    },
    onError: (error) => {
      alert(`Gagal mengunduh laporan: ${error.message}`);
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Laporan & Prediksi
            </h2>
            <p className="text-slate-500 text-sm">
              Analisis 360° performa bisnis Anda.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => downloadReportMutation.mutate("excel")}
              disabled={downloadReportMutation.isPending}
            >
              <Download size={16} />{" "}
              {downloadReportMutation.isPending ? "Mengunduh..." : "Excel"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => downloadReportMutation.mutate("pdf")}
              disabled={downloadReportMutation.isPending}
            >
              <Download size={16} />{" "}
              {downloadReportMutation.isPending ? "Mengunduh..." : "PDF"}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Prediction Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <TrendingUp size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(reportData?.netCash || 0)}
              </p>
                <p className="text-xs text-slate-500">
                  Estimasi AI untuk bulan depan
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              {isLoadingCashflow ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Memuat prediksi cashflow...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflowData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(val) => `${val / 1000}jt`}
                      fontSize={12}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Bar dataKey="val" radius={[6, 6, 0, 0]} barSize={60}>
                      {cashflowData?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.isPrediction
                              ? "url(#striped-pattern)"
                              : entry.color
                          }
                        />
                      ))}
                    </Bar>
                    <defs>
                      <pattern
                        id="striped-pattern"
                        patternUnits="userSpaceOnUse"
                        width="8"
                        height="8"
                        transform="rotate(45)"
                      >
                        <rect width="4" height="8" fill="#d1fae5" />
                      </pattern>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Efficiency Impact */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <ShieldCheck size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                {formatCurrency(reportData?.totalExpense || 0)}
              </p>
                <p className="text-xs text-slate-500">
                  Dampak tindakan Anda terhadap profit
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-emerald-800 font-medium">
                    Estimasi Penghematan (Resolved)
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(reportData?.totalIncome || 0)}
              </p>
                </div>
                <div className="h-10 w-10 bg-emerald-200 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-emerald-700" size={20} />
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">
                  Tindakan Berdampak Tinggi (Terbaru)
                </p>
                <ul className="space-y-3">
                  {resolvedAlerts.slice(0, 3).map((alert) => (
                    <li key={alert.id} className="flex items-start gap-3 text-sm">
                      <CheckCircle2
                        size={16}
                        className="text-emerald-500 mt-0.5"
                      />
                      <span className="text-slate-600">
                        {alert.title} ({alert.amount ? formatCurrency(alert.amount) : "N/A"})
                      </span>
                    </li>
                  ))}
                  {resolvedAlerts.length === 0 && (
                    <li className="text-sm text-slate-500 italic">
                      Belum ada anomali yang diselesaikan.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
