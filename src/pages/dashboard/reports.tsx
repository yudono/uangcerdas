import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "../../components/Button";
import { DashboardLayout } from "@/src/components/Dashboard";
import { AIAlert, HPPData, Transaction } from "@/types";
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
import { formatCurrency } from "../../lib/format-currency";
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

export default function DashboardAlertPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

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
            >
              <Download size={16} /> Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download size={16} /> PDF
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
                <h3 className="text-lg font-bold text-slate-800">
                  Prediksi Cashflow
                </h3>
                <p className="text-xs text-slate-500">
                  Estimasi AI untuk bulan depan
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Sep", val: 32000, color: "#94a3b8" },
                    { name: "Okt", val: 42500, color: "#10b981" },
                    {
                      name: "Nov (Est)",
                      val: 51000,
                      color: "#34d399",
                      isPrediction: true,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(val) => `${val / 1000}jt`}
                    fontSize={12}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    formatter={(val) => `Rp ${Number(val).toLocaleString()}`}
                  />
                  <Bar dataKey="val" radius={[6, 6, 0, 0]} barSize={60}>
                    {[0, 1, 2].map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 2
                            ? "url(#striped-pattern)"
                            : index === 1
                            ? "#10b981"
                            : "#cbd5e1"
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
            </div>
          </div>

          {/* AI Efficiency Impact */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <ShieldCheck size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Efisiensi AI Guardian
                </h3>
                <p className="text-xs text-slate-500">
                  Dampak tindakan Anda terhadap profit
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                <div>
                  <p className="text-sm text-emerald-800 font-medium">
                    Estimasi Penghematan Bulan Ini
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    Rp 1.450.000
                  </p>
                </div>
                <div className="h-10 w-10 bg-emerald-200 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-emerald-700" size={20} />
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">
                  Tindakan Berdampak Tinggi
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500 mt-0.5"
                    />
                    <span className="text-slate-600">
                      Nego harga supplier kopi (Hemat Rp 850k)
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500 mt-0.5"
                    />
                    <span className="text-slate-600">
                      Optimasi penggunaan listrik gudang (Hemat Rp 350k)
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500 mt-0.5"
                    />
                    <span className="text-slate-600">
                      Switch vendor packaging (Hemat Rp 250k)
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
