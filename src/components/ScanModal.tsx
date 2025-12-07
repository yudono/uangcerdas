import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Check, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';
// import { formatCurrency } from '@/src/lib/format-currency'; // Removed in favor of hook
import { useCurrency } from '@/src/hooks/useCurrency';

interface ScannedItem {
    name: string;
    price: number;
    quantity: number;
    total: number;
}

interface ScanResult {
    merchant?: string;
    date?: string;
    items?: ScannedItem[];
    total_amount?: number;
}

interface ScanModalProps {
    onClose: () => void;
    onSave: (items: any[]) => void;
    isLoading?: boolean;
}

export const ScanModal: React.FC<ScanModalProps> = ({ onClose, onSave }) => {
    const { formatCurrency } = useCurrency();
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImagePreview(base64);
                processImage(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = async (base64Image: string) => {
        setStep('processing');
        try {
            // Send full data URL as confirmed by testing
            const res = await fetch('/api/ocr/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_data: base64Image }),
            });

            if (!res.ok) throw new Error('OCR Failed');

            const data = await res.json();
            console.log("OCR Result:", data);

            // Kolosal returns the result directly or in a wrapper
            const result = data.result || data;

            setScanResult(result);
            setStep('review');
        } catch (error) {
            console.error(error);
            alert('Gagal memproses gambar. Silakan coba lagi.');
            setStep('upload');
        }
    };

    const handleSave = () => {
        if (!scanResult || !scanResult.items) return;

        // Map items to Transaction format
        const transactions = scanResult.items
            .filter(item => item.name && (item.total || item.price)) // Filter valid items
            .map(item => ({
                date: scanResult.date || new Date().toISOString().split('T')[0],
                desc: item.name || 'Item tidak dikenal',
                amount: item.total || item.price || 0,
                type: 'out', // Assuming receipts are expenses
                category: 'Bahan Baku', // Default category, user might want to change
                source: 'Import',
                status: 'completed'
            }));

        if (transactions.length === 0) {
            alert("Tidak ada item valid untuk disimpan.");
            return;
        }

        onSave(transactions);
    };

    const removeItem = (index: number) => {
        if (!scanResult || !scanResult.items) return;
        const newItems = [...scanResult.items];
        newItems.splice(index, 1);
        setScanResult({
            ...scanResult,
            items: newItems
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">
                        {step === 'upload' && 'Scan Struk / Catatan'}
                        {step === 'processing' && 'Memproses AI...'}
                        {step === 'review' && 'Review Hasil Scan'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[300px]">
                    {step === 'upload' && (
                        <div className="flex flex-col items-center justify-center h-full gap-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-8">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                                <Camera size={32} />
                            </div>
                            <p className="text-center text-slate-600">
                                Ambil foto struk atau upload gambar dari galeri Anda.
                                <br /><span className="text-xs text-slate-400">Support JPG, PNG</span>
                            </p>

                            <div className="flex gap-3 w-full">
                                <Button
                                    className="flex-1 justify-center"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={16} className="mr-2" /> Upload Gambar
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="relative w-full max-w-xs aspect-[3/4] rounded-lg overflow-hidden shadow-md mb-4">
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-50" />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                                </div>
                            </div>
                            <p className="text-slate-600 font-medium animate-pulse">Sedang membaca struk...</p>
                        </div>
                    )}

                    {step === 'review' && scanResult && (
                        <div className="space-y-4">
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-slate-500">Merchant:</span>
                                    <span className="font-bold text-slate-800">{scanResult.merchant || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Tanggal:</span>
                                    <span className="font-bold text-slate-800">{scanResult.date || 'Hari ini'}</span>
                                </div>
                            </div>

                            <p className="text-sm font-bold text-slate-700 mb-2">Item Terdeteksi ({scanResult.items?.length || 0})</p>

                            <div className="space-y-2">
                                {scanResult.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:border-emerald-200 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.quantity} x {formatCurrency(item.price)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-800 text-sm">{formatCurrency(item.total)}</span>
                                            <button
                                                onClick={() => removeItem(idx)}
                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {(!scanResult.items || scanResult.items.length === 0) && (
                                    <p className="text-center text-slate-400 py-4 text-sm">Tidak ada item yang ditemukan.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {step === 'review' && (
                    <div className="pt-4 mt-2 border-t border-slate-100 flex gap-3">
                        <Button variant="outline" className="flex-1 justify-center" onClick={() => setStep('upload')}>
                            Scan Ulang
                        </Button>
                        <Button className="flex-1 justify-center" onClick={handleSave}>
                            <Check size={16} className="mr-2" /> Simpan Semua
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
