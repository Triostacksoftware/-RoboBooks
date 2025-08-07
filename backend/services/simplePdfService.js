import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Simple PDF generation using pdf-lib (truly server-side!)
export const generateSimplePDF = async (htmlContent) => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    // Get the standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Extract text content from HTML
    const textContent = extractTextFromHTML(htmlContent);

    // Split text into lines
    const lines = textContent.split("\n").filter((line) => line.trim());

    // Set font size and color
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    let yPosition = page.getHeight() - 50; // Start from top with margin

    // Add text to PDF
    for (const line of lines) {
      if (yPosition < 50) {
        // If we're near the bottom, add a new page
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        yPosition = newPage.getHeight() - 50;
      }

      page.drawText(line.trim(), {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });

      yPosition -= lineHeight;
    }

    // Convert to buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

// Helper function to extract text from HTML
function extractTextFromHTML(html) {
  // Remove HTML tags and decode entities
  let text = html
    .replace(/<[^>]*>/g, " ") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();

  return text;
}

export default { generateSimplePDF };
