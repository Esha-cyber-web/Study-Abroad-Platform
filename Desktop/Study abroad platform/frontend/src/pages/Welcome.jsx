import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Typed from 'typed.js';

const Welcome = () => {
  const navigate = useNavigate();
  const el = useRef(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: ['Instantly Check Eligibility.', 'Personalized Predictions.', 'Global Education Journey.'],
      typeSpeed: 50,
      backSpeed: 30,
      loop: true,
      backDelay: 2000,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <div style={fullScreenStyle}>
      {/* 1. ANIMATED PARTICLE BACKGROUND */}
      <div style={particleContainerStyle}>
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            style={particleStyle(i)}
            animate={{
              y: [0, -window.innerHeight],
              x: [0, (Math.random() - 0.5) * 150],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 8,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={contentAreaStyle}
      >
        {/* Floating Globe - Smaller for better fit */}
        <motion.div
          animate={{ rotateY: 360, y: [0, -8, 0] }}
          transition={{ 
            rotateY: { duration: 15, repeat: Infinity, ease: "linear" },
            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }}
          style={globeStyle}
        >
          🌍
        </motion.div>

        {/* WELCOME SECTION */}
        <div style={{ marginBottom: '15px' }}>
          <h3 style={welcomeTextStyle}>Welcome to</h3>
          <h1 style={brandStyle}>StudyAbroad.ai</h1>
        </div>

        {/* Title and Typing Effect */}
        <h2 style={titleStyle}>
          Your Future, <br />
          <span style={highlightStyle} ref={el}></span>
        </h2>
        
        <p style={subtitleStyle}>
          Skip the guesswork. Get data-driven university matches and application guidance in seconds.
        </p>

        {/* Animated Button - Centered & Visible */}
        <motion.button
          onClick={() => navigate('/login')}
          style={btnStyle}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)',
            letterSpacing: '1px'
          }}
          whileTap={{ scale: 0.95 }}
        >
          Begin Your Journey →
        </motion.button>
      </motion.div>
    </div>
  );
};

// --- Updated Styles for Better Frame Fit ---
const fullScreenStyle = {
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: '#0a0f1e', 
  color: 'white',
  fontFamily: "'Montserrat', sans-serif",
  position: 'relative',
  overflow: 'hidden',
};

const particleContainerStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: 1,
};

const particleStyle = (i) => ({
  position: 'absolute',
  bottom: 0,
  left: `${Math.random() * 100}%`,
  width: `${Math.random() * 3 + 2}px`,
  height: `${Math.random() * 3 + 2}px`,
  background: i % 2 === 0 ? '#6366f1' : '#a855f7',
  borderRadius: '50%',
  opacity: 0,
});

const contentAreaStyle = {
  textAlign: 'center',
  zIndex: 10,
  width: '90%',
  maxWidth: '750px',
  maxHeight: '90vh', // Ensures content doesn't bleed out
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

const globeStyle = {
  fontSize: '60px', // Reduced from 80px for better vertical space
  marginBottom: '15px',
  perspective: '1000px',
};

const welcomeTextStyle = {
  fontSize: 'clamp(14px, 2vw, 18px)',
  fontWeight: '500',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '4px',
  marginBottom: '2px'
};

const brandStyle = {
  fontSize: 'clamp(32px, 6vw, 50px)',
  fontWeight: '900',
  background: 'linear-gradient(to right, #6366f1, #a855f7)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  margin: '0',
};

const titleStyle = {
  fontSize: 'clamp(24px, 5vw, 38px)',
  fontWeight: '800',
  lineHeight: '1.2',
  marginBottom: '15px',
  color: '#f8fafc'
};

const highlightStyle = {
  color: '#a855f7',
  textShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
};

const subtitleStyle = {
  fontSize: 'clamp(14px, 2.5vw, 17px)',
  maxWidth: '500px',
  lineHeight: '1.5',
  color: '#94a3b8',
  marginBottom: '35px',
};

const btnStyle = {
  padding: '16px 48px',
  borderRadius: '50px',
  border: 'none',
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '18px',
  transition: '0.3s all ease',
  boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
};

export default Welcome;