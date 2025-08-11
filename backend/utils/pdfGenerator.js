import PDFDocument from 'pdf-lib';
import { format } from 'date-fns';

export async function generateDeliveryChallanPDF(deliveryChallan) {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    
    const { width, height } = page.getSize();
    const margin = 50;
    const contentWidth = width - (2 * margin);
    
    // Helper function to add text
    const addText = (text, x, y, fontSize = 12, font = 'Helvetica') => {
      page.drawText(text, {
        x,
        y: height - y,
        size: fontSize,
        font: font === 'Helvetica-Bold' ? 'Helvetica-Bold' : 'Helvetica'
      });
    };

    // Helper function to add line
    const addLine = (x1, y1, x2, y2, thickness = 1) => {
      page.drawLine({
        start: { x: x1, y: height - y1 },
        end: { x: x2, y: height - y2 },
        thickness
      });
    };

    // Helper function to add rectangle
    const addRect = (x, y, width, height, strokeColor = { r: 0, g: 0, b: 0 }) => {
      page.drawRectangle({
        x,
        y: height - y,
        width,
        height,
        borderColor: strokeColor,
        borderWidth: 1
      });
    };

    // Company Header
    addText('TRIOOSTACK TECHNOLOGIES PVT LTD', margin, 80, 18, 'Helvetica-Bold');
    addText('Uttar Pradesh, India', margin, 105, 12);
    addText('comrade34arya@gmail.com', margin, 120, 12);
    
    // Title
    addText('DELIVERY CHALLAN', margin + (contentWidth / 2) - 80, 160, 20, 'Helvetica-Bold');
    
    // Challan Details
    addText('Delivery Challan#', margin, 200, 12, 'Helvetica-Bold');
    addText(deliveryChallan.challanNo, margin + 120, 200, 12);
    
    addText('Challan Date:', margin, 220, 12, 'Helvetica-Bold');
    addText(format(new Date(deliveryChallan.challanDate), 'dd/MM/yyyy'), margin + 120, 220, 12);
    
    if (deliveryChallan.referenceNo) {
      addText('Ref#:', margin, 240, 12, 'Helvetica-Bold');
      addText(deliveryChallan.referenceNo, margin + 120, 240, 12);
    }
    
    addText('Challan Type:', margin, 260, 12, 'Helvetica-Bold');
    addText(deliveryChallan.challanType, margin + 120, 260, 12);
    
    // Deliver To
    addText('Deliver To:', margin, 300, 12, 'Helvetica-Bold');
    addText(deliveryChallan.customerName, margin + 120, 300, 12);
    
    if (deliveryChallan.customerId?.billingAddress) {
      const address = deliveryChallan.customerId.billingAddress;
      const addressText = [address.street, address.city, address.state, address.country, address.zipCode]
        .filter(Boolean)
        .join(', ');
      addText(addressText, margin + 120, 320, 10);
    }
    
    // Items Table Header
    const tableY = 380;
    addRect(margin, tableY, contentWidth, 30);
    
    addText('Item & Description', margin + 10, tableY + 20, 12, 'Helvetica-Bold');
    addText('Qty', margin + 300, tableY + 20, 12, 'Helvetica-Bold');
    addText('UOM', margin + 350, tableY + 20, 12, 'Helvetica-Bold');
    addText('Rate', margin + 400, tableY + 20, 12, 'Helvetica-Bold');
    addText('Amount', margin + 480, tableY + 20, 12, 'Helvetica-Bold');
    
    // Items Table
    let currentY = tableY + 40;
    deliveryChallan.items.forEach((item, index) => {
      if (currentY > height - 200) {
        // Add new page if running out of space
        page = pdfDoc.addPage([595.28, 841.89]);
        currentY = 50;
      }
      
      addRect(margin, currentY, contentWidth, 25);
      
      addText(`${index + 1}`, margin + 10, currentY + 15, 10);
      addText(item.itemName, margin + 30, currentY + 15, 10);
      addText(item.quantity.toString(), margin + 300, currentY + 15, 10);
      addText(item.uom, margin + 350, currentY + 15, 10);
      addText(item.rate ? item.rate.toFixed(2) : '0.00', margin + 400, currentY + 15, 10);
      addText(item.amount ? item.amount.toFixed(2) : '0.00', margin + 480, currentY + 15, 10);
      
      currentY += 30;
    });
    
    // Totals Section
    const totalsY = currentY + 20;
    
    addText('Sub Total:', margin + 400, totalsY, 12, 'Helvetica-Bold');
    addText(deliveryChallan.subTotal.toFixed(2), margin + 480, totalsY, 12);
    
    if (deliveryChallan.discount > 0) {
      const discountText = deliveryChallan.discountType === 'percentage' 
        ? `Discount (${deliveryChallan.discount}%)`
        : 'Discount';
      addText(discountText, margin + 400, totalsY + 25, 12, 'Helvetica-Bold');
      addText(`(-) ${deliveryChallan.discountAmount.toFixed(2)}`, margin + 480, totalsY + 25, 12);
    }
    
    if (deliveryChallan.adjustment !== 0) {
      addText('Adjustment:', margin + 400, totalsY + 50, 12, 'Helvetica-Bold');
      addText(deliveryChallan.adjustment.toFixed(2), margin + 480, totalsY + 50, 12);
    }
    
    // Total
    addRect(margin + 400, totalsY + 70, 150, 30);
    addText('Total (₹):', margin + 410, totalsY + 90, 14, 'Helvetica-Bold');
    addText(deliveryChallan.total.toFixed(2), margin + 480, totalsY + 90, 14, 'Helvetica-Bold');
    
    // Total in Words
    addText('Total in Words:', margin, totalsY + 120, 12, 'Helvetica-Bold');
    addText(convertToWords(deliveryChallan.total), margin + 120, totalsY + 120, 10);
    
    // Notes and Terms
    if (deliveryChallan.notes) {
      addText('Notes:', margin, totalsY + 160, 12, 'Helvetica-Bold');
      addText(deliveryChallan.notes, margin + 120, totalsY + 160, 10);
    }
    
    if (deliveryChallan.terms) {
      addText('Terms & Conditions:', margin, totalsY + 200, 12, 'Helvetica-Bold');
      addText(deliveryChallan.terms, margin + 120, totalsY + 200, 10);
    }
    
    // Signature
    addText('Authorized Signature:', margin, totalsY + 280, 12, 'Helvetica-Bold');
    addLine(margin + 120, totalsY + 280, margin + 300, totalsY + 280, 1);
    
    // Footer
    addText(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, margin, height - 50, 10);
    
    // Convert to bytes
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

// Helper function to convert number to words
function convertToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  function convertLessThanOneThousand(n) {
    if (n === 0) return '';
    
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
  }
  
  function convert(n) {
    if (n === 0) return 'Zero';
    
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const remainder = n % 1000;
    
    let result = '';
    
    if (crore > 0) {
      result += convertLessThanOneThousand(crore) + ' Crore ';
    }
    
    if (lakh > 0) {
      result += convertLessThanOneThousand(lakh) + ' Lakh ';
    }
    
    if (thousand > 0) {
      result += convertLessThanOneThousand(thousand) + ' Thousand ';
    }
    
    if (remainder > 0) {
      result += convertLessThanOneThousand(remainder);
    }
    
    return result.trim() + ' Only';
  }
  
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let result = convert(rupees) + ' Indian Rupee';
  if (paise > 0) {
    result += ' and ' + convert(paise) + ' Paise';
  }
  
  return result;
}
