import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Footer from '../components/Footer';
import { fetchCountriesData } from '../services/countriesAPI';

const COUNTRIES = ['UK', 'USA', 'Germany', 'Canada', 'Australia'];

const GUIDE_FALLBACKS = {
  UK: {
    steps: ['Choose the correct visa category', 'Receive your CAS from your university', 'Submit application with financial documents', 'Attend biometrics appointment', 'Track your visa decision'],
    documents: ['Passport', 'CAS letter', 'Proof of funds', 'TB test results', 'Academic certificates'],
    fees: '£490',
    processingTime: '3-5 weeks',
    tips: ['Apply as early as possible to avoid delays.', 'Keep your financial proof ready in the exact accepted format.'],
    rejectionReasons: ['Insufficient financial evidence', 'Incorrect or missing CAS details'],
  },
  USA: {
    steps: ['Complete the DS-160 form', 'Pay the SEVIS fee', 'Book visa interview', 'Attend the interview', 'Receive your visa and travel documents'],
    documents: ['Passport', 'I-20 form', 'DS-160 confirmation', 'SEVIS fee receipt', 'Financial support documents'],
    fees: '$185',
    processingTime: '2-4 weeks',
    tips: ['Prepare strong answers for your visa interview.', 'Keep all your forms and receipts organized.'],
    rejectionReasons: ['Incomplete documents', 'Weak interview explanation'],
  },
  Germany: {
    steps: ['Receive your admission letter', 'Apply for a national visa', 'Submit proof of accommodation', 'Attend biometrics and interview', 'Get your visa sticker'],
    documents: ['Passport', 'Admission letter', 'Proof of funds', 'Health insurance', 'Accommodation proof'],
    fees: '€75',
    processingTime: '4-8 weeks',
    tips: ['Show proof of sufficient funds for your stay.', 'Organize your accommodation documents in advance.'],
    rejectionReasons: ['Lack of health insurance', 'Missing proof of funds'],
  },
};

const VisaGuide = () => {
  const { country } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openStep, setOpenStep] = useState(0);
  const [flags, setFlags] = useState({});

  useEffect(() => {
    const loadFlags = async () => {
      const countryData = await fetchCountriesData(COUNTRIES);
      const flagMap = {};
      for (const [name, info] of Object.entries(countryData)) {
        flagMap[name] = info.flag;
      }
      setFlags(flagMap);
    };
    loadFlags();
  }, []);

  useEffect(() => {
    const fetchGuide = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/ai/visa-guide/${country}`);
        const payload = res?.data?.data;

        if (payload && Array.isArray(payload.steps) && payload.steps.length > 0) {
          setGuide(payload);
        } else {
          setGuide(GUIDE_FALLBACKS[country] || GUIDE_FALLBACKS.UK);
        }
      } catch (error) {
        console.warn(`Visa guide unavailable for ${country}, using fallback content:`, error);
        setGuide(GUIDE_FALLBACKS[country] || GUIDE_FALLBACKS.UK);
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [country]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#1e1b4b)', padding: '48px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>{flags[country] || '🌍'}</div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: 'white', margin: '0 0 8px' }}>{country} Student Visa Guide</h1>
            <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>Complete step-by-step guide for international students</p>
          </motion.div>
          {/* Country Switcher */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
            {COUNTRIES.map(c => (
              <Link key={c} to={`/visa-guide/${c}`}
                style={{ padding: '6px 16px', borderRadius: '25px', textDecoration: 'none', fontWeight: '600', fontSize: '13px',
                  background: c === country ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  color: c === country ? 'white' : '#94a3b8',
                  border: c === country ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
                {flags[c] || '🌍'} {c}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: '80px', borderRadius: '12px', background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
          </div>
        ) : guide ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Steps */}
            <div style={{ gridColumn: '1 / -1' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>📋 Step-by-Step Process</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {guide.steps?.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setOpenStep(openStep === i ? -1 : i)}
                    style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>📄 Required Documents</h2>
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9' }}>
                {guide.documents?.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < guide.documents.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                    <span style={{ fontSize: '14px', color: '#334155' }}>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>💳 Fees & Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Visa Fee</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{guide.fees}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Processing Time</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#6366f1' }}>{guide.processingTime}</span>
                  </div>
                </div>
              </div>

              {guide.tips?.length > 0 && (
                <div style={{ background: '#f0fdf4', borderRadius: '16px', padding: '20px', border: '1px solid #bbf7d0' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#166534', marginBottom: '12px' }}>✅ Success Tips</h3>
                  {guide.tips.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: '#22c55e', flexShrink: 0 }}>💡</span>
                      <span style={{ fontSize: '13px', color: '#166534', lineHeight: '1.5' }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {guide.rejectionReasons?.length > 0 && (
                <div style={{ background: '#fef2f2', borderRadius: '16px', padding: '20px', border: '1px solid #fecaca' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#991b1b', marginBottom: '12px' }}>⚠️ Common Rejection Reasons</h3>
                  {guide.rejectionReasons.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: '#ef4444', flexShrink: 0 }}>✗</span>
                      <span style={{ fontSize: '13px', color: '#991b1b', lineHeight: '1.5' }}>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: '#64748b' }}>Could not load visa guide. Please try again.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VisaGuide;
