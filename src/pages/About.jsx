import React from 'react';

const About = () => {
  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>About Pdf Tools</h2>
        <p style={{ color: 'var(--text-secondary, var(--muted-color))', fontSize: '1.2rem', lineHeight: 1.6 }}>
          These tools are processed entirely locally on your device for maximum speed and privacy.
        </p>
      </div>
    </div>
  );
};

export default About;
