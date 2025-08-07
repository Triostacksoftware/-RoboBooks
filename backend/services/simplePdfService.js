import htmlPdf from "html-pdf-node";

// Simple PDF generation using html-pdf-node (no browser needed!)
export const generateSimplePDF = async (htmlContent) => {
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

export default { generateSimplePDF };
