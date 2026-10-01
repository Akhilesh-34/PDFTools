import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileUploader from '../components/FileUploader';
import PdfThumbnail from '../components/PdfThumbnail';
import './PdfTools.css'; // Shared CSS for PDF tools

function PdfMerger() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelect = (newFiles) => {
    // Append new files to existing ones
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setFiles(newFiles);
  };

  const moveDown = (index) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `merged-document-${Date.now()}.pdf`;
      a.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("An error occurred while merging the PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h2>Merge PDFs</h2>
        <p>Combine multiple PDF files into one single document securely in your browser.</p>
      </div>

      <div className="pdf-workspace">
        <div className="upload-section">
          <FileUploader 
            onFileSelect={handleFilesSelect} 
            accept="application/pdf" 
            multiple={true} 
            title="Drag & Drop PDF Files Here"
          />
        </div>

        {files.length > 0 && (
          <div className="controls-panel">
            <h3>Selected Files ({files.length})</h3>
            
            <ul className="file-list">
              {files.map((file, index) => {
                const uniqueKey = `${file.name}-${file.size}-${index}`;
                return (
                <li key={uniqueKey} className="file-list-item" style={{ alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '16px', flex: 1, overflow: 'hidden' }}>
                    <PdfThumbnail file={file} width={60} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px', overflow: 'hidden' }}>
                      <span className="file-name" style={{ maxWidth: '100%' }}>{file.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted-color)' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <div className="file-actions" style={{ alignSelf: 'center' }}>
                    <button className="icon-btn" onClick={() => moveUp(index)} disabled={index === 0}>↑</button>
                    <button className="icon-btn" onClick={() => moveDown(index)} disabled={index === files.length - 1}>↓</button>
                    <button className="remove-btn" onClick={() => removeFile(index)}>×</button>
                  </div>
                </li>
                );
              })}
            </ul>

            <div className="actions" style={{marginTop: '24px'}}>
              <button 
                className="primary-btn" 
                onClick={handleMerge} 
                disabled={files.length < 2 || isProcessing}
                style={{ width: '100%', padding: '16px' }}
              >
                {isProcessing ? 'Merging...' : (files.length < 2 ? 'Add at least 2 files' : 'Merge & Download')}
              </button>
            </div>
            
            <p className="privacy-note">Your files never leave your device. Processed locally.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfMerger;
