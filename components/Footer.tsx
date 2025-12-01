import React from 'react';
import { ShieldCheck, Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <span className="text-xl font-bold text-slate-900">UangCerdas</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Membantu UMKM Indonesia naik kelas dengan manajemen keuangan berbasis Artificial Intelligence.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Produk</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-emerald-600">Fitur</a></li>
              <li><a href="#" className="hover:text-emerald-600">Harga</a></li>
              <li><a href="#" className="hover:text-emerald-600">Testimoni</a></li>
              <li><a href="#" className="hover:text-emerald-600">Download App</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-emerald-600">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-emerald-600">Karir</a></li>
              <li><a href="#" className="hover:text-emerald-600">Blog</a></li>
              <li><a href="#" className="hover:text-emerald-600">Kontak</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Ikuti Kami</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-emerald-600"><Instagram size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-emerald-600"><Facebook size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-emerald-600"><Twitter size={20} /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>© 2024 UangCerdas Indonesia. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-600">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};