import { DashboardLayout } from "@/src/components/Dashboard";
import { Button } from "@/src/components/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Package, Edit2, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatCurrency } from "@/src/lib/format-currency";

// Schema for Product Form
const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  unit: z.string().min(1, "Satuan wajib diisi"),
});

type ProductFormInputs = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
}

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      unit: "pcs",
      stock: 0,
      name: "",
      price: 0,
    },
  });

  // Fetch Products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: ProductFormInputs) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormInputs & { id: string }) => {
      const res = await fetch(`/api/products/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setValue("name", product.name);
      setValue("price", product.price);
      setValue("stock", product.stock);
      setValue("unit", product.unit);
    } else {
      setEditingProduct(null);
      reset({ unit: "pcs", stock: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset();
  };

  const onSubmit = (data: ProductFormInputs) => {
    if (editingProduct) {
      updateMutation.mutate({ ...data, id: editingProduct.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Produk & Stok</h2>
            <p className="text-slate-500 text-sm">
              Kelola katalog produk dan inventaris Anda.
            </p>
          </div>
          <Button onClick={() => openModal()} className="flex items-center gap-2">
            <Plus size={18} /> Tambah Produk
          </Button>
        </div>

        {/* Search & List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <Package size={32} className="opacity-20" />
                        <p>Belum ada produk.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock <= 5 
                            ? "bg-red-100 text-red-800" 
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {product.stock} {product.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(product)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Yakin ingin menghapus produk ini?")) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    {...register("price")}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    {...register("stock")}
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Satuan (Unit)
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  {...register("unit")}
                >
                  <option value="pcs">Pcs</option>
                  <option value="kg">Kg</option>
                  <option value="box">Box</option>
                  <option value="liter">Liter</option>
                  <option value="meter">Meter</option>
                  <option value="paket">Paket</option>
                </select>
                {errors.unit && (
                  <p className="text-red-500 text-xs mt-1">{errors.unit.message}</p>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Menyimpan..."
                    : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
