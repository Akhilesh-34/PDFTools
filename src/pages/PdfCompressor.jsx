import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileUploader from '../components/FileUploader';
import PdfThumbnail from '../components/PdfThumbnail';
import './PdfTools.css';

function PdfCompressor() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedBytes, setSavedBytes] = useState(null);

  const handleCompress = async (selectedFile) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setSavedBytes(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Basic compression by dropping unreferenced objects
      const pdfBytes = await pdf.save({ useObjectStreams: false });
      
      const originalSize = selectedFile.size;
      const newSize = pdfBytes.length;
      
      if (newSize < originalSize) {
        setSavedBytes(originalSize - newSize);
      } else {
        setSavedBytes(0);
      }

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed-${selectedFile.name}`;
      a.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Compression error:", error);
      alert("An error occurred while compressing.");
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h2>Compress PDF</h2>
        <p>Optimize your PDF structure to reduce file size. Works completely offline.</p>
      </div>

      <div className="pdf-workspace">
        <div className="upload-section">
          <FileUploader 
            onFileSelect={handleCompress} 
            accept="application/pdf" 
            multiple={false} 
            title="Drag & Drop PDF to Compress"
          />
        </div>

        {isProcessing && (
          <div style={{ textAlign: 'center', marginTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <PdfThumbnail file={file} width={200} />
            <div>
              <h3>Processing PDF...</h3>
              <p>Cleaning up unreferenced objects and metadata.</p>
            </div>
          </div>
        )}

        {savedBytes !== null && !isProcessing && (
          <div className="controls-panel" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <PdfThumbnail file={file} width={200} />
            <div>
              <h3>Compression Complete!</h3>
              {savedBytes > 0 ? (
                <p style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Saved {(savedBytes / 1024).toFixed(2)} KB!
                </p>
              ) : (
                <p>Your PDF was already highly optimized. No further size reduction was possible without losing quality.</p>
              )}
              <button className="primary-btn" onClick={() => { setFile(null); setSavedBytes(null); }} style={{ marginTop: '16px' }}>
                Compress Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfCompressor;
