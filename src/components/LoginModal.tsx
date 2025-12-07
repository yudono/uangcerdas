import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { X, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./Button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const loginStep1Schema = z.object({
  contact: z.string().min(1, "Nomor WhatsApp / Email tidak boleh kosong"),
  businessName: z.string().min(1, "Nama Bisnis tidak boleh kosong"),
});

type LoginStep1Inputs = z.infer<typeof loginStep1Schema>;

const otpSchema = z.object({
  otp: z.string().length(4, "Kode OTP harus 4 digit"),
});

type OtpInputs = z.infer<typeof otpSchema>;

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginStep1Inputs>({
    resolver: zodResolver(loginStep1Schema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
    reset: resetOtp,
  } = useForm<OtpInputs>({
    resolver: zodResolver(otpSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginStep1Inputs) => {
      // Simulate API call for step 1
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log("Login Step 1:", data);
          resolve();
        }, 1000);
      });
    },
    onSuccess: () => {
      setStep(2);
    },
    onError: (error) => {
      alert(`Login gagal: ${error.message}`);
    },
  });

  const otpMutation = useMutation({
    mutationFn: async (data: OtpInputs) => {
      // Simulate API call for step 2
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log("OTP Verification:", data);
          resolve();
        }, 1500);
      });
    },
    onSuccess: () => {
      onLogin();
      setStep(1); // Reset for next time
      reset();
      resetOtp();
    },
    onError: (error) => {
      alert(`Verifikasi OTP gagal: ${error.message}`);
    },
  });

  const isLoading = loginMutation.isPending || otpMutation.isPending;

  if (!isOpen) return null;

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
            <span className="text-lg font-bold text-slate-800">SmartKas</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {step === 1 ? "Selamat Datang" : "Verifikasi Keamanan"}
          </h2>
          <p className="text-slate-600 mb-6">
            {step === 1
              ? "Masuk untuk memantau kesehatan bisnis Anda."
              : "Kami mengirimkan kode OTP ke WhatsApp Anda."}
          </p>

          <form
            onSubmit={
              step === 1
                ? handleSubmit((data) => loginMutation.mutate(data))
                : handleSubmitOtp((data) => otpMutation.mutate(data))
            }
            className="space-y-4"
          >
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nomor WhatsApp / Email
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Contoh: 08123456789"
                    {...register("contact")}
                    autoFocus
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.contact.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Bisnis
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Contoh: Kopi Senja"
                    {...register("businessName")}
                  />
                  {errors.businessName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.businessName.message}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kode OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    className="w-full px-2 py-3 text-center text-xl font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="••••"
                    {...registerOtp("otp")}
                    autoFocus
                  />
                </div>
                {otpErrors.otp && (
                  <p className="text-red-500 text-sm mt-1">
                    {otpErrors.otp.message}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Gunakan kode bebas untuk demo ini.
                </p>
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
                  {step === 1 ? "Lanjut" : "Masuk Dashboard"}
                  {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                </>
              )}
            </Button>
          </form>

          {step === 1 && (
            <p className="text-xs text-center text-slate-400 mt-6">
              Dengan masuk, Anda menyetujui Syarat & Ketentuan SmartKas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
