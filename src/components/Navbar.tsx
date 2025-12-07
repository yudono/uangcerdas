import React, { useState, useEffect } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "./Button";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Masalah", href: "#problem" },
    { label: "Fitur", href: "#features" },
    { label: "Cara Kerja", href: "#how-it-works" },
    { label: "Keunggulan", href: "#advantage" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          {/* Logo */}
          <Link href="/">
            <img src="/logo-all.png" alt="SmartKas" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            {session ? (
              <>
                <Link href="/dashboard">
                  <span className="text-slate-600 hover:text-emerald-600 font-medium transition-colors cursor-pointer">
                    {session.user.email}
                  </span>
                </Link>
                <Button size="sm" onClick={() => signOut()}>
                  Keluar
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">Masuk / Daftar</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-emerald-600"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 text-base font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4">
              {session ? (
                <>
                  <Link href="/dashboard">
                    <span className="block w-full text-center px-3 py-3 text-base font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer">
                      {session.user.email}
                    </span>
                  </Link>
                  <Button
                    className="w-full justify-center"
                    onClick={() => signOut()}
                  >
                    Keluar
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button className="w-full justify-center">
                    Masuk / Daftar
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
