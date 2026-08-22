import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Footer from '../components/Footer';

const Scholarships = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ cgpa: user?.cgpa || '', country: 'All', fieldOfStudy: '', budget: user?.budget || '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ai/match-scholarships', form);
      setResults(res.data.data || []);
      setSearched(true);
      toast.success(`Found ${res.data.data?.length || 0} matching scholarships!`);
    } catch (err) {
      toast.error('Failed to fetch scholarships');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#1e1b4b)', padding: '48px 40px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: 'white', margin: '0 0 8px' }}>AI Scholarship Matcher</h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>Discover scholarships you qualify for — matched by AI to your profile</p>
        </motion.div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>Your Profile</h2>
            <form onSubmit={handleMatch}>
              {[
                { key: 'cgpa', label: 'CGPA', placeholder: 'e.g. 3.4', type: 'number', step: '0.01' },
                { key: 'fieldOfStudy', label: 'Field of Study', placeholder: 'e.g. Computer Science', type: 'text' },
                { key: 'budget', label: 'Annual Budget ($)', placeholder: 'e.g. 20000', type: 'number' },
              ].map(({ key, label, placeholder, type, step }) => (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</label>
                  <input type={type} placeholder={placeholder} step={step} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              ))}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase' }}>Target Country</label>
                <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', background: 'white' }}>
                  {['All', 'UK', 'USA', 'Germany', 'Canada', 'Australia', 'Pakistan'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? '🤖 Matching...' : '💰 Find My Scholarships'}
              </motion.button>
            </form>
          </motion.div>

          {/* Results */}
          <div>
            {!searched ? (
              <div style={{ background: 'white', borderRadius: '20px', padding: '60px 40px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎓</div>
                <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Find Your Funding</h3>
                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>Our AI will match you with scholarships based on your academic profile and target country.</p>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>{results.length} Scholarships Found</h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {results.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '800', color: '#1e293b' }}>{s.name}</h3>
                          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>📍 {s.country} • {s.fieldOfStudy || 'Any Field'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: '900', color: '#d97706' }}>
                            {s.currency} {s.amount?.toLocaleString()}
                          </div>
                          {s.matchScore && (
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#d97706', background: '#fef3c7', padding: '2px 10px', borderRadius: '20px' }}>
                              {s.matchScore}% Match
                            </span>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px', lineHeight: '1.5' }}>{s.eligibilityCriteria}</p>
                      {s.reason && <p style={{ fontSize: '12px', color: '#0369a1', background: '#f0f9ff', padding: '8px 12px', borderRadius: '8px', margin: '0 0 12px' }}>💡 {s.reason}</p>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {s.deadline && <span style={{ fontSize: '12px', color: '#64748b' }}>📅 Deadline: {new Date(s.deadline).toLocaleDateString()}</span>}
                        {s.link && (
                          <a href={s.link} target="_blank" rel="noopener noreferrer"
                            style={{ padding: '6px 16px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', borderRadius: '20px', textDecoration: 'none', fontSize: '12px', fontWeight: '700' }}>
                            Apply Now →
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Scholarships;
