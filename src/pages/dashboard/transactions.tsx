import { Button } from "../../components/Button";
import { DashboardLayout } from "@/src/components/Dashboard";
import { HPPData, Transaction } from "@/types";
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
  Save,
} from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "../../lib/format-currency";

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

export default function DashboardTransactionPage() {
  const [showImportModal, setShowImportModal] = useState(false);

  // Transaction Filtering
  const [txSearch, setTxSearch] = useState("");

  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);

  const handleImport = () => {
    setShowImportModal(false);
    alert(
      "Simulasi: Data Excel berhasil diimpor! 15 transaksi baru ditambahkan."
    );
    // In real app, parse CSV here
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Riwayat Transaksi
            </h2>
            <p className="text-slate-500 text-sm">
              Integrasi aktif: BCA, GoPay, Moka POS
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowImportModal(true)}
            >
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
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
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
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Sumber
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Jumlah
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions
                  .filter(
                    (t) =>
                      t.desc.toLowerCase().includes(txSearch.toLowerCase()) ||
                      t.amount.toString().includes(txSearch)
                  )
                  .map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-800">
                        {tx.desc}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          {tx.source === "Bank" && (
                            <CreditCard size={14} className="text-blue-600" />
                          )}
                          {tx.source === "E-Wallet" && (
                            <Wallet size={14} className="text-purple-600" />
                          )}
                          {tx.source === "POS" && (
                            <Store size={14} className="text-orange-600" />
                          )}
                          {tx.source === "Cash" && (
                            <Receipt size={14} className="text-emerald-600" />
                          )}
                          {tx.source === "Import" && (
                            <FileSpreadsheet
                              size={14}
                              className="text-slate-600"
                            />
                          )}
                          {tx.source}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 whitespace-nowrap">
                          {tx.category}
                        </span>
                      </td>
                      <td
                        className={`p-4 text-sm font-bold text-right whitespace-nowrap ${
                          tx.type === "in"
                            ? "text-emerald-600"
                            : "text-slate-800"
                        }`}
                      >
                        {tx.type === "in" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="p-4 text-center">
                        {tx.status === "completed" ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 size={14} />
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Import Transaksi
            </h3>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer mb-6">
              <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-medium">
                Klik untuk upload file Excel / CSV
              </p>
              <p className="text-xs text-slate-400 mt-1">Maksimal 5MB</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 justify-center"
                onClick={() => setShowImportModal(false)}
              >
                Batal
              </Button>
              <Button className="flex-1 justify-center" onClick={handleImport}>
                Upload & Proses
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
