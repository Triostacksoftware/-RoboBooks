import jsPDF from "jspdf";
import "jspdf-autotable";

// Client-side PDF generation - no server dependencies!
export const generateClientPDF = (invoice) => {
  const doc = new jsPDF();

  // Add company header
  doc.setFontSize(20);
  doc.text(invoice.sellerName || "ROBOBOOKS SOLUTIONS", 105, 20, {
    align: "center",
  });

  doc.setFontSize(12);
  doc.text(
    invoice.sellerAddress || "123 Business Street, Tech Park, Bangalore",
    105,
    30,
    { align: "center" }
  );
  doc.text(`Phone: ${invoice.sellerPhone || "+91 98765 43210"}`, 105, 37, {
    align: "center",
  });
  doc.text(`GSTIN: ${invoice.sellerGstin || "29ABCDE1234F1Z5"}`, 105, 44, {
    align: "center",
  });

  // Invoice title
  doc.setFontSize(16);
  doc.text("Tax Invoice", 105, 60, { align: "center" });

  // Invoice details
  doc.setFontSize(10);
  doc.text(`Invoice No.: ${invoice.invoiceNumber}`, 20, 80);
  doc.text(
    `Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`,
    20,
    87
  );
  doc.text(`Customer: ${invoice.buyerName || invoice.customerName}`, 20, 94);

  // Items table
  const tableData = invoice.items.map((item, index) => [
    index + 1,
    item.details,
    item.quantity,
    `₹${item.rate.toFixed(2)}`,
    `₹${item.taxAmount.toFixed(2)}`,
    `₹${item.amount.toFixed(2)}`,
  ]);

  doc.autoTable({
    startY: 110,
    head: [["#", "Item", "Qty", "Rate", "Tax", "Amount"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Total
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Total: ₹${invoice.total.toFixed(2)}`, 150, finalY);

  // Save the PDF
  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);

  return doc;
};

export default { generateClientPDF };
