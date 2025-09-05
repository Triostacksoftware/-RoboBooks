/**
 * Currency formatting utility
 * Formats numbers as Indian Rupees with Rs symbol
 */
export const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return "Rs0.00";
  
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "code", // This will show INR instead of ₹
  }).format(amount).replace("INR", "Rs"); // Replace INR with Rs
};
