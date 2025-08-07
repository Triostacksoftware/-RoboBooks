import jsPDF from "jspdf";

// Simple PDF generation using jsPDF (truly browser-less!)
export const generateSimplePDF = async (htmlContent) => {
  try {
    // Create a new PDF document
    const pdf = new jsPDF();
    
    // Extract text content from HTML (simplified approach)
    const textContent = extractTextFromHTML(htmlContent);
    
    // Split text into lines that fit the page width
    const lines = pdf.splitTextToSize(textContent, 180); // 180mm width
    
    // Add text to PDF
    pdf.setFontSize(12);
    pdf.text(lines, 15, 20); // 15mm from left, 20mm from top
    
    // Convert to buffer
    const pdfBuffer = pdf.output('arraybuffer');
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

// Helper function to extract text from HTML
function extractTextFromHTML(html) {
  // Remove HTML tags and decode entities
  let text = html
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  return text;
}

export default { generateSimplePDF };
