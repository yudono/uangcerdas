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
} from "lucide-react";
import { useEffect, useState } from "react";
// import { formatCurrency } from "../../lib/format-currency"; // Removed in favor of hook
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/src/hooks/useCurrency";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function DashboardAlertPage() {
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const noteSchema = z.object({
    note: z.string().optional(),
  });

  type NoteFormInputs = z.infer<typeof noteSchema>;

  const fetchAlerts = async (): Promise<AIAlert[]> => {
    const res = await fetch('/api/alerts');
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  };

  const {
    data: alerts,
    isLoading,
    isError,
  } = useQuery<AIAlert[]>({ queryKey: ["alerts"], queryFn: fetchAlerts });

  const updateAlertStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "in_progress" | "resolved";
    }) => {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update alert status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const updateAlertNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNotes: note }),
      });

      if (!res.ok) throw new Error('Failed to update alert note');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NoteFormInputs>({
    resolver: zodResolver(noteSchema),
  });

  const [alertFilter, setAlertFilter] = useState<"all" | "new" | "history">(
    "new"
  );

  useEffect(() => {
    if (expandedAlert) {
      const alert = alerts?.find((a) => a.id === expandedAlert);
      if (alert) {
        setValue("note", alert.userNotes || "");
      }
    }
  }, [expandedAlert, alerts, setValue]);

  const activeAlerts =
    alerts?.filter((a) => ["new", "in_progress"].includes(a.status)) || [];
  const historyAlerts = alerts?.filter((a) => a.status === "resolved") || [];

  const listToShow = alertFilter === "history" ? historyAlerts : activeAlerts;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Financial Leak Detector
            </h2>
            <p className="text-slate-500">
              AI memantau anomali dan memberikan rekomendasi tindakan.
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setAlertFilter("new")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                alertFilter === "new"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Perlu Tindakan ({activeAlerts.length})
            </button>
            <button
              onClick={() => setAlertFilter("history")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                alertFilter === "history"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Riwayat ({historyAlerts.length})
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {listToShow.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <CheckCircle2
                size={48}
                className="mx-auto text-emerald-200 mb-4"
              />
              <h3 className="text-lg font-bold text-slate-700">
                Tidak ada alert
              </h3>
              <p className="text-slate-500">
                Cashflow bisnis Anda terlihat aman!
              </p>
            </div>
          )}

          {listToShow.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden ${
                alert.status === "resolved"
                  ? "border-slate-200 bg-slate-50/50"
                  : alert.severity === "high"
                  ? "border-red-200 shadow-sm"
                  : "border-slate-200 shadow-sm"
              }`}
            >
              {/* Alert Header */}
              <div
                className="p-5 cursor-pointer flex items-start gap-4 hover:bg-slate-50 transition-colors"
                onClick={() =>
                  setExpandedAlert(expandedAlert === alert.id ? null : alert.id)
                }
              >
                <div
                  className={`mt-1 p-2 rounded-lg flex-shrink-0 ${
                    alert.status === "resolved"
                      ? "bg-slate-200 text-slate-500"
                      : alert.severity === "high"
                      ? "bg-red-100 text-red-600"
                      : alert.severity === "medium"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {alert.status === "resolved" ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <AlertTriangle size={24} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-bold text-lg ${
                          alert.status === "resolved"
                            ? "text-slate-500"
                            : "text-slate-800"
                        }`}
                      >
                        {alert.title}
                      </h4>
                      {alert.status === "in_progress" && (
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Sedang Diproses
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">
                        {alert.date}
                      </span>
                      <div className="mt-2 text-sm font-bold text-slate-800">
                      Nilai Transaksi: {formatCurrency(alert.amount)}
                    </div>
                      {expandedAlert === alert.id ? (
                        <ChevronDown size={18} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={18} className="text-slate-400" />
                      )}
                    </div>
                  </div>
                  <p className="text-slate-600">{alert.description}</p>
                    {alert.amount && (
                    <p className="text-red-600 font-bold mt-1 text-sm">
                      {formatCurrency(alert.amount)}
                    </p>
                  )}
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
                        <h5 className="font-bold text-slate-800 mb-2">
                          Rekomendasi Cerdas AI
                        </h5>
                        <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                          {alert.recommendation}
                        </p>
                        {alert.impact && (
                          <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                            💡 {alert.impact}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Buttons */}
                    {alert.status !== "resolved" && (
                      <div className="mb-6">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                          Tindakan yang Disarankan
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {alert.suggestedActions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                updateAlertStatusMutation.mutate({
                                  id: alert.id,
                                  status: "in_progress",
                                })
                              }
                              disabled={updateAlertStatusMutation.isPending}
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
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Catatan Tindakan
                      </p>
                      <form
                        onSubmit={handleSubmit((data) =>
                          updateAlertNoteMutation.mutate({
                            id: alert.id,
                            note: data.note || "",
                          })
                        )}
                      >
                        <textarea
                          className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none mb-3"
                          placeholder="Tulis catatan hasil tindakan Anda di sini... (Contoh: Sudah telpon supplier, harga baru efektif minggu depan)"
                          rows={2}
                          {...register("note")}
                          disabled={
                            alert.status === "resolved" ||
                            updateAlertNoteMutation.isPending
                          }
                        ></textarea>

                        <div className="flex justify-end gap-3">
                          {alert.status !== "resolved" ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedAlert(null)}
                              >
                                Tutup
                              </Button>
                              <Button
                                size="sm"
                                type="submit"
                                onClick={() =>
                                  updateAlertStatusMutation.mutate({
                                    id: alert.id,
                                    status: "resolved",
                                  })
                                }
                                disabled={updateAlertStatusMutation.isPending}
                              >
                                <CheckCircle2 size={16} className="mr-2" />{" "}
                                Tandai Selesai
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-emerald-600 font-medium flex items-center">
                              <CheckCircle2 size={16} className="mr-2" />{" "}
                              Masalah Terselesaikan
                            </span>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
