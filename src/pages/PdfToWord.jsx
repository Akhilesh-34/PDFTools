import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import { PDFDocument, rgb } from 'pdf-lib';
import mammoth from 'mammoth';
import FileUploader from '../components/FileUploader';
import PdfThumbnail from '../components/PdfThumbnail';
import './PdfTools.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function PdfToWord() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState('pdf2word'); // 'pdf2word' or 'word2pdf'

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handlePdfToWord = async () => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = [];
      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text items and try to maintain some basic spacing
        let lastY = null;
        let line = "";
        
        for (const item of textContent.items) {
          // If the Y coordinate changes significantly, it's a new line
          if (lastY !== null && Math.abs(lastY - item.transform[5]) > 5) {
            fullText.push(line);
            line = "";
          }
          line += item.str;
          lastY = item.transform[5];
        }
        if (line) fullText.push(line);
        
        // Add a page break or blank line between pages
        fullText.push(""); 
        
        setProgress(Math.round((i / numPages) * 100));
      }

      // Generate DOCX
      const paragraphs = fullText.map(line => 
        new Paragraph({
          children: [new TextRun(line)]
        })
      );

      const doc = new DocxDocument({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.pdf', '')}-converted.docx`;
      a.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      console.error("Conversion error:", error);
      alert("An error occurred while extracting text from the PDF.");
    }
  };

  const handleWordToPdf = async () => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      // Sanitize text to remove characters not supported by standard WinAnsiEncoding in pdf-lib
      const text = result.value.replace(/[^\x00-\x7F]/g, " ");

      setProgress(50);

      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      const fontSize = 12;
      const margin = 50;
      let y = height - margin;

      const lines = text.split('\n');

      for (const line of lines) {
        if (y < margin) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
        // Very basic text rendering
        // In a real app we would word-wrap the text
        page.drawText(line.substring(0, 100), {
          x: margin,
          y,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        y -= fontSize * 1.5;
      }

      setProgress(100);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace('.docx', '').replace('.doc', '')}-converted.pdf`;
      a.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (error) {
      console.error("Conversion error:", error);
      alert("An error occurred while creating PDF from the Word document.");
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);

    if (mode === 'pdf2word') {
      await handlePdfToWord();
    } else {
      await handleWordToPdf();
    }

    setIsProcessing(false);
    setProgress(0);
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h2>{mode === 'pdf2word' ? 'PDF to Word' : 'Word to PDF'}</h2>
        <p>
          {mode === 'pdf2word' 
            ? 'Extract all readable text from your PDF into an editable Microsoft Word (.docx) file.'
            : 'Convert your Microsoft Word (.docx) text into a clean PDF document directly in your browser.'}
        </p>
        
        <div className="mode-switch" style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '24px', background: 'var(--background-color)', padding: '6px', borderRadius: '12px', maxWidth: '300px', margin: '24px auto 0' }}>
          <button 
            className={`mode-btn ${mode === 'pdf2word' ? 'active' : ''}`}
            onClick={() => toggleMode('pdf2word')}
            style={{ flex: 1, padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', background: mode === 'pdf2word' ? 'var(--primary-color)' : 'transparent', color: mode === 'pdf2word' ? 'white' : 'var(--text-color)', boxShadow: mode === 'pdf2word' ? '0 4px 10px rgba(255,155,81,0.3)' : 'none' }}
          >
            PDF to Word
          </button>
          <button 
            className={`mode-btn ${mode === 'word2pdf' ? 'active' : ''}`}
            onClick={() => toggleMode('word2pdf')}
            style={{ flex: 1, padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', background: mode === 'word2pdf' ? 'var(--primary-color)' : 'transparent', color: mode === 'word2pdf' ? 'white' : 'var(--text-color)', boxShadow: mode === 'word2pdf' ? '0 4px 10px rgba(255,155,81,0.3)' : 'none' }}
          >
            Word to PDF
          </button>
        </div>
      </div>

      <div className="pdf-workspace">
        {!file ? (
          <div className="upload-section">
            <FileUploader 
              onFileSelect={handleFileSelect} 
              accept={mode === 'pdf2word' ? "application/pdf" : ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"} 
              multiple={false} 
              title={mode === 'pdf2word' ? "Drag & Drop PDF File Here" : "Drag & Drop Word File (.docx) Here"}
            />
          </div>
        ) : (
          <div className="controls-panel" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            <div style={{ flex: '0 0 200px' }}>
              {mode === 'pdf2word' ? (
                <PdfThumbnail file={file} width={200} />
              ) : (
                <div style={{ width: 200, height: 280, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid #ddd' }}>
                  <span style={{ color: '#888', fontSize: '14px', fontWeight: 'bold' }}>DOCX File</span>
                </div>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <h3>{file.name}</h3>
              <p style={{ color: 'var(--muted-color)', marginBottom: '24px' }}>
                {mode === 'pdf2word' 
                  ? 'Note: This tool extracts raw text. Images, complex tables, and highly stylized formatting will not be preserved in the Word document.'
                  : 'Note: This tool converts raw text from the DOCX file to a PDF. Complex formatting and images may not be preserved.'}
              </p>
              
              {isProcessing && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>{mode === 'pdf2word' ? 'Extracting Text...' : 'Creating PDF...'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--background-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary-color)', transition: 'width 0.2s' }}></div>
                  </div>
                </div>
              )}

              <div className="actions" style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="primary-btn" 
                  onClick={handleConvert} 
                  disabled={isProcessing}
                  style={{ flex: 1, padding: '16px' }}
                >
                  {isProcessing ? 'Converting...' : (mode === 'pdf2word' ? 'Convert to Word' : 'Convert to PDF')}
                </button>
                <button className="secondary-btn" onClick={() => setFile(null)} disabled={isProcessing}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfToWord;
