
import React, { ReactNode, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  BellRing,
  PieChart,
  Settings,
  LogOut,
  ShieldCheck,
  LucideIcon,
  Brain,
  ArrowRightLeft,
  MessageSquare,
  Package,
} from "lucide-react";
import { Button } from "./Button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

// Sidebar items configuration
const sidebarItems: SidebarItem[] = [
  {
    id: "overview",
    label: "Ringkasan",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "alerts",
    label: "Deteksi Anomali",
    icon: Brain,
    path: "/dashboard/alerts",
  },
  {
    id: "transactions",
    label: "Transaksi",
    icon: ArrowRightLeft,
    path: "/dashboard/transactions",
  },
  {
    id: "reports",
    label: "Laporan",
    icon: PieChart,
    path: "/dashboard/reports",
  },
  {
    id: "products",
    label: "Produk & Stok",
    icon: Package,
    path: "/dashboard/products",
  },
  {
    id: "ai-chat",
    label: "AI Chat",
    icon: MessageSquare,
    path: "/dashboard/ai-chat",
  },
];

const preferenceItems: SidebarItem[] = [
  {
    id: "settings",
    label: "Pengaturan",
    icon: Settings,
    path: "/dashboard/settings",
  },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <Link href="/dashboard">
             <img src="/logo-all.png" alt="SmartKas" className="h-10 w-auto" />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-x-hidden overflow-y-auto">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">
            Menu Utama
          </p>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                router.pathname === item.path
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}

          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-8">
            Preferensi
          </p>
          {preferenceItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                router.pathname === item.path
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>

        <div
          className="p-4 border-t border-slate-100 relative"
          ref={dropdownRef}
        >
          <div
            className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 cursor-pointer rounded-lg"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 shadow-sm">
              {session?.user?.name ? session.user.name.charAt(0) : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-slate-800 text-sm truncate">
                {session?.user?.name || "Pengguna"}
              </p>
              <p className="text-slate-500 text-xs truncate">
                {session?.user?.email || "Tidak ada email"}
              </p>
            </div>
          </div>

          {isProfileDropdownOpen && (
            <div className="absolute bottom-0 left-full mb-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-30">
              <div className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 cursor-pointer rounded-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 shadow-sm">
                  {session?.user?.name ? session.user.name.charAt(0) : "U"}
                </div>
                <div className="text-sm text-slate-700 border-b border-slate-100">
                  <p className="font-bold">
                    {session?.user?.name || "Pengguna"}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {session?.user?.email || "Tidak ada email"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut size={16} /> Keluar
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100 sticky top-0 z-10">
          <Link href="/dashboard">
             <img src="/logo-all.png" alt="SmartKas" className="h-8 w-auto" />
          </Link>
          <button onClick={() => signOut()}>
            <LogOut size={22} className="text-slate-500" />
          </button>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex space-x-2 overflow-x-auto mb-6 pb-2 no-scrollbar">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                router.pathname === item.path
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};
