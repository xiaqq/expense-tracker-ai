'use client';

export interface PDFConversionResult {
  images: string[];
  pageCount: number;
}

export interface PDFTextResult {
  text: string;
  pageCount: number;
  hasText: boolean;
}

// Type definition for PDF.js library loaded from CDN
interface PDFJsLib {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: ArrayBuffer }) => { promise: Promise<PDFDocument> };
}

interface PDFDocument {
  numPages: number;
  getPage: (pageNum: number) => Promise<PDFPage>;
}

interface PDFPage {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  getTextContent: () => Promise<{ items: PDFTextItem[] }>;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
}

interface PDFTextItem {
  str?: string;
}

// Extend window type for PDF.js
declare global {
  interface Window {
    pdfjsLib?: PDFJsLib;
  }
}

// Load PDF.js from CDN to avoid webpack bundling issues
let pdfjsLoadPromise: Promise<PDFJsLib> | null = null;

async function loadPdfJs(): Promise<PDFJsLib> {
  if (pdfjsLoadPromise) return pdfjsLoadPromise;

  pdfjsLoadPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = window.pdfjsLib;
      if (!pdfjsLib) {
        reject(new Error('PDF.js library not found on window'));
        return;
      }
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(script);
  });

  return pdfjsLoadPromise;
}

/**
 * Extract text directly from PDF (faster and more accurate for digital PDFs)
 */
export async function extractTextFromPDF(file: File): Promise<PDFTextResult> {
  const pdfjsLib = await loadPdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageCount = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .filter((item: PDFTextItem) => 'str' in item && item.str)
      .map((item: PDFTextItem) => item.str)
      .join(' ');

    fullText += pageText + '\n';
  }

  const trimmedText = fullText.trim();
  return {
    text: trimmedText,
    pageCount,
    hasText: trimmedText.length > 50,
  };
}

/**
 * Convert PDF pages to images (for scanned/image-based PDFs)
 */
export async function convertPDFToImages(
  file: File,
  scale: number = 2.0
): Promise<PDFConversionResult> {
  const pdfjsLib = await loadPdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageCount = pdf.numPages;
  const images: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    images.push(dataUrl);
  }

  return { images, pageCount };
}

export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
