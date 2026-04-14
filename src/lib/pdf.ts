import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker via Vite's ?url import
// This is the most reliable way in a Vite environment
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractTextFromPdf(file: File): Promise<string> {
  console.log(`Extracting text from: ${file.name}`);
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    console.log(`Successfully extracted ${fullText.length} characters from ${file.name}`);
    return fullText;
  } catch (error) {
    console.error(`Error extracting text from ${file.name}:`, error);
    throw error;
  }
}
