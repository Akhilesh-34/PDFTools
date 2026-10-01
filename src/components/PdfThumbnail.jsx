import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up the worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function PdfThumbnail({ file, pageNumber = 1, width = 150, onClick, selected = false, className = '' }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let renderTask = null;
    let loadingTask = null;
    let isMounted = true;

    const renderPage = async () => {
      if (!file) return;
      setLoading(true);
      setError(false);
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (!isMounted) return;
        
        loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        if (!isMounted) return;
        
        const actualPageNumber = Math.min(pageNumber, pdf.numPages);
        const page = await pdf.getPage(actualPageNumber);
        if (!isMounted) return;

        const viewport = page.getViewport({ scale: 1.0 });
        const scale = width / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        if (canvasRef.current && isMounted) {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: scaledViewport,
          };
          renderTask = page.render(renderContext);
          await renderTask.promise;
        }
      } catch (err) {
        if (isMounted && err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering PDF thumbnail:', err);
          setError(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      try {
        if (renderTask) renderTask.cancel();
      } catch(e) {}
      try {
        if (loadingTask) loadingTask.destroy();
      } catch(e) {}
    };
  }, [file, pageNumber, width]);

  if (!file) return null;

  const baseStyle = {
    position: 'relative',
    width: `${width}px`,
    cursor: onClick ? 'pointer' : 'default',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: selected ? '0 0 0 4px var(--primary-color)' : '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: `${width * 1.4}px` // approximate A4 ratio
  };

  return (
    <div 
      className={`pdf-thumbnail ${className}`} 
      style={baseStyle} 
      onClick={onClick}
    >
      {loading && <div style={{ position: 'absolute', color: 'var(--muted-color)' }}>Loading...</div>}
      {error && <div style={{ position: 'absolute', color: 'red' }}>Error</div>}
      <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', opacity: loading ? 0 : 1, transition: 'opacity 0.3s' }} />
      {selected && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'var(--primary-color)',
          color: 'white',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          ✓
        </div>
      )}
    </div>
  );
}

export default PdfThumbnail;
