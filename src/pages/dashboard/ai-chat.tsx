import { DashboardLayout } from "@/src/components/Dashboard";
import React, { useState } from "react";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

interface Message {
  id: number;
  sender: "user" | "ai";
  text: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Halo! Saya AI Analisis Keuangan Anda. Ada yang bisa saya bantu terkait transaksi Anda?",
    },
  ]);

  const chatSchema = z.object({
    message: z.string().min(1, "Pesan tidak boleh kosong"),
  });

  type ChatFormInputs = z.infer<typeof chatSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChatFormInputs>({
    resolver: zodResolver(chatSchema),
  });

  const sendChatMessage = async (data: ChatFormInputs) => {
    // Simulate API call
    return new Promise<Message>((resolve) => {
      setTimeout(() => {
        const newUserMessage: Message = {
          id: messages.length + 1,
          sender: "user",
          text: data.message,
        };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);

        let aiResponseText = `Simulasi respons AI untuk: "${data.message}".`;

        if (data.message.toLowerCase().includes("anomali")) {
          aiResponseText =
            "Berdasarkan data transaksi Anda, saya mendeteksi adanya pengeluaran yang tidak biasa pada tanggal 22 Oktober 2023 sebesar Rp 1.200.000 untuk servis mesin espresso. Apakah ini sesuai?";
        } else if (data.message.toLowerCase().includes("tertinggi")) {
          aiResponseText =
            "Transaksi pengeluaran tertinggi Anda bulan ini adalah Rp 1.200.000 untuk servis mesin espresso pada 22 Oktober 2023.";
        } else if (data.message.toLowerCase().includes("pendapatan")) {
          aiResponseText =
            "Total pendapatan Anda bulan ini adalah Rp 3.310.000. Transaksi terbesar berasal dari settlement QRIS.";
        } else if (data.message.toLowerCase().includes("terendah")) {
          aiResponseText =
            "Transaksi pengeluaran terendah Anda adalah Rp 200.000 untuk token listrik pada 23 Oktober 2023.";
        }

        const aiResponse: Message = {
          id: messages.length + 2,
          sender: "ai",
          text: aiResponseText,
        };
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
        resolve(aiResponse);
      }, 1000);
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = (data: ChatFormInputs) => {
    mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <h2 className="text-2xl font-bold text-slate-800">
          AI Chat Analisis Keuangan
        </h2>
        <p className="text-slate-500">
          Ajukan pertanyaan tentang data transaksi Anda untuk menemukan anomali
          dan insight.
        </p>

        <div className="flex flex-col h-[60vh] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-emerald-500 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-800 rounded-bl-none"
                  }
                  `}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="border-t border-slate-100 p-4 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanyakan sesuatu tentang transaksi Anda..."
              className="flex-1 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              {...register("message")}
            />
            <button
              type="submit"
              disabled={isPending}
              className="p-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
