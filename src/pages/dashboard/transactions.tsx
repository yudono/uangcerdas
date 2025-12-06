import { Button } from "../../components/Button";
import { DashboardLayout } from "@/src/components/Dashboard";
import { Transaction } from "@/types";
import {
  Search,
  Upload,
  Receipt,
  CreditCard,
  Wallet,
  Store,
  FileSpreadsheet,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "../../lib/format-currency";
import { Table, Column } from "@/src/components/Table";
import { TransactionForm } from "@/src/components/TransactionForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function DashboardTransactionPage() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

  // Transaction Filtering
  const [txSearch, setTxSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("Semua Tanggal");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [sourceFilter, setSourceFilter] = useState("Semua Sumber");

  const queryClient = useQueryClient();

  // Fetch Transactions
  const { data: transactions = [], isLoading, isError } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('/api/transactions');
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return res.json();
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newTx: any) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx),
      });
      if (!res.ok) throw new Error('Failed to create transaction');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowFormModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedTx: any) => {
      const res = await fetch(`/api/transactions/${editingTransaction?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTx),
      });
      if (!res.ok) throw new Error('Failed to update transaction');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowFormModal(false);
      setEditingTransaction(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete transaction');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const handleImport = () => {
    setShowImportModal(false);
    alert(
      "Simulasi: Data Excel berhasil diimpor! 15 transaksi baru ditambahkan."
    );
  };

  const handleCreate = () => {
    setEditingTransaction(undefined);
    setShowFormModal(true);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setShowFormModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSubmit = (data: any) => {
    if (editingTransaction) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter Logic
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.desc.toLowerCase().includes(txSearch.toLowerCase()) ||
                          t.amount.toString().includes(txSearch);
    const matchesCategory = categoryFilter === "Semua Kategori" || t.category === categoryFilter;
    const matchesSource = sourceFilter === "Semua Sumber" || t.source === sourceFilter;
    // Date filter logic can be added here if needed (simplified for now)
    
    return matchesSearch && matchesCategory && matchesSource;
  });

  // Table Columns
  const columns: Column<Transaction>[] = [
    {
      header: "Tanggal",
      accessorKey: "date",
      cell: (tx) => (
        <span className="text-sm text-slate-600 whitespace-nowrap">
          {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: "Deskripsi",
      accessorKey: "desc",
      cell: (tx) => <span className="text-sm font-medium text-slate-800">{tx.desc}</span>,
    },
    {
      header: "Sumber",
      accessorKey: "source",
      cell: (tx) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          {tx.source === "Bank" && <CreditCard size={14} className="text-blue-600" />}
          {tx.source === "E-Wallet" && <Wallet size={14} className="text-purple-600" />}
          {tx.source === "POS" && <Store size={14} className="text-orange-600" />}
          {tx.source === "Cash" && <Receipt size={14} className="text-emerald-600" />}
          {tx.source === "Import" && <FileSpreadsheet size={14} className="text-slate-600" />}
          {tx.source}
        </div>
      ),
    },
    {
      header: "Kategori",
      accessorKey: "category",
      cell: (tx) => (
        <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 whitespace-nowrap">
          {tx.category}
        </span>
      ),
    },
    {
      header: "Jumlah",
      accessorKey: "amount",
      className: "text-right",
      cell: (tx) => (
        <span
          className={`text-sm font-bold whitespace-nowrap ${
            tx.type === "in" ? "text-emerald-600" : "text-slate-800"
          }`}
        >
          {tx.type === "in" ? "+" : "-"}
          {formatCurrency(tx.amount)}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      className: "text-center",
      cell: (tx) => (
        tx.status === "completed" ? (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={14} />
          </span>
        ) : (
          <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-medium">
            Pending
          </span>
        )
      ),
    },
    {
      header: "Aksi",
      className: "text-center",
      cell: (tx) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleEdit(tx)}
            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDelete(tx.id)}
            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

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
            <Button variant="primary" className="flex items-center gap-2" onClick={handleCreate}>
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
            <select
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:border-emerald-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option>Semua Tanggal</option>
              <option>Hari Ini</option>
              <option>Minggu Ini</option>
              <option>Bulan Ini</option>
            </select>
            <select
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:border-emerald-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>Semua Kategori</option>
              <option>Penjualan</option>
              <option>Bahan Baku</option>
              <option>Operasional</option>
            </select>
            <select
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:border-emerald-500"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option>Semua Sumber</option>
              <option>Bank</option>
              <option>E-Wallet</option>
              <option>POS</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : isError ? (
          <div className="text-center py-10 text-red-500">Error loading transactions</div>
        ) : (
          <Table
            columns={columns}
            data={filteredTransactions}
            keyExtractor={(tx) => tx.id}
          />
        )}
      </div>

      {/* Transaction Form Modal */}
      {showFormModal && (
        <TransactionForm
          initialData={editingTransaction}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowFormModal(false)}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

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
