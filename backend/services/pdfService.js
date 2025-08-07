import nodemailer from "nodemailer";
import htmlPdf from "html-pdf-node";
import dotenv from "dotenv";

dotenv.config();

// Method 1: Using html-pdf-node (already installed)
export const generatePDFWithHtmlPdfNode = async (htmlContent) => {
  const options = {
    format: "A4",
    margin: {
      top: "0.5in",
      right: "0.5in",
      bottom: "0.5in",
      left: "0.5in",
    },
    printBackground: true,
  };

  const file = { content: htmlContent };
  const pdfBuffer = await htmlPdf.generatePdf(file, options);
  return pdfBuffer;
};

// Method 2: Using jsPDF (client-side approach)
export const generatePDFWithJsPDF = async (invoice) => {
  // This would be used on the client side
  // For server-side, we'll use a different approach
  throw new Error("jsPDF is primarily for client-side use");
};

// Method 3: Using a PDF generation service
export const generatePDFWithService = async (htmlContent) => {
  // You can use services like:
  // - PDFShift
  // - DocRaptor
  // - WeasyPrint (Python service)
  // - Prince (commercial)
  
  // Example with a hypothetical service
  const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PDFSHIFT_API_KEY}`
    },
    body: JSON.stringify({
      source: htmlContent,
      format: 'A4',
      margin: '0.5in'
    })
  });
  
  if (!response.ok) {
    throw new Error('PDF generation service failed');
  }
  
  return await response.arrayBuffer();
};

// Method 4: Using wkhtmltopdf (requires system installation)
export const generatePDFWithWkhtmltopdf = async (htmlContent) => {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  const fs = await import('fs/promises');
  const path = await import('path');
  const os = await import('os');
  
  // Create temporary files
  const tempDir = os.tmpdir();
  const htmlFile = path.join(tempDir, `invoice-${Date.now()}.html`);
  const pdfFile = path.join(tempDir, `invoice-${Date.now()}.pdf`);
  
  try {
    // Write HTML to temp file
    await fs.writeFile(htmlFile, htmlContent);
    
    // Convert to PDF using wkhtmltopdf
    await execAsync(`wkhtmltopdf --page-size A4 --margin-top 0.5in --margin-right 0.5in --margin-bottom 0.5in --margin-left 0.5in "${htmlFile}" "${pdfFile}"`);
    
    // Read the generated PDF
    const pdfBuffer = await fs.readFile(pdfFile);
    
    return pdfBuffer;
  } finally {
    // Clean up temp files
    try {
      await fs.unlink(htmlFile);
      await fs.unlink(pdfFile);
    } catch (error) {
      console.warn('Failed to clean up temp files:', error);
    }
  }
};

// Method 5: Using Playwright (alternative to Puppeteer)
export const generatePDFWithPlaywright = async (htmlContent) => {
  const { chromium } = await import('playwright');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true
    });
    
    return pdf;
  } finally {
    await browser.close();
  }
};

// Method 6: Using a headless Chrome service
export const generatePDFWithChromeService = async (htmlContent) => {
  // Use a service like Browserless or similar
  const response = await fetch('https://chrome.browserless.io/pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.BROWSERLESS_API_KEY}`
    },
    body: JSON.stringify({
      html: htmlContent,
      options: {
        format: 'A4',
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        printBackground: true
      }
    })
  });
  
  if (!response.ok) {
    throw new Error('Chrome service failed');
  }
  
  return await response.arrayBuffer();
};

// Main PDF generation function with multiple fallbacks
export const generatePDF = async (htmlContent, method = 'html-pdf-node') => {
  const methods = {
    'html-pdf-node': generatePDFWithHtmlPdfNode,
    'wkhtmltopdf': generatePDFWithWkhtmltopdf,
    'playwright': generatePDFWithPlaywright,
    'chrome-service': generatePDFWithChromeService,
    'pdf-service': generatePDFWithService
  };
  
  const selectedMethod = methods[method];
  if (!selectedMethod) {
    throw new Error(`Unknown PDF generation method: ${method}`);
  }
  
  try {
    return await selectedMethod(htmlContent);
  } catch (error) {
    console.warn(`Method ${method} failed:`, error.message);
    
    // Try fallback methods
    for (const [fallbackMethod, fallbackFunction] of Object.entries(methods)) {
      if (fallbackMethod !== method) {
        try {
          console.log(`Trying fallback method: ${fallbackMethod}`);
          return await fallbackFunction(htmlContent);
        } catch (fallbackError) {
          console.warn(`Fallback method ${fallbackMethod} also failed:`, fallbackError.message);
        }
      }
    }
    
    throw new Error('All PDF generation methods failed');
  }
};

export default {
  generatePDF,
  generatePDFWithHtmlPdfNode,
  generatePDFWithWkhtmltopdf,
  generatePDFWithPlaywright,
  generatePDFWithChromeService,
  generatePDFWithService
};
