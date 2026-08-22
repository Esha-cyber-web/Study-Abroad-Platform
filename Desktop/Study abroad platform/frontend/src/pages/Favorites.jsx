import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import UniversityCard from '../components/UniversityCard';
import Footer from '../components/Footer';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/auth/profile');
        setFavorites(res.data.data?.favorites || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#1e1b4b)', padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', margin: '0 0 8px' }}>❤️ Saved Universities</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>{favorites.length} universities saved</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '24px' }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ height: '280px', borderRadius: '20px', background: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🤍</div>
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No saved universities yet</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Click the heart icon on any university card to save it here</p>
            <Link to="/home" style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', borderRadius: '25px', textDecoration: 'none', fontWeight: '700' }}>
              Browse Universities →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '24px' }}>
            {favorites.map((uni, i) => (
              <motion.div key={uni._id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <UniversityCard uni={uni} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;
