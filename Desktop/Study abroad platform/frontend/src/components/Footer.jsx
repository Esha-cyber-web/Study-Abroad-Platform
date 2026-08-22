// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      padding: '20px', 
      borderTop: '1px solid var(--border)', 
      fontSize: '14px', 
      color: 'var(--text)',
      textAlign: 'center',
      marginTop: 'auto' 
    }}>
      <p>&copy; 2026 Study Abroad Platform | Esha Liaqat</p>
    </footer>
  );
};

export default Footer;