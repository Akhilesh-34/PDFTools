import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileUploader from '../components/FileUploader';
import PdfThumbnail from '../components/PdfThumbnail';
import './PdfTools.css';
import './VisualSplit.css';

function PdfSplitter() {
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (selectedFile) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdf.getPageCount());
      setFile(selectedFile);
      setSelectedPages(new Set());
    } catch (e) {
      alert("Invalid PDF file.");
      setFile(null);
    }
  };

  const togglePage = (pageIndex) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pageIndex)) {
        newSet.delete(pageIndex);
      } else {
        newSet.add(pageIndex);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const all = new Set();
    for (let i = 0; i < totalPages; i++) all.add(i);
    setSelectedPages(all);
  };

  const clearSelection = () => {
    setSelectedPages(new Set());
  };

  const handleSplit = async () => {
    if (!file || selectedPages.size === 0) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      const sortedIndices = Array.from(selectedPages).sort((a, b) => a - b);
      const copiedPages = await newPdf.copyPages(originalPdf, sortedIndices);
      
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted-${file.name}`;
      a.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Split error:", error);
      alert("An error occurred while extracting pages.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="tool-header">
        <h2>Visual PDF Splitter</h2>
        <p>Simply click on the pages you want to extract and hit download.</p>
      </div>

      <div className="pdf-workspace" style={{ maxWidth: '100%' }}>
        {!file ? (
          <div className="upload-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <FileUploader 
              onFileSelect={handleFileSelect} 
              accept="application/pdf" 
              multiple={false} 
              title="Drag & Drop PDF File Here"
            />
          </div>
        ) : (
          <div className="visual-split-container">
            <div className="split-sidebar">
              <div className="controls-panel" style={{ position: 'sticky', top: '100px' }}>
                <h3>{file.name}</h3>
                <p>Selected: <strong>{selectedPages.size} / {totalPages}</strong> pages</p>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', marginTop: '16px' }}>
                  <button className="secondary-btn" onClick={selectAll} style={{flex: 1, padding: '8px', fontSize: '0.9rem'}}>Select All</button>
                  <button className="secondary-btn" onClick={clearSelection} style={{flex: 1, padding: '8px', fontSize: '0.9rem'}}>Clear</button>
                </div>

                <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    className="primary-btn" 
                    onClick={handleSplit} 
                    disabled={selectedPages.size === 0 || isProcessing}
                    style={{ width: '100%', padding: '16px' }}
                  >
                    {isProcessing ? 'Processing...' : 'Extract Selected Pages'}
                  </button>
                  <button className="secondary-btn" onClick={() => setFile(null)}>Start Over</button>
                </div>
              </div>
            </div>

            <div className="split-grid-area">
              <div className="pages-grid">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <div key={index} className="page-thumbnail-wrapper">
                    <PdfThumbnail 
                      file={file}
                      pageNumber={index + 1}
                      width={160}
                      selected={selectedPages.has(index)}
                      onClick={() => togglePage(index)}
                    />
                    <div className="page-number">Page {index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfSplitter;
