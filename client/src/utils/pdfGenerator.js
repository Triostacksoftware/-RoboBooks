// Dynamic import for jsPDF to work in both browser and Node.js
let jsPDF;
let autoTable;

// Initialize jsPDF dynamically
const initPDF = async () => {
  if (typeof window !== 'undefined') {
    // Browser environment
    const jsPDFModule = await import("jspdf");
    const autoTableModule = await import("jspdf-autotable");
    jsPDF = jsPDFModule.default;
    autoTable = autoTableModule.default;
  } else {
    // Node.js environment
    const jsPDFModule = await import("jspdf");
    const autoTableModule = await import("jspdf-autotable");
    jsPDF = jsPDFModule.default.default || jsPDFModule.default;
    autoTable = autoTableModule.default.default || autoTableModule.default;
  }
};

// Client-side PDF generation - no server dependencies!
export const generateClientPDF = async (invoice) => {
  // Initialize jsPDF if not already done
  if (!jsPDF) {
    await initPDF();
  }
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to convert number to words
  const numberToWords = (num) => {
    // Ensure num is a valid number
    if (isNaN(num) || num === null || num === undefined) {
      return "Zero Rupees only";
    }
    
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    const convertLessThanOneThousand = (num) => {
      if (num === 0) return "";
      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "");
      return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " and " + convertLessThanOneThousand(num % 100) : "");
    };

    const convert = (num) => {
      if (num === 0) return "Zero";
      if (num < 1000) return convertLessThanOneThousand(num);
      if (num < 100000) return convertLessThanOneThousand(Math.floor(num / 1000)) + " Thousand" + (num % 1000 !== 0 ? " " + convertLessThanOneThousand(num % 1000) : "");
      if (num < 10000000) return convertLessThanOneThousand(Math.floor(num / 100000)) + " Lakh" + (num % 100000 !== 0 ? " " + convert(Math.floor(num / 1000) % 100) + " Thousand" + (num % 1000 !== 0 ? " " + convertLessThanOneThousand(num % 1000) : "") : "");
      return convertLessThanOneThousand(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 !== 0 ? " " + convert(num % 10000000) : "");
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    let result = convert(rupees) + " Rupees";
    if (paise > 0) {
      result += " and " + convert(paise) + " Paise";
    }
    return result + " only";
  };

  // Company Header - Match Print Output Exactly
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text(invoice.sellerName || "ROBOBOOKS SOLUTIONS", centerX, 25, { align: "center" });

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(invoice.sellerAddress || "123 Business Street, Tech Park, Bangalore - 560001", centerX, 35, { align: "center" });
  
  doc.text(`${invoice.sellerPhone || "+91 9876543210"} | ${invoice.sellerEmail || "info@robobooks.com"}`, centerX, 42, { align: "center" });
  
  doc.text(`GSTIN: ${invoice.sellerGstin || "29ABCDE1234F1Z5"} | Origin of Supply: 29-Karnataka`, centerX, 49, { align: "center" });

  // Invoice details (single line with bullet points)
  doc.setFontSize(8);
  const invoiceDetails = `• Invoice No: ${invoice.invoiceNumber} • Date: ${formatDate(invoice.invoiceDate)} • Due Date: ${formatDate(invoice.dueDate)}${invoice.orderNumber ? ` • Order No: ${invoice.orderNumber}` : ''}`;
  doc.text(invoiceDetails, centerX, 55, { align: "center" });

  // Professional horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 62, pageWidth - 20, 62);

  // Billing and Shipping Address (side by side)
  let yPos = 75;
  
  // Billing Address (left side)
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text("Billing Address:", 20, yPos);
  doc.setFont(undefined, 'normal');
  
  yPos += 8;
  doc.text(invoice.buyerName || invoice.customerName, 20, yPos);
  
  if (invoice.buyerAddress || invoice.customerAddress) {
    yPos += 6;
    doc.text(invoice.buyerAddress || invoice.customerAddress, 20, yPos);
  }
  
  if (invoice.buyerPhone || invoice.customerPhone) {
    yPos += 6;
    doc.text(`Phone: ${invoice.buyerPhone || invoice.customerPhone}`, 20, yPos);
  }
  
  if (invoice.buyerEmail || invoice.customerEmail) {
    yPos += 6;
    doc.text(`Email: ${invoice.buyerEmail || invoice.customerEmail}`, 20, yPos);
  }
  
  if (invoice.buyerGstin) {
    yPos += 6;
    doc.text(`GSTIN: ${invoice.buyerGstin}`, 20, yPos);
  }
  
  yPos += 6;
  doc.text("State: 09-Uttar Pradesh", 20, yPos);

  // Shipping Address (right side)
  yPos = 75;
  doc.setFont(undefined, 'bold');
  doc.text("Shipping Address:", 110, yPos);
  doc.setFont(undefined, 'normal');
  
  yPos += 8;
  doc.text(invoice.buyerName || invoice.customerName, 110, yPos);
  
  if (invoice.buyerAddress || invoice.customerAddress) {
    yPos += 6;
    doc.text(invoice.buyerAddress || invoice.customerAddress, 110, yPos);
  }
  
  yPos += 6;
  doc.text("Place of Supply: 09-Delivery Location", 110, yPos);
  
  if (invoice.terms) {
    yPos += 6;
    doc.text(`Terms: ${invoice.terms}`, 110, yPos);
  }
  
  if (invoice.salesperson) {
    yPos += 6;
    doc.text(`Salesperson: ${invoice.salesperson}`, 110, yPos);
  }

  // Items table - Match Print Output Exactly
  let tableY = 125;
  doc.setFontSize(10);
  
  // Table header with borders
  doc.setFont(undefined, 'bold');
  const colPositions = [20, 35, 85, 110, 130, 160, 185];
  
  // Draw table header background
  doc.setFillColor(240, 240, 240);
  doc.rect(20, tableY - 5, pageWidth - 40, 8, 'F');
  
  // Header text
  doc.text("#", colPositions[0], tableY);
  doc.text("Item name", colPositions[1], tableY);
  doc.text("HSN/SAC", colPositions[2], tableY);
  doc.text("Quantity", colPositions[3], tableY);
  doc.text("Price/unit", colPositions[4], tableY);
  doc.text("GST", colPositions[5], tableY);
  doc.text("Amount", colPositions[6], tableY);
  
  // Draw borders for header
  doc.setLineWidth(0.1);
  for (let i = 0; i <= colPositions.length; i++) {
    const x = i === 0 ? 20 : colPositions[i - 1];
    doc.line(x, tableY - 5, x, tableY + 3);
  }
  doc.line(20, tableY - 5, pageWidth - 20, tableY - 5);
  doc.line(20, tableY + 3, pageWidth - 20, tableY + 3);
  
  // Table rows
  doc.setFont(undefined, 'normal');
  invoice.items.forEach((item, index) => {
    tableY += 8;
    doc.text((index + 1).toString(), colPositions[0], tableY);
    doc.text(item.details, colPositions[1], tableY);
    doc.text("8704", colPositions[2], tableY);
    doc.text(item.quantity.toString(), colPositions[3], tableY);
    doc.text(formatCurrency(item.rate), colPositions[4], tableY);
    
    // Fix tax rate display - ensure it's a valid number
    const taxRate = item.taxRate || 18;
    doc.text(`${formatCurrency(item.taxAmount)} (${taxRate}%)`, colPositions[5], tableY);
    doc.text(formatCurrency(item.amount), colPositions[6], tableY);
    
    // Draw row borders
    for (let i = 0; i <= colPositions.length; i++) {
      const x = i === 0 ? 20 : colPositions[i - 1];
      doc.line(x, tableY - 4, x, tableY + 4);
    }
    doc.line(20, tableY - 4, pageWidth - 20, tableY - 4);
    doc.line(20, tableY + 4, pageWidth - 20, tableY + 4);
  });
  
  // Total row
  tableY += 8;
  doc.setFont(undefined, 'bold');
  doc.text("Total", colPositions[0], tableY);
  doc.text("", colPositions[1], tableY);
  doc.text("", colPositions[2], tableY);
  doc.text(invoice.items.reduce((sum, item) => sum + item.quantity, 0).toString(), colPositions[3], tableY);
  doc.text("", colPositions[4], tableY);
  doc.text(formatCurrency(invoice.taxAmount), colPositions[5], tableY);
  doc.text(formatCurrency(invoice.total), colPositions[6], tableY);
  
  // Draw total row borders
  for (let i = 0; i <= colPositions.length; i++) {
    const x = i === 0 ? 20 : colPositions[i - 1];
    doc.line(x, tableY - 4, x, tableY + 4);
  }
  doc.line(20, tableY - 4, pageWidth - 20, tableY - 4);
  doc.line(20, tableY + 4, pageWidth - 20, tableY + 4);

  // Summary and Terms Section - Match Print Output
  tableY += 20;
  
  // Left side - Amount in Words and Terms
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text("Invoice Amount In Words:", 20, tableY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  
  // Split long text into multiple lines to prevent overlapping
  const amountInWords = numberToWords(invoice.total);
  const wordsPerLine = 8; // Adjust based on available space
  const words = amountInWords.split(' ');
  let currentLine = '';
  let lineY = tableY + 6;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
    if (testLine.length > wordsPerLine && currentLine) {
      doc.text(currentLine, 20, lineY);
      currentLine = words[i];
      lineY += 4;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    doc.text(currentLine, 20, lineY);
  }
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text("Terms And Conditions:", 20, lineY + 15);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text(invoice.termsConditions || "Thank you for doing business with us.", 20, lineY + 21);

  // Right side - Financial Summary (moved further right to prevent overlapping)
  const summaryX = 130;
  const summaryY = tableY;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text("Sub Total:", summaryX, summaryY);
  doc.text(formatCurrency(invoice.subTotal), summaryX + 60, summaryY);
  
  if (invoice.taxAmount > 0) {
    // Fix NaN% issue by ensuring taxRate is a valid number
    const taxRate = invoice.taxRate || 18;
    const halfTaxRate = taxRate / 2;
    
    doc.text(`SGST@${halfTaxRate}%:`, summaryX, summaryY + 6);
    doc.text(formatCurrency(invoice.taxAmount / 2), summaryX + 60, summaryY + 6);
    
    doc.text(`CGST@${halfTaxRate}%:`, summaryX, summaryY + 12);
    doc.text(formatCurrency(invoice.taxAmount / 2), summaryX + 60, summaryY + 12);
  }
  
  // Total line
  doc.setLineWidth(0.1);
  doc.line(summaryX, summaryY + 18, summaryX + 60, summaryY + 18);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text("Total:", summaryX, summaryY + 24);
  doc.text(formatCurrency(invoice.total), summaryX + 60, summaryY + 24);
  
  // Received and Balance
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text("Received:", summaryX, summaryY + 32);
  doc.text(formatCurrency(invoice.amountPaid), summaryX + 60, summaryY + 32);
  
  doc.text("Balance:", summaryX, summaryY + 38);
  doc.setFont(undefined, 'bold');
  doc.text(formatCurrency(invoice.balanceDue), summaryX + 60, summaryY + 38);

  // Signature Area - Match Print Output
  tableY += 50;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`For: ${invoice.sellerName || "ROBOBOOKS SOLUTIONS"}`, 20, tableY);
  
  // Signature line
  doc.setLineWidth(0.1);
  doc.line(20, tableY + 15, 80, tableY + 15);
  doc.text("Authorized Signatory", 20, tableY + 20);
  
  // Website
  doc.text("www.robobooks.com", pageWidth - 40, tableY + 20);

  // Save the PDF
  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);

  return doc;
};

export default { generateClientPDF };
