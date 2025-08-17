import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { generateSimplePDF } from "./simplePdfService.js";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// PDF generation is now handled by pdfService.js

// Generate invoice HTML
const generateInvoiceHTML = (invoice) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const convertLessThanOneThousand = (num) => {
      if (num === 0) return "";
      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      if (num < 100)
        return (
          tens[Math.floor(num / 10)] +
          (num % 10 !== 0 ? " " + ones[num % 10] : "")
        );
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 !== 0 ? " and " + convertLessThanOneThousand(num % 100) : "")
      );
    };

    const convert = (num) => {
      if (num === 0) return "Zero";
      if (num < 1000) return convertLessThanOneThousand(num);
      if (num < 100000)
        return (
          convertLessThanOneThousand(Math.floor(num / 1000)) +
          " Thousand" +
          (num % 1000 !== 0 ? " " + convertLessThanOneThousand(num % 1000) : "")
        );
      if (num < 10000000)
        return (
          convertLessThanOneThousand(Math.floor(num / 100000)) +
          " Lakh" +
          (num % 100000 !== 0
            ? " " +
              convert(Math.floor(num / 1000) % 100) +
              " Thousand" +
              (num % 1000 !== 0
                ? " " + convertLessThanOneThousand(num % 1000)
                : "")
            : "")
        );
      return (
        convertLessThanOneThousand(Math.floor(num / 10000000)) +
        " Crore" +
        (num % 10000000 !== 0 ? " " + convert(num % 10000000) : "")
      );
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    let result = convert(rupees) + " Rupees";
    if (paise > 0) result += " and " + convert(paise) + " Paise";
    result += " only";
    return result;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Tax Invoice - ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #333;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .company-details {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }
        .invoice-title {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          padding: 15px 0;
          border-bottom: 1px solid #ddd;
        }
        .details-section {
          display: flex;
          justify-content: space-between;
          padding: 20px 0;
          border-bottom: 1px solid #ddd;
        }
        .bill-to, .invoice-details {
          width: 48%;
        }
        .section-title {
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .customer-name {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .customer-details {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .items-table th, .items-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        .items-table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .items-table .total-row {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .summary-section {
          display: flex;
          justify-content: space-between;
          padding: 20px 0;
          border-top: 1px solid #ddd;
        }
        .amount-words, .financial-summary {
          width: 48%;
        }
        .summary-title {
          font-weight: bold;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .amount-in-words {
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
        }
        .terms {
          font-size: 12px;
          color: #666;
        }
        .financial-table {
          width: 100%;
          border-collapse: collapse;
        }
        .financial-table td {
          padding: 5px 0;
          font-size: 12px;
        }
        .financial-table .total-row {
          border-top: 1px solid #ddd;
          font-weight: bold;
          font-size: 14px;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 30px 0;
          border-top: 1px solid #ddd;
        }
        .signature-line {
          border-top: 1px solid #333;
          width: 150px;
          margin-top: 30px;
        }
        .signature-text {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        .website {
          font-size: 12px;
          color: #666;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
      </style>
    </head>
    <body>
      <!-- Company Header -->
      <div class="header">
        <div class="company-name">${
          invoice.sellerName || "ROBOBOOKS SOLUTIONS"
        }</div>
        <div class="company-details">
          ${
            invoice.sellerAddress || "123 Business Street, Tech Park, Bangalore"
          }<br>
          Phone no.: ${invoice.sellerPhone || "+91 98765 43210"}<br>
          GSTIN: ${invoice.sellerGstin || "29ABCDE1234F1Z5"}<br>
          State: 29-Karnataka
        </div>
      </div>

      <!-- Tax Invoice Title -->
      <div class="invoice-title">Tax Invoice</div>

      <!-- Bill To and Invoice Details -->
      <div class="details-section">
        <div class="bill-to">
          <div class="section-title">Bill To:</div>
          <div class="customer-name">${
            invoice.buyerName || invoice.customerName
          }</div>
          <div class="customer-details">
            ${invoice.buyerAddress || invoice.customerAddress || ""}<br>
            ${
              invoice.buyerPhone || invoice.customerPhone
                ? `Contact No.: ${
                    invoice.buyerPhone || invoice.customerPhone
                  }<br>`
                : ""
            }
            ${
              invoice.buyerEmail || invoice.customerEmail
                ? `Email: ${invoice.buyerEmail || invoice.customerEmail}<br>`
                : ""
            }
            ${
              invoice.buyerGstin
                ? `GSTIN Number: ${invoice.buyerGstin}<br>`
                : ""
            }
            State: 09-Uttar Pradesh
          </div>
        </div>
        <div class="invoice-details">
          <div class="section-title">Invoice Details:</div>
          <div class="customer-details">
            Invoice No.: ${invoice.invoiceNumber}<br>
            Date: ${formatDate(invoice.invoiceDate)}<br>
            Place of Supply: 29-Karnataka<br>
            ${
              invoice.orderNumber ? `Order No.: ${invoice.orderNumber}<br>` : ""
            }
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item name</th>
            <th>HSN/SAC</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Price/unit</th>
            <th class="text-right">GST</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items
            .map(
              (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.details}</td>
              <td>8704</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.rate)}</td>
              <td class="text-right">${formatCurrency(item.taxAmount)} (${
                item.taxRate
              }%)</td>
              <td class="text-right">${formatCurrency(item.amount)}</td>
            </tr>
          `
            )
            .join("")}
          <tr class="total-row">
            <td colspan="3">Total</td>
            <td class="text-right">${invoice.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            )}</td>
            <td></td>
            <td class="text-right">${formatCurrency(invoice.taxAmount)}</td>
            <td class="text-right">${formatCurrency(invoice.total)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Summary and Terms -->
      <div class="summary-section">
        <div class="amount-words">
          <div class="summary-title">Invoice Amount In Words:</div>
          <div class="amount-in-words">${numberToWords(invoice.total)}</div>
          <div class="summary-title">Terms And Conditions:</div>
          <div class="terms">${
            invoice.termsConditions || "Thank you for doing business with us."
          }</div>
        </div>
        <div class="financial-summary">
          <table class="financial-table">
            <tr>
              <td>Sub Total:</td>
              <td class="text-right">${formatCurrency(invoice.subTotal)}</td>
            </tr>
            ${
              invoice.taxAmount > 0
                ? `
              <tr>
                <td>SGST@${invoice.taxRate / 2}%:</td>
                <td class="text-right">${formatCurrency(
                  invoice.taxAmount / 2
                )}</td>
              </tr>
              <tr>
                <td>CGST@${invoice.taxRate / 2}%:</td>
                <td class="text-right">${formatCurrency(
                  invoice.taxAmount / 2
                )}</td>
              </tr>
            `
                : ""
            }
            <tr class="total-row">
              <td>Total:</td>
              <td class="text-right">${formatCurrency(invoice.total)}</td>
            </tr>
            <tr>
              <td>Received:</td>
              <td class="text-right">${formatCurrency(invoice.amountPaid)}</td>
            </tr>
            <tr>
              <td>Balance:</td>
              <td class="text-right">${formatCurrency(invoice.balanceDue)}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Signature Area -->
      <div class="signature-section">
        <div>
          <div>For: ${invoice.sellerName || "ROBOBOOKS SOLUTIONS"}</div>
          ${invoice.signature ? 
            `<div style="margin-top: 20px;">
              <img src="${invoice.signature.filePath}" alt="Digital Signature" style="height: 60px; width: 120px; object-fit: contain; border: 1px solid #ccc; border-radius: 4px;">
            </div>` : 
            `<div class="signature-line"></div>`
          }
          <div class="signature-text">Authorized Signatory</div>
        </div>
        <div class="website">www.robobooks.com</div>
      </div>
    </body>
    </html>
  `;
};

// Send invoice email
export const sendInvoiceEmail = async (invoice, recipientEmail) => {
  try {
    // Generate HTML content
    const htmlContent = generateInvoiceHTML(invoice);

    // Generate PDF using simple method (no browser needed!)
    const pdfBuffer = await generateSimplePDF(htmlContent);

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Invoice ${invoice.invoiceNumber} from ${
        invoice.sellerName || "ROBOBOOKS SOLUTIONS"
      }`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Invoice ${invoice.invoiceNumber}</h2>
          <p>Dear ${invoice.buyerName || invoice.customerName},</p>
          <p>Please find attached the invoice for the services provided.</p>
          <p><strong>Invoice Details:</strong></p>
          <ul>
            <li>Invoice Number: ${invoice.invoiceNumber}</li>
            <li>Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}</li>
            <li>Total Amount: ${new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(invoice.total)}</li>
          </ul>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>${invoice.sellerName || "ROBOBOOKS SOLUTIONS"}</p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice_${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: result.messageId,
      message: "Invoice sent successfully",
    };
  } catch (error) {
    console.error("Error sending invoice email:", error);
    throw new Error(`Failed to send invoice email: ${error.message}`);
  }
};

// Generic sendEmail function for delivery challans and other documents
export const sendEmail = async (emailData) => {
  try {
    const { to, cc, subject, html, attachments = [] } = emailData;
    
    if (!to || !subject) {
      throw new Error('Recipient email and subject are required');
    }

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      cc,
      subject,
      html: html || 'Please find the attached document.',
      attachments: attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType || 'application/octet-stream'
      }))
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: result.messageId,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default {
  sendInvoiceEmail,
  sendEmail,
};
