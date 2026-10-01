import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import PdfMerger from './pages/PdfMerger';
import PdfSplitter from './pages/PdfSplitter';
import PdfCompressor from './pages/PdfCompressor';
import ImageToPdf from './pages/ImageToPdf';
import PdfToWord from './pages/PdfToWord';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import About from './pages/About';
import './App.css';
import './styles/variables.css';
import './styles/global.css';

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="app-container">
      <header className="app-header">
        
        {/* Left Side: Logo */}
        <div className="logo header-left">

            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>PixelTools</h1>
              <span className="subtitle">PDF Tools</span>
            </Link>
          
        </div>
        
        {/* Center: Navigation Links */}
        <div className="header-center">
          {isHome ? (
            <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <Link to="/about">About</Link>
            </nav>
          ) : (
            <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>

            
            <Link style={{ fontSize: '0.85rem' }} to="/merge">Merge PDF</Link>
            <Link style={{ fontSize: '0.85rem' }} to="/split">Split PDF</Link>
            <Link style={{ fontSize: '0.85rem' }} to="/compress">Compress</Link>
            <Link style={{ fontSize: '0.85rem' }} to="/convert">Images to PDF</Link>
            <Link style={{ fontSize: '0.85rem' }} to="/word">PDF ↔ Word</Link>
          
            </nav>
          )}
        </div>

        {/* Right Side: Back Button or Other Tools Dropdown */}
        <div className="header-right">
          {isHome ? (
            <div 
              style={{ position: 'relative' }} 
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button 
                className="nav-dropdown-btn"
                style={{ fontSize: '1rem', padding: '8px 14px' }}
              >
                Other Tools <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </button>

              {dropdownOpen && (
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  marginTop: '0', 
                  background: 'var(--surface, var(--surface-color))', 
                  border: '1px solid var(--border, var(--border-color))', 
                  borderRadius: '16px', 
                  padding: '0.5rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  minWidth: '160px', 
                  boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.1))', 
                  zIndex: 50 
                }}>
                  <a href="https://design-tools-one.vercel.app" className="nav-dropdown-item" style={{ justifyContent: 'flex-start' }}>Design Tools</a>
                  <a href="https://image-tools-mauve.vercel.app" className="nav-dropdown-item" style={{ justifyContent: 'flex-start' }}>Image Tools</a>
                  <a href="https://career-tools-phi.vercel.app" className="nav-dropdown-item" style={{ justifyContent: 'flex-start' }}>Career Tools</a>
                  <a href="https://playground-tools-seven.vercel.app" className="nav-dropdown-item" style={{ justifyContent: 'flex-start' }}>Playground</a>
                </div>
              )}
            </div>
          ) : (
            <Link to="/" className="primary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.4rem 1rem', fontSize: '0.85rem', boxShadow: 'none' }}>
              <ArrowLeft size={16} /> Back
            </Link>
          )}
        </div>
      </header>

      <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/merge" element={<PdfMerger />} />
            <Route path="/split" element={<PdfSplitter />} />
            <Route path="/compress" element={<PdfCompressor />} />
            <Route path="/convert" element={<ImageToPdf />} />
            <Route path="/word" element={<PdfToWord />} />
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '100px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src="/Wolf-404.svg" alt="404 Error" style={{ width: '250px', maxWidth: '100%', marginBottom: '2rem' }} />
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text, var(--text-color, #333))' }}>Oops! Page Not Found</h2>
                <p style={{ marginBottom: '2rem', color: 'var(--text-light, var(--text-secondary, #666))' }}>The page you are looking for doesn't exist or has been moved.</p>
                <Link to="/" className="primary-btn" style={{ padding: '0.8rem 1.5rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Return Home</Link>
              </div>
            } />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2026 PixelTools. Processed locally, never uploaded.</p>
        </footer>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
