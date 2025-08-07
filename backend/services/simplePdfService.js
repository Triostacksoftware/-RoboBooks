import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Simple PDF generation using pdf-lib (truly server-side!)
export const generateSimplePDF = async (htmlContent) => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    // Get the standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Extract text content from HTML and handle Unicode characters
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

// Helper function to extract text from HTML and handle Unicode characters
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

  // Replace Unicode characters that cause encoding issues
  text = text
    .replace(/₹/g, "Rs.") // Replace Rupee symbol with "Rs."
    .replace(/[\u20B9]/g, "Rs.") // Replace Unicode Rupee symbol
    .replace(/[\u00A0]/g, " ") // Replace non-breaking space
    .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
    .replace(/[\u2018\u2019]/g, "'") // Replace smart apostrophes
    .replace(/[\u2013\u2014]/g, "-") // Replace em/en dashes
    .replace(/[\u2022]/g, "*") // Replace bullet points
    .replace(/[\u00B0]/g, " degrees") // Replace degree symbol
    .replace(/[\u00A9]/g, "(c)") // Replace copyright symbol
    .replace(/[\u00AE]/g, "(R)") // Replace registered trademark
    .replace(/[\u2122]/g, "(TM)"); // Replace trademark symbol

  return text;
}

export default { generateSimplePDF };
