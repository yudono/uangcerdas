export const formatCurrency = (val: number, currency = "IDR", locale = "id-ID") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
};