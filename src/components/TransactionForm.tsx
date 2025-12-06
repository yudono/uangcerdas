import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './Button';
import { Transaction } from '@/types';
import { X } from 'lucide-react';

const transactionSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  desc: z.string().min(1, "Deskripsi wajib diisi"),
  amount: z.number().min(1, "Jumlah harus lebih dari 0"),
  type: z.enum(['in', 'out']),
  category: z.string().min(1, "Kategori wajib diisi"),
  source: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  initialData?: Transaction;
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TransactionForm({ initialData, onSubmit, onCancel, isLoading }: TransactionFormProps) {
  // Helper to format date for input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    // Assuming dateString is ISO or parsable
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0]; // Fallback
    return date.toISOString().split('T')[0];
  };

  const { register, handleSubmit, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData ? {
      date: formatDateForInput(initialData.date),
      desc: initialData.desc,
      amount: initialData.amount,
      type: initialData.type,
      category: initialData.category,
      source: initialData.source,
    } : {
      type: 'out',
      date: new Date().toISOString().split('T')[0],
      source: 'Manual',
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
            <input
              type="text"
              {...register('desc')}
              placeholder="Contoh: Beli Kopi"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.desc && <p className="text-red-500 text-xs mt-1">{errors.desc.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah (Rp)</label>
            <input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="in">Pemasukan (+)</option>
                <option value="out">Pengeluaran (-)</option>
              </select>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <input
                type="text"
                {...register('category')}
                placeholder="Contoh: Makanan"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
               {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
          </div>
          
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sumber</label>
              <select
                {...register('source')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Manual">Manual</option>
                <option value="Bank">Bank</option>
                <option value="E-Wallet">E-Wallet</option>
                <option value="POS">POS</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 justify-center"
              onClick={onCancel}
              type="button"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              className="flex-1 justify-center"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
