import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Footer from '../components/Footer';

const IELTSCoach = () => {
  const [form, setForm] = useState({
    currentScore: '',
    targetScore: '',
    targetDate: '',
    weakAreas: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.targetScore) return toast.error('Target score is required');
    setLoading(true);
    try {
      const res = await api.post('/ai/ielts-coach', form);
      setResults(res.data.data);
      toast.success('Personalized IELTS plan generated!');
    } catch (err) {
      toast.error('Failed to generate IELTS plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#1e1b4b)', padding: '48px 40px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: 'white', margin: '0 0 8px' }}>AI IELTS Coach</h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>Get a personalized IELTS preparation plan with study schedules and resources</p>
        </motion.div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
              position: 'sticky',
              top: '90px'
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>Your IELTS Profile</h2>
            <form onSubmit={handleSubmit}>
              {[
                { key: 'currentScore', label: 'Current Overall Score (optional)', placeholder: 'e.g. 6.0', type: 'number', step: '0.5', min: '0', max: '9' },
                { key: 'targetScore', label: 'Target Overall Score', placeholder: 'e.g. 7.0', type: 'number', step: '0.5', min: '0', max: '9' },
                { key: 'targetDate', label: 'Target Test Date', placeholder: 'e.g. 2026-06-15', type: 'date' },
                { key: 'weakAreas', label: 'Weak Areas (optional)', placeholder: 'e.g. speaking, writing', type: 'text' }
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '8px'
                }}
              >
                {loading ? 'Generating Plan...' : 'Generate IELTS Plan'}
              </button>
            </form>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {results ? (
              <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '24px' }}>Your Personalized IELTS Plan</h2>

                {/* Study Plan */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '16px' }}>Weekly Study Schedule</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(results.studyPlan || []).map((week, i) => (
                      <div key={i} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Week {week.week}</span>
                          <span style={{ fontSize: '14px', color: '#64748b' }}>{week.hours} hours</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}><strong>Focus:</strong> {week.focus}</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {(week.tasks || []).map((task, j) => (
                            <li key={j} style={{ fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'flex-start', marginBottom: '4px' }}>
                              <span style={{ color: '#10b981', marginRight: '8px' }}>✓</span>
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '16px' }}>Recommended Resources</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    {Object.entries(results.resourcesBySection || {}).map(([section, resources]) => (
                      <div key={section} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', textTransform: 'capitalize', marginBottom: '8px' }}>{section}</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {(resources || []).map((resource, i) => (
                            <li key={i} style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>• {resource}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Routine & Mock Tests */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '12px' }}>Daily Routine</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {(results.dailyRoutine || []).map((item, i) => (
                        <li key={i} style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                          <span style={{ color: '#3b82f6', marginRight: '8px' }}>📅</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '12px' }}>Mock Test Schedule</h4>
                    <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                      <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>{results.mockTestSchedule || 'Take full mock tests every 2 weeks'}</p>
                    </div>
                  </div>
                </div>

                {/* Score Improvement Tips */}
                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '12px' }}>Score Improvement Tips</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                    {(results.scoreImprovementTips || []).map((tip, i) => (
                      <div key={i} style={{ background: '#dcfce7', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        <p style={{ fontSize: '14px', color: '#166534', margin: 0 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confidence & Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#92400e', marginBottom: '8px' }}>Estimated Ready Date</h4>
                    <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>{results.estimatedReadyDate || 'Based on your plan'}</p>
                  </div>
                  <div style={{ background: '#dbeafe', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e40af', marginBottom: '8px' }}>Confidence Level</h4>
                    <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>{results.confidenceLevel || 'High with consistent practice'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '20px', padding: '64px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Ready for IELTS Success?</h3>
                <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>Enter your target score and get a personalized preparation plan</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default IELTSCoach;