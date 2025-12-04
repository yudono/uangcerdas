import { DashboardLayout } from "@/src/components/Dashboard";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search,
  Receipt,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/src/components/Button";
import { formatCurrency } from "@/src/lib/format-currency";

interface Nota {
  id: string;
  date: string;
  desc: string;
  amount: number;
  status: "completed" | "pending";
}

const fetchNotas = async (): Promise<Nota[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "NT-001",
          date: "25 Okt 2023, 11:00",
          desc: "Pembelian Bahan Baku Kopi",
          amount: 1500000,
          status: "completed",
        },
        {
          id: "NT-002",
          date: "25 Okt 2023, 10:00",
          desc: "Pembayaran Listrik Bulan Okt",
          amount: 300000,
          status: "pending",
        },
        {
          id: "NT-003",
          date: "24 Okt 2023, 15:30",
          desc: "Pembelian Perlengkapan Kebersihan",
          amount: 150000,
          status: "completed",
        },
      ]);
    }, 500);
  });
};

export default function NotaPage() {
  const queryClient = useQueryClient();
  const [showImportModal, setShowImportModal] = useState(false);

  const { data: notas, isLoading: isLoadingNotas } = useQuery<Nota[]>({
    queryKey: ["notas"],
    queryFn: fetchNotas,
  });

  const searchSchema = z.object({
    search: z.string().optional(),
  });

  type SearchFormInputs = z.infer<typeof searchSchema>;

  const { register: registerSearch, watch } = useForm<SearchFormInputs>({
    resolver: zodResolver(searchSchema),
    defaultValues: { search: "" },
  });

  const notaSearch = watch("search");

  const importSchema = z
    .object({
      file: z.any().optional(),
      images: z.any().optional(),
    })
    .refine((data) => data.file || (data.images && data.images.length > 0), {
      message: "Please select a file or upload images to import.",
      path: ["file"],
    });

  type ImportFormInputs = z.infer<typeof importSchema>;

  const {
    register: registerImport,
    handleSubmit: handleSubmitImport,
    reset: resetImport,
    formState: { errors: importErrors },
  } = useForm<ImportFormInputs>({
    resolver: zodResolver(importSchema),
  });

  const importMutation = useMutation({
    mutationFn: async (data: ImportFormInputs) => {
      const formData = new FormData();
      if (data.file) {
        formData.append("file", data.file[0]);
      }
      if (data.images) {
        for (let i = 0; i < data.images.length; i++) {
          formData.append("images", data.images[i]);
        }
      }
      // Simulate API call
      return new Promise<Nota[]>((resolve) => {
        setTimeout(() => {
          console.log("Importing data:", formData);
          const newNota: Nota = {
            id: `NT-${Math.floor(Math.random() * 1000)}`,
            date: new Date().toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            desc: "Imported Nota",
            amount: Math.floor(Math.random() * 1000000),
            status: "completed",
          };
          resolve([newNota]);
        }, 1500);
      });
    },
    onSuccess: (newNotas) => {
      queryClient.setQueryData<Nota[]>(["notas"], (old) => [
        ...(old || []),
        ...newNotas,
      ]);
      setShowImportModal(false);
      resetImport();
      alert(`Simulasi: ${newNotas.length} nota berhasil diimpor!`);
    },
    onError: (error) => {
      alert(`Gagal mengimpor nota: ${error.message}`);
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Halaman Nota</h2>
            <p className="text-slate-500 text-sm">
              Kelola dan catat semua nota pengeluaran Anda di sini.
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
              placeholder="Cari deskripsi atau nominal..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              {...registerSearch("search")}
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
              <option>Semua Status</option>
              <option>Completed</option>
              <option>Pending</option>
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
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Jumlah
                  </th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(notas || [])
                  .filter(
                    (n) =>
                      n.desc.toLowerCase().includes(notaSearch.toLowerCase()) ||
                      n.amount.toString().includes(notaSearch)
                  )
                  .map((nota) => (
                    <tr
                      key={nota.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                        {nota.date}
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-800">
                        {nota.desc}
                      </td>
                      <td className="p-4 text-sm font-bold text-right whitespace-nowrap text-slate-800">
                        {formatCurrency(nota.amount)}
                      </td>
                      <td className="p-4 text-center">
                        {nota.status === "completed" ? (
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
              Import Nota
            </h3>
            <form
              onSubmit={handleSubmitImport((data) =>
                importMutation.mutate(data)
              )}
            >
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer mb-6">
                <input
                  type="file"
                  className="hidden"
                  id="bulk-upload-nota"
                  {...registerImport("file")}
                />
                <label htmlFor="bulk-upload-nota" className="cursor-pointer">
                  <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">
                    Klik untuk upload file Excel / CSV
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Maksimal 5MB</p>
                </label>
              </div>
              {importErrors.file && (
                <p className="text-red-500 text-sm text-center mb-4">
                  {(importErrors.file as any).message}
                </p>
              )}

              <div className="text-center text-slate-400 mb-6">ATAU</div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer mb-6">
                <input
                  type="file"
                  className="hidden"
                  id="ocr-upload-nota"
                  accept="image/*"
                  multiple
                  {...registerImport("images")}
                />
                <label htmlFor="ocr-upload-nota" className="cursor-pointer">
                  <Upload
                    size={16}
                    className="w-12 h-12 text-slate-400 mx-auto mb-2"
                  />
                  <p className="text-sm text-slate-600 font-medium">
                    Klik untuk upload gambar nota (multiple)
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Maksimal 5MB per gambar
                  </p>
                </label>
              </div>
              {importErrors.images?.message && (
                <p className="text-red-500 text-sm text-center mb-4">
                  {importErrors.images?.message as any}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 justify-center"
                  onClick={() => setShowImportModal(false)}
                  type="button"
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 justify-center"
                  type="submit"
                  disabled={importMutation.isPending}
                >
                  {importMutation.isPending
                    ? "Mengunggah..."
                    : "Upload & Proses"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
