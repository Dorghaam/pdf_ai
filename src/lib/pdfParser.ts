// Using pdfjs-dist
// Make sure to install: pnpm install pdfjs-dist@5.2.133
// This version is specified for Node & Edge safety.

// Required for Next.js to correctly bundle the worker
import * as pdfjsLib from 'pdfjs-dist';

// Set workerSrc for pdfjs-dist.
// Using CDN for simplicity in skeleton
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extracts text content from a PDF buffer.
 * @param pdfBuffer ArrayBuffer containing the PDF data.
 * @returns A promise that resolves to the extracted text string.
 */
export async function getTextFromPdf(pdfBuffer: ArrayBuffer): Promise<string> {
  try {
    const pdfDocument = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
      fullText += pageText + '\n\n'; // Add double newline between pages
    }
    return fullText.trim();
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF.');
  }
}