import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/src/components/Dashboard";
import React, { useState } from "react";
import { Button } from "@/src/components/Button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

const profileSchema = z.object({
  profileName: z.string().min(1, "Nama lengkap tidak boleh kosong"),
  profileEmail: z.string().email("Format email tidak valid"),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

const regionalSchema = z.object({
  currency: z.string().min(1, "Mata uang tidak boleh kosong"),
  timezone: z.string().min(1, "Zona waktu tidak boleh kosong"),
});

type RegionalFormInputs = z.infer<typeof regionalSchema>;

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Kata sandi saat ini tidak boleh kosong"),
    newPassword: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
    confirmNewPassword: z
      .string()
      .min(1, "Konfirmasi kata sandi baru tidak boleh kosong"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Kata sandi baru dan konfirmasi tidak cocok",
    path: ["confirmNewPassword"],
  });

type PasswordFormInputs = z.infer<typeof passwordSchema>;

export default function DashboardSettingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      profileName: "John Doe",
      profileEmail: "john.doe@example.com",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormInputs) => {
      // Simulate API call
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log("Updating profile:", data);
          resolve();
        }, 1000);
      });
    },
    onSuccess: () => {
      alert("Profil berhasil diperbarui!");
    },
    onError: (error) => {
      alert(`Gagal memperbarui profil: ${error.message}`);
    },
  });

  // Regional Form
  const {
    register: registerRegional,
    handleSubmit: handleSubmitRegional,
    formState: { errors: regionalErrors },
  } = useForm<RegionalFormInputs>({
    resolver: zodResolver(regionalSchema),
    defaultValues: {
      currency: "IDR",
      timezone: "Asia/Jakarta",
    },
  });

  const updateRegionalMutation = useMutation({
    mutationFn: async (data: RegionalFormInputs) => {
      // Simulate API call
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log("Updating regional settings:", data);
          resolve();
        }, 1000);
      });
    },
    onSuccess: () => {
      alert("Pengaturan regional berhasil diperbarui!");
    },
    onError: (error) => {
      alert(`Gagal memperbarui pengaturan regional: ${error.message}`);
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormInputs>({
    resolver: zodResolver(passwordSchema),
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormInputs) => {
      // Simulate API call
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          console.log("Changing password:", data);
          if (data.currentPassword === "password123") {
            // Dummy check
            resolve();
          } else {
            reject(new Error("Kata sandi saat ini salah"));
          }
        }, 1000);
      });
    },
    onSuccess: () => {
      alert("Kata sandi berhasil diubah!");
      resetPassword();
    },
    onError: (error) => {
      alert(`Gagal mengubah kata sandi: ${error.message}`);
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <h2 className="text-2xl font-bold text-slate-800">Pengaturan Akun</h2>
        <p className="text-slate-500">
          Kelola pengaturan akun Anda, termasuk perubahan kata sandi.
        </p>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Edit Profil</h3>
          <form
            onSubmit={handleSubmitProfile((data) =>
              updateProfileMutation.mutate(data)
            )}
            className="space-y-4 max-w-md"
          >
            <div>
              <label
                htmlFor="profile-name"
                className="block text-sm font-medium text-slate-700"
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                id="profile-name"
                className="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                {...registerProfile("profileName")}
              />
              {profileErrors.profileName && (
                <p className="text-red-500 text-xs mt-1">
                  {profileErrors.profileName.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="profile-email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                type="email"
                id="profile-email"
                className="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                {...registerProfile("profileEmail")}
              />
              {profileErrors.profileEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {profileErrors.profileEmail.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending
                ? "Menyimpan..."
                : "Simpan Perubahan Profil"}
            </Button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            Pengaturan Regional
          </h3>
          <form
            onSubmit={handleSubmitRegional((data) =>
              updateRegionalMutation.mutate(data)
            )}
            className="space-y-4 max-w-md"
          >
            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-slate-700"
              >
                Mata Uang
              </label>
              <select
                id="currency"
                className="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                {...registerRegional("currency")}
              >
                <option value="IDR">IDR - Rupiah Indonesia</option>
                <option value="USD">USD - Dolar Amerika Serikat</option>
                <option value="EUR">EUR - Euro</option>
              </select>
              {regionalErrors.currency && (
                <p className="text-red-500 text-xs mt-1">
                  {regionalErrors.currency.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="timezone"
                className="block text-sm font-medium text-slate-700"
              >
                Zona Waktu
              </label>
              <select
                id="timezone"
                className="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                {...registerRegional("timezone")}
              >
                <option value="Asia/Jakarta">Asia/Jakarta</option>
                <option value="Asia/Singapore">Asia/Singapore</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New York</option>
              </select>
              {regionalErrors.timezone && (
                <p className="text-red-500 text-xs mt-1">
                  {regionalErrors.timezone.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={updateRegionalMutation.isPending}
            >
              {updateRegionalMutation.isPending
                ? "Menyimpan..."
                : "Simpan Pengaturan Regional"}
            </Button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-4">
            Ubah Kata Sandi
          </h3>
          <form
            onSubmit={handleSubmitPassword((data) =>
              changePasswordMutation.mutate(data)
            )}
            className="space-y-4 max-w-md"
          >
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-slate-700"
              >
                Kata Sandi Saat Ini
              </label>
              <input
                type="password"
                id="current-password"
                className="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                {...registerPassword("currentPassword")}
              />
              {passwordErrors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-slate-700"
              >
                Kata Sandi Baru
              </label>
              <input
                type="password"
                id="new-password"
                className="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                {...registerPassword("newPassword")}
              />
              {passwordErrors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirm-new-password"
                className="block text-sm font-medium text-slate-700"
              >
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                id="confirm-new-password"
                className="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                {...registerPassword("confirmNewPassword")}
              />
              {passwordErrors.confirmNewPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {passwordErrors.confirmNewPassword.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending
                ? "Mengubah..."
                : "Ubah Kata Sandi"}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
