import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Footer from '../components/Footer';
import { AdmissionPredictor, DocumentChecklist, CurrencyConverter } from '../components/AdvancedFeatures';
import { DEFAULT_UNIVERSITIES } from './Home';

const UniversityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ program: '', startDate: '', cgpa: user?.cgpa || '', ielts: user?.ielts || '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const findInLocalData = () => {
      const found = DEFAULT_UNIVERSITIES.find((u) => u._id === id);
      if (found) {
        setUniversity(found);
        setError(null);
      } else {
        setError('University not found.');
      }
    };

    const fetchUniversity = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/universities/${id}`);
        if (!cancelled) {
          if (res?.data?.success && res?.data?.data) {
            setUniversity(res.data.data);
          } else {
            findInLocalData();
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.log('Backend fail or off, switching to local dataset:', err);
          findInLocalData();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUniversity();
    return () => { cancelled = true; };
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/applications', {
        universityId: id,
        program: applyForm.program,
        startDate: applyForm.startDate,
        academicInfo: { cgpa: applyForm.cgpa, ielts: applyForm.ielts },
        notes: applyForm.notes,
        status: 'submitted',
      });
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      navigate('/applications');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application submitted in preview mode.');
      setShowApplyModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const fonts = `
    @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,500;0,600;1,500;1,600&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
    :root {
      --navy: #16233F; --navy-deep: #0E1830; --gold: #C9A227; --sky: #3B7A9E;
      --paper: #F7F6F2; --ink: #16202E; --ink-soft: #5B6B82; --line: #E7EAEF;
      --font-display: 'Newsreader', serif; --font-body: 'IBM Plex Sans', sans-serif; --font-mono: 'IBM Plex Mono', monospace;
    }
  `;

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#F7F6F2', fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <style>{fonts}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #C9A227', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#5B6B82', fontSize: '14px' }}>Loading university details...</p>
      </div>
    </div>
  );

  if (error || !university) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#F7F6F2', gap: '12px', fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <style>{fonts}</style>
      <p style={{ color: '#B23A3A', fontSize: '15px', fontWeight: 600 }}>{error || 'University not found.'}</p>
      <Link to="/home" style={{ color: '#3B7A9E', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>← Back to Universities</Link>
    </div>
  );

  const currencySymbol = university.currency === 'PKR' ? 'PKR '
    : university.currency === 'GBP' ? '£'
    : university.currency === 'CAD' ? 'C$'
    : university.currency === 'AUD' ? 'A$'
    : university.currency === 'EUR' ? '€'
    : '$';
  const totalFees = (university.fees || 0) + (university.living_cost || 0);
  const scholarshipItems = Array.isArray(university.scholarships) ? university.scholarships : [];
  const scholarshipAvailable = scholarshipItems.length > 0;
  const programs = university.courses?.length ? university.courses : (university.programs?.length ? university.programs : []);
  const eligibility = university.eligibility || {};

  const cardStyle = { background: '#fff', borderRadius: '14px', padding: '26px', marginBottom: '20px', border: '1px solid #E7EAEF' };
  const headingStyle = { fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontWeight: 600, fontSize: '20px', color: '#16233F', marginBottom: '16px' };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <style>{fonts}</style>

      {/* Header */}
      <div style={{ background: '#0E1830', padding: '44px 40px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
          <Link to="/home" style={{ color: '#AEB9CC', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>
            ← Back to Universities
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ margin: '0 0 8px', fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontWeight: 600, fontSize: '34px', color: '#fff' }}>{university.name}</h1>
              <p style={{ margin: '0 0 14px', fontSize: '14px', color: '#AEB9CC', fontFamily: '"IBM Plex Mono", monospace' }}>
                {university.city}, {university.country} · Rank #{university.ranking || 'N/A'}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '5px 12px', background: scholarshipAvailable ? 'rgba(201,162,39,0.18)' : 'rgba(255,255,255,0.08)', color: scholarshipAvailable ? '#E4C766' : '#AEB9CC', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700 }}>
                  {scholarshipAvailable ? 'Scholarships available' : 'No scholarships listed'}
                </span>
                {university.visa_time && (
                  <span style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700, color: '#AEB9CC' }}>
                    Visa: {university.visa_time}
                  </span>
                )}
              </div>
            </div>
            <motion.button onClick={() => setShowApplyModal(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ padding: '13px 30px', background: '#C9A227', color: '#0E1830', border: 'none', borderRadius: '999px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              Apply Now →
            </motion.button>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          <section style={cardStyle}>
            <h2 style={headingStyle}>About</h2>
            <p style={{ color: '#5B6B82', lineHeight: 1.75, fontSize: '14.5px' }}>{university.description}</p>
            {university.website && (
              <a href={university.website} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#3B7A9E', fontWeight: 600, fontSize: '13.5px', textDecoration: 'none' }}>
                Visit official website →
              </a>
            )}
          </section>

          {scholarshipItems.length > 0 && (
            <section style={cardStyle}>
              <h2 style={headingStyle}>Scholarships</h2>
              {scholarshipItems.map((item, index) => (
                <div key={`${item?.name || index}`} style={{ padding: '13px 0', borderBottom: index === scholarshipItems.length - 1 ? 'none' : '1px dashed #E7EAEF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 700, color: '#16233F', fontSize: '13.5px' }}>{item?.name || 'Scholarship'}</span>
                    {item?.coverage && <span style={{ fontSize: '11px', color: '#8A6C10', fontWeight: 700, background: 'rgba(201,162,39,0.12)', padding: '2px 9px', borderRadius: '999px' }}>{item.coverage}</span>}
                  </div>
                  <p style={{ margin: 0, color: '#5B6B82', lineHeight: 1.6, fontSize: '13px' }}>{item?.details || 'Details available on official website.'}</p>
                </div>
              ))}
            </section>
          )}

          {programs.length > 0 && (
            <section style={cardStyle}>
              <h2 style={headingStyle}>Offered programs</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {programs.map((program, index) => (
                  <span key={`${program}-${index}`} style={{ padding: '6px 14px', background: '#F7F6F2', color: '#16233F', borderRadius: '999px', fontSize: '12.5px', fontWeight: 600, border: '1px solid #E7EAEF' }}>{program}</span>
                ))}
              </div>
            </section>
          )}

          <section style={cardStyle}>
            <h2 style={headingStyle}>Fee structure, living costs & visa</h2>
            {[
              { label: 'Annual Tuition Fee', value: university.fees === 0 ? 'Fully Free' : `${currencySymbol}${(university.fees || 0).toLocaleString()}`, bold: false },
              { label: 'Estimated Living Cost / Year', value: `${currencySymbol}${(university.living_cost || 0).toLocaleString()}`, bold: false },
              { label: 'Estimated Total Cost / Year', value: `${currencySymbol}${totalFees.toLocaleString()}`, bold: true },
              { label: 'Visa Processing Time', value: university.visa_time || 'N/A', bold: true },
            ].map(({ label, value, bold }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px dashed #E7EAEF' }}>
                <span style={{ color: '#5B6B82', fontSize: '13.5px' }}>{label}</span>
                <span style={{ fontFamily: '"IBM Plex Mono", monospace', color: bold ? '#16233F' : '#16202E', fontWeight: bold ? 700 : 600, fontSize: bold ? '15px' : '13.5px' }}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: '18px' }}>
              <CurrencyConverter amountInUSD={university.currency === 'PKR' ? totalFees / 278 : totalFees} />
            </div>
          </section>

          <DocumentChecklist country={university.country} />
        </div>

        <aside>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '22px', border: '1px solid #E7EAEF', position: 'sticky', top: '20px' }}>
            <h3 style={{ ...headingStyle, fontSize: '17px', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E7EAEF' }}>
              Eligibility criteria
            </h3>
            <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
              {[
                ['Minimum CGPA', eligibility.min_cgpa ? `${eligibility.min_cgpa} / 4.0` : 'Not specified'],
                ['IELTS', eligibility.ielts ? `${eligibility.ielts}+ Band` : 'Not required'],
                ['Entry Test', eligibility.entry_test || 'Not specified'],
                ['Visa Processing Time', university.visa_time || 'Not specified'],
              ].map(([label, value]) => (
                <div key={label} style={{ paddingBottom: '8px', borderBottom: '1px solid #F7F6F2' }}>
                  <div style={{ fontSize: '10px', color: '#94A0B3', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px', fontWeight: 600, color: '#16233F' }}>{value}</div>
                </div>
              ))}
            </div>

            <motion.button onClick={() => setShowApplyModal(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '13px', background: '#16233F', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer', marginBottom: '10px' }}>
              Apply for admission
            </motion.button>

            <Link to={`/visa-guide/${university.country}`}
              style={{ display: 'block', textAlign: 'center', padding: '11px', background: '#F7F6F2', color: '#3B7A9E', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '13px', border: '1px solid #E7EAEF' }}>
              {university.country} admission & visa guide
            </Link>

            <div style={{ marginTop: '14px' }}>
              <AdmissionPredictor university={university} />
            </div>
          </div>
        </aside>
      </main>

      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,24,48,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '460px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', fontFamily: '"IBM Plex Sans", sans-serif' }}>
            <h3 style={{ fontFamily: '"Newsreader", serif', fontStyle: 'italic', fontWeight: 600, fontSize: '20px', color: '#16233F', marginBottom: '4px' }}>Apply to {university.name}</h3>
            <p style={{ color: '#5B6B82', fontSize: '13px', marginBottom: '22px' }}>Fill in your details to submit your application</p>
            <form onSubmit={handleApply}>
              {[
                { key: 'program', label: 'Intended Program', type: 'text', placeholder: 'e.g. BS Computer Science', required: true },
                { key: 'startDate', label: 'Intended Start Date', type: 'date', required: false },
                { key: 'cgpa', label: 'Your CGPA / Inter %', type: 'number', step: '0.01', placeholder: 'e.g. 3.4', required: true },
                { key: 'ielts', label: 'IELTS / Entry Test Score', type: 'number', step: '0.5', placeholder: 'e.g. 7.0', required: false },
              ].map(({ key, label, type, step, placeholder, required }) => (
                <div key={key} style={{ marginBottom: '13px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5B6B82', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</label>
                  <input type={type} step={step} placeholder={placeholder} required={required} value={applyForm[key]}
                    onChange={e => setApplyForm({ ...applyForm, [key]: e.target.value })}
                    style={{ width: '100%', padding: '10px 13px', borderRadius: '8px', border: '1.5px solid #E7EAEF', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
              ))}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5B6B82', marginBottom: '6px', textTransform: 'uppercase' }}>Additional Notes</label>
                <textarea placeholder="Any additional details..." value={applyForm.notes} onChange={e => setApplyForm({ ...applyForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px 13px', borderRadius: '8px', border: '1.5px solid #E7EAEF', fontSize: '13.5px', outline: 'none', minHeight: '70px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowApplyModal(false)}
                  style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid #E7EAEF', borderRadius: '9px', color: '#5B6B82', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                  Cancel
                </button>
                <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ flex: 2, padding: '12px', background: '#16233F', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Submitting...' : 'Submit application'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UniversityDetail;