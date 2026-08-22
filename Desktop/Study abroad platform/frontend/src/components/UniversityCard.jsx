import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const UniversityCard = ({ uni }) => {
  const { user, setUser } = useAuth();
  const isFav = user?.favorites?.some(f => f === uni._id || f?._id === uni._id);

  const toggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/auth/favorites/${uni._id}`);
      setUser(prev => ({ ...prev, favorites: res.data.favorites }));
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites ❤️');
    } catch {
      toast.error('Could not update favorites');
    }
  };

  const uniId = uni._id || uni.id;
  const fee = uni.fees ?? uni.fee ?? 0;
  const rank = uni.ranking || uni.rank;
  const minCgpa = uni.eligibility?.min_cgpa || uni.min_cgpa;
  const scholarshipInfo = uni.scholarships && typeof uni.scholarships === 'object' && !Array.isArray(uni.scholarships)
    ? uni.scholarships
    : { available: Array.isArray(uni.scholarships) ? uni.scholarships.length > 0 : false, details: '', coverage: '' };
  const hasScholarships = Boolean(scholarshipInfo.available || (Array.isArray(uni.scholarships) && uni.scholarships.length > 0));

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(99,102,241,0.15)' }}
      style={{ padding: '24px', borderRadius: '20px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>

      <button onClick={toggleFav}
        style={{ position: 'absolute', top: '16px', right: '16px', background: isFav ? '#fef2f2' : '#f8fafc', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        {isFav ? '❤️' : '🤍'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: '800', color: '#6366f1', background: '#eef2ff', padding: '3px 10px', borderRadius: '20px' }}>
          #{rank || 'N/A'} Global
        </span>
        {hasScholarships && (
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#d97706', background: '#fef3c7', padding: '3px 10px', borderRadius: '20px' }}>
            💰 Scholarships
          </span>
        )}
      </div>

      <h2 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: '19px', fontWeight: '800', lineHeight: '1.2', paddingRight: '40px' }}>
        {uni.name}
      </h2>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>📍 {uni.city}, {uni.country}</p>

      {uni.description && (
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {uni.description}
        </p>
      )}

      {hasScholarships && scholarshipInfo.details && (
        <p style={{ fontSize: '12px', color: '#b45309', marginBottom: '14px', fontWeight: '600' }}>
          {scholarshipInfo.details}
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '14px 0', borderTop: '1px solid #f8fafc', marginBottom: '16px' }}>
        <div>
          <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>Min CGPA</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>⭐ {minCgpa || 'N/A'}</span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>Annual Fee</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: fee === 0 ? '#6366f1' : '#059669' }}>
            {fee === 0 ? '🎁 Free' : `$${fee.toLocaleString()}`}
          </span>
        </div>
        {uni.eligibility?.ielts && (
          <div>
            <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>IELTS</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>📚 {uni.eligibility.ielts}+</span>
          </div>
        )}
        {uni.visa_time && (
          <div>
            <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>Visa Time</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>⏱ {uni.visa_time}</span>
          </div>
        )}
      </div>

      <Link to={`/university/${uniId}`}
        style={{ display: 'block', textAlign: 'center', padding: '11px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', borderRadius: '12px', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
        View Details →
      </Link>
    </motion.div>
  );
};

export default UniversityCard;
