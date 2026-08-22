import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Footer from '../components/Footer';
import { fetchCountriesData } from '../services/countriesAPI';

const INITIAL_COUNTRIES = ['UK', 'USA', 'Germany', 'Canada', 'Australia', 'Netherlands', 'Singapore', 'Sweden', 'Norway', 'France'];

const CountryCompare = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(['UK', 'Germany']);
  const [program, setProgram] = useState('');
  const [budget, setBudget] = useState(user?.budget || '');
  const [cgpa, setCgpa] = useState(user?.cgpa || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flags, setFlags] = useState({});

  React.useEffect(() => {
    const loadFlags = async () => {
      const countryData = await fetchCountriesData(INITIAL_COUNTRIES);
      const flagMap = {};
      for (const [name, info] of Object.entries(countryData)) {
        flagMap[name] = info.flag;
      }
      setFlags(flagMap);
    };
    loadFlags();
  }, []);

  const toggleCountry = (c) => {
    if (selected.includes(c)) {
      if (selected.length > 2) setSelected(selected.filter(x => x !== c));
      else toast('Select at least 2 countries', { icon: 'ℹ️' });
    } else {
      if (selected.length >= 4) return toast.error('Compare up to 4 countries at once');
      setSelected([...selected, c]);
    }
  };

  const handleCompare = async () => {
    if (selected.length < 2) return toast.error('Select at least 2 countries');
    setLoading(true);
    try {
      const res = await api.post('/ai/compare-countries', { countries: selected, program, budget, cgpa });
      setData(res.data.data?.comparison || []);
      toast.success('Comparison ready!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) => s >= 80 ? '#22c55e' : s >= 65 ? '#6366f1' : s >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#1e1b4b)', padding: '48px 40px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌍</div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: 'white', margin: '0 0 8px' }}>AI Country Comparison</h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>Compare study destinations side-by-side — costs, visas, jobs, and quality of life</p>
        </motion.div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Controls */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>Select Countries to Compare (2-4)</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {INITIAL_COUNTRIES.map(c => (
              <button key={c} onClick={() => toggleCountry(c)}
                style={{ padding: '8px 18px', borderRadius: '25px', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: '0.2s',
                  background: selected.includes(c) ? 'linear-gradient(135deg,#6366f1,#a855f7)' : '#f1f5f9',
                  color: selected.includes(c) ? 'white' : '#64748b',
                  boxShadow: selected.includes(c) ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}>
                {flags[c] || '🌍'} {c}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {[
              { label: 'Program / Field', value: program, setter: setProgram, placeholder: 'e.g. Computer Science' },
              { label: 'Annual Budget ($)', value: budget, setter: setBudget, placeholder: 'e.g. 25000', type: 'number' },
              { label: 'Your CGPA', value: cgpa, setter: setCgpa, placeholder: 'e.g. 3.4', type: 'number' },
            ].map(({ label, value, setter, placeholder, type }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</label>
                <input type={type || 'text'} placeholder={placeholder} value={value} onChange={e => setter(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            ))}
          </div>

          <motion.button onClick={handleCompare} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '14px 40px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? '🤖 Comparing...' : `⚡ Compare ${selected.join(' vs ')}`}
          </motion.button>
        </div>

        {/* Results */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selected.length}, 1fr)`, gap: '16px' }}>
            {selected.map(c => <div key={c} style={{ height: '400px', borderRadius: '20px', background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />)}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        )}

        <AnimatePresence>
          {data && data.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Score Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: '16px', marginBottom: '24px' }}>
                {data.map((c, i) => (
                  <motion.div key={c.country} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    style={{ background: 'white', borderRadius: '20px', padding: '24px', textAlign: 'center', border: `2px solid ${scoreColor(c.overallScore)}30`, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>{flags[c.country] || '🌍'}</div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>{c.country}</h3>
                    <div style={{ fontSize: '36px', fontWeight: '900', color: scoreColor(c.overallScore), marginBottom: '4px' }}>{c.overallScore}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>Overall Score / 100</div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${c.overallScore}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                        style={{ height: '100%', background: scoreColor(c.overallScore), borderRadius: '3px' }} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Detail Comparison Table */}
              <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Detailed Comparison</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Criteria</th>
                        {data.map(c => <th key={c.country} style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{flags[c.country] || '🌍'} {c.country}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: '💰 Tuition Range', key: 'tuitionRange' },
                        { label: '🏠 Living Cost/Month', key: 'livingCost' },
                        { label: '💼 Work Rights', key: 'workRights' },
                        { label: '🛂 Post-Study Visa', key: 'postStudyVisa' },
                        { label: '📈 Job Market', key: 'jobMarket' },
                        { label: '🗣️ Language Barrier', key: 'languageBarrier' },
                        { label: '🛡️ Safety Index', key: 'safetyIndex' },
                        { label: '📚 Avg IELTS Req.', key: 'averageIELTS' },
                        { label: '✅ Visa Success Rate', key: 'visaSuccessRate' },
                      ].map(({ label, key }, ri) => (
                        <tr key={key} style={{ borderBottom: '1px solid #f8fafc', background: ri % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>{label}</td>
                          {data.map(c => <td key={c.country} style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', color: '#475569' }}>{c[key] || '—'}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pros/Cons per country */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: '16px' }}>
                {data.map((c, i) => (
                  <div key={c.country} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>{flags[c.country] || '🌍'} {c.country}</h4>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '11px', fontWeight: '700', color: '#22c55e', margin: '0 0 6px', textTransform: 'uppercase' }}>✅ Pros</p>
                      {c.pros?.map((p, j) => <p key={j} style={{ fontSize: '12px', color: '#334155', margin: '3px 0' }}>• {p}</p>)}
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', margin: '0 0 6px', textTransform: 'uppercase' }}>❌ Cons</p>
                      {c.cons?.map((p, j) => <p key={j} style={{ fontSize: '12px', color: '#334155', margin: '3px 0' }}>• {p}</p>)}
                    </div>
                    {c.bestFor?.length > 0 && (
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', margin: '0 0 6px', textTransform: 'uppercase' }}>🎯 Best For</p>
                        {c.bestFor.map((p, j) => <p key={j} style={{ fontSize: '12px', color: '#334155', margin: '3px 0' }}>• {p}</p>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

export default CountryCompare;
