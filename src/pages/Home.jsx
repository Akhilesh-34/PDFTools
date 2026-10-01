import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <h2>Free Browser-Based PDF Tools</h2>
        <p>Merge, split, compress, and convert PDFs directly in your browser. 100% private and secure.</p>
      </section>
      
      <section className="tools-grid">
        <div className="tool-card">
          <h3>Merge PDFs</h3>
          <p>Combine multiple PDFs into a single document instantly.</p>
          <Link to="/merge" className="primary-btn" style={{textDecoration: 'none', display: 'inline-block', textAlign: 'center'}}>Open Tool</Link>
        </div>
        <div className="tool-card">
          <h3>Split PDF</h3>
          <p>Extract specific pages or split a PDF into multiple files.</p>
          <Link to="/split" className="primary-btn" style={{textDecoration: 'none', display: 'inline-block', textAlign: 'center'}}>Open Tool</Link>
        </div>
        <div className="tool-card">
          <h3>Compress PDF</h3>
          <p>Reduce the file size of your PDF while maintaining quality.</p>
          <Link to="/compress" className="primary-btn" style={{textDecoration: 'none', display: 'inline-block', textAlign: 'center'}}>Open Tool</Link>
        </div>
        <div className="tool-card">
          <h3>PDF ↔ Image</h3>
          <p>Convert your PDFs into high-quality JPG/PNG images or vice versa.</p>
          <Link to="/convert" className="primary-btn" style={{textDecoration: 'none', display: 'inline-block', textAlign: 'center'}}>Open Tool</Link>
        </div>
        <div className="tool-card">
          <h3>PDF ↔ Word</h3>
          <p>Extract text from PDFs to Word, or convert Word documents to PDF.</p>
          <Link to="/word" className="primary-btn" style={{textDecoration: 'none', display: 'inline-block', textAlign: 'center'}}>Open Tool</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
