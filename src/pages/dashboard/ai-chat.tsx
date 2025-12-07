import { DashboardLayout } from "@/src/components/Dashboard";
import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Mic, Loader2, User, Bot, Paperclip, X } from "lucide-react";
import { Button } from "@/src/components/Button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Halo! Saya SmartKas, asisten keuangan Anda. Ada yang bisa saya bantu? Bisa kirim foto struk atau voice note juga lho!",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/chat/history');
        if (res.ok) {
          const data = await res.json();
          if (data.history && data.history.length > 0) {
            const historyMessages = data.history.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(Number(msg.timestamp)),
            }));
            // Prepend history, keep welcome message if history is empty? 
            // Or just replace. Let's append history after welcome message or replace it.
            // If we have history, maybe we don't need the generic welcome message, 
            // or we put the welcome message first.
            setMessages(historyMessages);
          }
        }
      } catch (error) {
        console.error("Failed to fetch chat history", error);
      }
    };

    fetchHistory();
  }, []);

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || isSending) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      image: selectedImage || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText("");
    setSelectedImage(null);
    setIsSending(true);

    try {
      // Prepare context for API (last 10 messages)
      const apiMessages = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));
      apiMessages.push({ role: "user", content: newUserMsg.content });

      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          image_url: newUserMsg.image
        }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const data = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Maaf, terjadi kesalahan saat memproses pesan Anda.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Stop mic
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
      alert("Izinkan akses mikrofon untuk menggunakan fitur ini.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const res = await fetch('/api/chat/stt', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("STT Failed");

      const data = await res.json();
      setInputText(prev => (prev ? prev + " " + data.text : data.text));

    } catch (error) {
      console.error(error);
      alert("Gagal mengubah suara ke teks.");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
        {/* Header */}
        <div className="bg-white p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">SmartKas AI</h3>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                  }`}
              >
                {msg.image && (
                  <img src={msg.image} alt="Upload" className="max-w-full rounded-lg mb-2 max-h-48 object-cover" />
                )}
                <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-2 text-right ${msg.role === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-sm border border-slate-100">
                <Loader2 size={20} className="animate-spin text-emerald-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 border-t border-slate-100">
          {/* Image Preview */}
          {selectedImage && (
            <div className="flex items-center gap-2 mb-2 bg-slate-50 p-2 rounded-lg w-fit border border-slate-200">
              <img src={selectedImage} alt="Preview" className="h-10 w-10 object-cover rounded" />
              <span className="text-xs text-slate-500 truncate max-w-[150px]">Gambar terpilih</span>
              <button onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-red-500">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
              title="Kirim Gambar"
            >
              <Paperclip size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            <div className="flex-1 relative flex items-center gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isRecording ? "Mendengarkan..." : isTranscribing ? "Mengubah suara ke teks..." : "Ketik pesan..."}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none max-h-32 min-h-[48px] text-sm"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              {/* Mic Button inside Input */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`absolute right-2 bottom-2 p-1.5 rounded-full transition-all ${isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : isTranscribing
                      ? "bg-slate-200 text-slate-400"
                      : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
              >
                {isTranscribing ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
              </button>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={(!inputText.trim() && !selectedImage) || isSending || isRecording || isTranscribing}
              className="rounded-full w-12 h-12 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 !p-0 flex-shrink-0"
            >
              <Send size={18} className="ml-0.5 text-white fill-white stroke-white" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
