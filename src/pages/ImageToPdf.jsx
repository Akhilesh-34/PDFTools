import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FileUploader from '../components/FileUploader';
import './PdfTools.css';

function ImageToPdf() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelect = (newFiles) => {
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

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        
        if (file.type === 'image/jpeg') {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          continue; // skip unsupported
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `images-to-pdf-${Date.now()}.pdf`;
      a.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Conversion error:", error);
      alert("An error occurred while converting images to PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h2>Images to PDF</h2>
        <p>Convert JPG and PNG images into a single PDF document.</p>
      </div>

      <div className="pdf-workspace">
        <div className="upload-section">
          <FileUploader 
            onFileSelect={handleFilesSelect} 
            accept="image/jpeg, image/png" 
            multiple={true} 
            title="Drag & Drop Images Here"
          />
        </div>

        {files.length > 0 && (
          <div className="controls-panel">
            <h3>Selected Images ({files.length})</h3>
            
            <ul className="file-list">
              {files.map((file, index) => (
                <li key={index} className="file-list-item">
                  <span className="file-name">{file.name}</span>
                  <div className="file-actions">
                    <button className="icon-btn" onClick={() => moveUp(index)} disabled={index === 0}>↑</button>
                    <button className="icon-btn" onClick={() => moveDown(index)} disabled={index === files.length - 1}>↓</button>
                    <button className="remove-btn" onClick={() => removeFile(index)}>×</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="actions" style={{marginTop: '24px'}}>
              <button 
                className="primary-btn" 
                onClick={handleConvert} 
                disabled={isProcessing}
                style={{ width: '100%', padding: '16px' }}
              >
                {isProcessing ? 'Converting...' : 'Convert to PDF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageToPdf;
