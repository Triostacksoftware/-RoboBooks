export function calculateGST(items) {
  return items.map(item => ({
    desc: item.desc,
    tax: (item.qty * item.rate * item.tax_pct) / 100,
  }));
}

export function calculateTotal(items) {
  return items.reduce(
    (sum, item) => sum + item.qty * item.rate * (1 + item.tax_pct / 100),
    0
  );
}


