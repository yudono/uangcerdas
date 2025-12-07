import { useQuery } from "@tanstack/react-query";

export const useCurrency = () => {
    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await fetch('/api/settings');
            if (!res.ok) throw new Error('Failed to fetch settings');
            return res.json();
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    const currencyCode = settings?.currency || 'IDR';

    const formatCurrency = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        if (isNaN(numAmount)) return amount;

        return new Intl.NumberFormat(currencyCode === 'IDR' ? 'id-ID' : 'en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(numAmount);
    };

    return {
        currency: currencyCode,
        formatCurrency,
        isLoading,
    };
};
