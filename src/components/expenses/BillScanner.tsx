'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { scanReceipt, parseReceiptText, ParsedReceipt, ScanLanguage, SUPPORTED_LANGUAGES } from '@/lib/receiptParser';
import { convertPDFToImages, extractTextFromPDF, isPDFFile } from '@/lib/pdfUtils';
import { cn } from '@/lib/utils';

interface BillScannerProps {
  onScanComplete: (result: ParsedReceipt) => void;
}

export function BillScanner({ onScanComplete }: BillScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [currentPdfPage, setCurrentPdfPage] = useState(0);
  const [isPdf, setIsPdf] = useState(false);
  const [pdfHasText, setPdfHasText] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<ScanLanguage>('chi_sim');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const languageRef = useRef<ScanLanguage>(language);

  // Keep language ref in sync
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Auto-scan function that takes data directly
  const performAutoScan = useCallback(async (
    scanImage: string | null,
    scanPdfText: string | null,
    scanPdfHasText: boolean,
    scanIsPdf: boolean,
    scanPdfImages: string[]
  ) => {
    if (!scanImage && !scanPdfText) return;

    setIsScanning(true);
    setProgress(0);
    setError(null);

    try {
      const lang = languageRef.current;

      // If PDF has extractable text, use it directly (faster & more accurate)
      if (scanIsPdf && scanPdfHasText && scanPdfText) {
        setProgress(50);
        const result = parseReceiptText(scanPdfText, 95, lang);
        setProgress(100);
        onScanComplete({ ...result, scannedImage: scanImage || undefined });
        return;
      }

      // For images or scanned PDFs, use OCR
      if (scanIsPdf && scanPdfImages.length > 1) {
        // Multi-page scanned PDF
        let combinedText = '';
        let totalConfidence = 0;

        for (let i = 0; i < scanPdfImages.length; i++) {
          setProgress(Math.round((i / scanPdfImages.length) * 80));
          const pageResult = await scanReceipt(scanPdfImages[i], lang, () => {});
          combinedText += pageResult.rawText + '\n';
          totalConfidence += pageResult.confidence;
        }

        const result = parseReceiptText(combinedText, totalConfidence / scanPdfImages.length, lang);
        setProgress(100);
        onScanComplete({ ...result, scannedImage: scanPdfImages[0] });
      } else if (scanImage) {
        // Single image or single-page PDF
        const result = await scanReceipt(scanImage, lang, setProgress);
        onScanComplete({ ...result, scannedImage: scanImage });
      }
    } catch (err) {
      setError('Failed to scan receipt. Please try again or enter details manually.');
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  }, [onScanComplete]);

  const handleFile = useCallback(async (selectedFile: File) => {
    setError(null);
    setIsPdf(false);
    setPdfImages([]);
    setPdfText(null);
    setPdfHasText(false);
    setCurrentPdfPage(0);

    const isFilePdf = isPDFFile(selectedFile);

    // Validate file type
    if (!selectedFile.type.startsWith('image/') && !isFilePdf) {
      setError('Please select an image (JPG, PNG) or PDF file');
      return;
    }

    // Validate file size (max 20MB for PDFs, 10MB for images)
    const maxSize = isFilePdf ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`File size must be less than ${isFilePdf ? '20MB' : '10MB'}`);
      return;
    }

    setIsPdf(isFilePdf);

    if (isFilePdf) {
      setIsConverting(true);
      try {
        // First, try to extract text directly from PDF
        const textResult = await extractTextFromPDF(selectedFile);

        let extractedText: string | null = null;
        let hasText = false;
        if (textResult.hasText) {
          extractedText = textResult.text;
          hasText = true;
          setPdfText(extractedText);
          setPdfHasText(true);
        }

        // Also convert to images for preview
        const imageResult = await convertPDFToImages(selectedFile);
        const images = imageResult.images;
        setPdfImages(images);
        setImage(images[0]);
        setCurrentPdfPage(0);
        setIsConverting(false);

        // Auto-scan with the data we just extracted
        performAutoScan(images[0], extractedText, hasText, true, images);
      } catch (err) {
        setError('Failed to process PDF. Please try a different file.');
        console.error('PDF processing error:', err);
        setIsConverting(false);
      }
    } else {
      // Handle image file
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setImage(imageData);
        // Auto-scan immediately with the image data
        performAutoScan(imageData, null, false, false, []);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [performAutoScan]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const handlePdfPageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPdfPage > 0) {
      setCurrentPdfPage(currentPdfPage - 1);
      setImage(pdfImages[currentPdfPage - 1]);
    } else if (direction === 'next' && currentPdfPage < pdfImages.length - 1) {
      setCurrentPdfPage(currentPdfPage + 1);
      setImage(pdfImages[currentPdfPage + 1]);
    }
  };

  const handleScan = async () => {
    if (!image && !pdfText) return;

    setIsScanning(true);
    setProgress(0);
    setError(null);

    try {
      // If PDF has extractable text, use it directly (faster & more accurate)
      if (isPdf && pdfHasText && pdfText) {
        setProgress(50);
        const result = parseReceiptText(pdfText, 95, language); // High confidence for direct extraction
        setProgress(100);
        onScanComplete({ ...result, scannedImage: image || undefined });
        return;
      }

      // For images or scanned PDFs, use OCR
      if (isPdf && pdfImages.length > 1) {
        // Multi-page scanned PDF
        let combinedText = '';
        let totalConfidence = 0;

        for (let i = 0; i < pdfImages.length; i++) {
          setProgress(Math.round((i / pdfImages.length) * 80));
          const pageResult = await scanReceipt(pdfImages[i], language, () => {});
          combinedText += pageResult.rawText + '\n';
          totalConfidence += pageResult.confidence;
        }

        const result = parseReceiptText(combinedText, totalConfidence / pdfImages.length, language);
        setProgress(100);
        onScanComplete({ ...result, scannedImage: pdfImages[0] });
      } else if (image) {
        // Single image or single-page PDF
        const result = await scanReceipt(image, language, setProgress);
        onScanComplete({ ...result, scannedImage: image });
      }
    } catch (err) {
      setError('Failed to scan receipt. Please try again or enter details manually.');
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPdfImages([]);
    setPdfText(null);
    setPdfHasText(false);
    setCurrentPdfPage(0);
    setIsPdf(false);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Receipt Language
        </label>
        <div className="flex gap-2 flex-wrap">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                language === lang.code
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {!image && !isConverting ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Upload a receipt or bill
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports JPG, PNG, HEIC, and PDF up to 20MB
              </p>
            </div>
          </div>
        </div>
      ) : isConverting ? (
        <div className="border-2 border-dashed rounded-xl p-8 text-center border-gray-300">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-sm font-medium text-gray-900">Processing PDF...</p>
            <p className="text-xs text-gray-500">Extracting text and generating preview</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-gray-100">
            {/* PDF indicator */}
            {isPdf && (
              <div className="absolute top-2 left-2 z-10 flex gap-2">
                <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  PDF
                </span>
                {pdfHasText && (
                  <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-md">
                    Text Detected
                  </span>
                )}
              </div>
            )}

            <div className="relative w-full" style={{ paddingBottom: '75%' }}>
              <Image
                src={image!}
                alt="Receipt preview"
                fill
                className="object-contain"
              />
            </div>

            {/* PDF page navigation */}
            {isPdf && pdfImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 rounded-lg px-3 py-1.5 shadow">
                <button
                  onClick={() => handlePdfPageChange('prev')}
                  disabled={currentPdfPage === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPdfPage + 1} of {pdfImages.length}
                </span>
                <button
                  onClick={() => handlePdfPageChange('next')}
                  disabled={currentPdfPage === pdfImages.length - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                  <p className="text-sm font-medium text-gray-900">
                    {pdfHasText ? 'Extracting data...' : isPdf && pdfImages.length > 1 ? 'Scanning all pages...' : 'Scanning receipt...'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                  <div className="mt-2 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {!pdfHasText && (
                    <p className="text-xs text-gray-400 mt-2">
                      Language: {SUPPORTED_LANGUAGES.find(l => l.code === language)?.label}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Info about PDF text detection */}
          {isPdf && pdfHasText && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-2 items-start">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-800">
                  This PDF contains selectable text. Data will be extracted directly for better accuracy.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={isScanning}
              className="flex-1"
            >
              Choose Different File
            </Button>
            <Button
              onClick={handleScan}
              disabled={isScanning}
              isLoading={isScanning}
              className="flex-1"
            >
              {isScanning
                ? 'Processing...'
                : pdfHasText
                  ? 'Extract Data'
                  : isPdf && pdfImages.length > 1
                    ? `Scan All ${pdfImages.length} Pages`
                    : 'Scan Receipt'}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-amber-800">
            <p className="font-medium">Supported formats:</p>
            <ul className="mt-1 list-disc list-inside text-amber-700 space-y-0.5">
              <li>Images: JPG, PNG, HEIC (uses OCR scanning)</li>
              <li>PDF with text: Direct extraction (faster & more accurate)</li>
              <li>Scanned PDF: Uses OCR on all pages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
