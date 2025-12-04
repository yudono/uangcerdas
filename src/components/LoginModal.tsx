import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
      setStep(1); // Reset for next time
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-emerald-50 px-6 py-6 border-b border-emerald-100 flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">UangCerdas</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {step === 1 ? 'Selamat Datang' : 'Verifikasi Keamanan'}
          </h2>
          <p className="text-slate-600 mb-6">
            {step === 1 
              ? 'Masuk untuk memantau kesehatan bisnis Anda.' 
              : 'Kami mengirimkan kode OTP ke WhatsApp Anda.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nomor WhatsApp / Email</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Contoh: 08123456789"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Bisnis</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Contoh: Kopi Senja"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode OTP</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <input 
                      key={i}
                      type="text" 
                      maxLength={1}
                      className="w-full px-2 py-3 text-center text-xl font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="•"
                      required
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">Gunakan kode bebas untuk demo ini.</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full justify-center mt-4" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  {step === 1 ? 'Lanjut' : 'Masuk Dashboard'} 
                  {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                </>
              )}
            </Button>
          </form>

          {step === 1 && (
            <p className="text-xs text-center text-slate-400 mt-6">
              Dengan masuk, Anda menyetujui Syarat & Ketentuan UangCerdas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
