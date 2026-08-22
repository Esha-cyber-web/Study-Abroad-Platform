import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Footer from '../components/Footer';

const InterviewPrep = () => {
  const [form, setForm] = useState({ university: '', program: '', country: '', visaType: 'University Admission' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeQ, setActiveQ] = useState(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.university || !form.program) return toast.error('University and program are required');
    setLoading(true);
    try {
      const res = await api.post('/ai/interview-prep', form);
      setData(res.data.data);
      toast.success('Interview prep ready!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate prep');
    } finally {
      setLoading(false);
    }
  };

  const getFeedback = async () => {
    if (!userAnswer.trim()) return toast.error('Please write your answer first');
    setFeedbackLoading(true);
    try {
      const q = data.likelyQuestions[currentQ];
      const res = await api.post('/ai/chat', {
        messages: [{ role: 'user', content: `I'm preparing for a ${form.visaType} interview for ${form.program} at ${form.university}. The question is: "${q.question}". My answer is: "${userAnswer}". Please give me specific feedback on: 1) What I did well, 2) What to improve, 3) A better version of my answer. Be concise and constructive.` }]
      });
      setFeedback(res.data.reply);
    } catch {
      toast.error('Could not get feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#1e1b4b)', padding: '48px 40px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎤</div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: 'white', margin: '0 0 8px' }}>AI Interview Prep</h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>Practice university admission and visa interviews with AI-powered coaching</p>
        </motion.div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'start' }}>

          {/* Form */}
          <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmit}
            style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>Interview Details</h2>
            {[
              { key: 'university', label: 'University *', placeholder: 'e.g. Oxford University', required: true },
              { key: 'program', label: 'Program *', placeholder: 'e.g. MSc Computer Science', required: true },
              { key: 'country', label: 'Country', placeholder: 'e.g. UK' },
            ].map(({ key, label, placeholder, required }) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '5px', textTransform: 'uppercase' }}>{label}</label>
                <input type="text" placeholder={placeholder} required={required} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            ))}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '5px', textTransform: 'uppercase' }}>Interview Type</label>
              <select value={form.visaType} onChange={e => setForm({ ...form, visaType: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', background: 'white' }}>
                {['University Admission', 'UK Student Visa', 'USA F-1 Visa', 'Germany Student Visa', 'Canada Study Permit', 'Scholarship Interview'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '🤖 Preparing...' : '🎤 Generate Interview Prep'}
            </motion.button>
          </motion.form>

          {/* Results */}
          <div>
            {!data && !loading && (
              <div style={{ background: 'white', borderRadius: '20px', padding: '60px 40px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
                <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Interview Coaching</h3>
                <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>Get likely questions, sample answers, do's and don'ts, and practice with AI feedback.</p>
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...Array(4)].map((_, i) => <div key={i} style={{ height: '80px', borderRadius: '12px', background: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />)}
              </div>
            )}

            <AnimatePresence>
              {data && !practiceMode && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Confidence Booster */}
                  {data.confidenceBooster && (
                    <div style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', borderRadius: '16px', padding: '20px', marginBottom: '20px', color: 'white' }}>
                      <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>💪 {data.confidenceBooster}</p>
                    </div>
                  )}

                  {/* Do/Don't */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ background: '#f0fdf4', borderRadius: '16px', padding: '20px', border: '1px solid #bbf7d0' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#166534', marginBottom: '12px' }}>✅ DO</h4>
                      {data.doList?.map((d, i) => <p key={i} style={{ fontSize: '13px', color: '#166534', margin: '4px 0' }}>• {d}</p>)}
                    </div>
                    <div style={{ background: '#fef2f2', borderRadius: '16px', padding: '20px', border: '1px solid #fecaca' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#991b1b', marginBottom: '12px' }}>❌ DON'T</h4>
                      {data.dontList?.map((d, i) => <p key={i} style={{ fontSize: '13px', color: '#991b1b', margin: '4px 0' }}>• {d}</p>)}
                    </div>
                  </div>

                  {/* Questions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Likely Questions ({data.likelyQuestions?.length})</h3>
                    <button onClick={() => { setPracticeMode(true); setCurrentQ(0); setUserAnswer(''); setFeedback(''); }}
                      style={{ padding: '8px 20px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                      🎯 Practice Mode
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {data.likelyQuestions?.map((q, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        onClick={() => setActiveQ(activeQ === i ? null : i)}
                        style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', border: '1px solid #f1f5f9', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', background: '#eef2ff', padding: '2px 8px', borderRadius: '20px' }}>{q.category}</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{q.question}</span>
                          </div>
                          <span style={{ color: '#94a3b8', fontSize: '16px' }}>{activeQ === i ? '▲' : '▼'}</span>
                        </div>
                        <AnimatePresence>
                          {activeQ === i && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              style={{ overflow: 'hidden', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginBottom: '8px' }}><strong>Sample Answer:</strong> {q.sampleAnswer}</p>
                              <p style={{ fontSize: '12px', color: '#6366f1', background: '#eef2ff', padding: '8px 12px', borderRadius: '8px', margin: 0 }}>💡 {q.tips}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>

                  {/* Document Checklist */}
                  {data.documentChecklist?.length > 0 && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginTop: '20px', border: '1px solid #f1f5f9' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>📋 Documents to Bring</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {data.documentChecklist.map((d, i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#334155' }}>
                            <span style={{ color: '#22c55e' }}>✓</span>{d}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Practice Mode */}
              {data && practiceMode && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>
                      🎯 Practice Mode — Question {currentQ + 1} of {data.likelyQuestions?.length}
                    </h3>
                    <button onClick={() => { setPracticeMode(false); setFeedback(''); }}
                      style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '20px', color: '#64748b', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                      ← Back to Questions
                    </button>
                  </div>

                  <div style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', borderRadius: '16px', padding: '24px', marginBottom: '20px', color: 'white' }}>
                    <span style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>{data.likelyQuestions[currentQ]?.category}</span>
                    <p style={{ fontSize: '18px', fontWeight: '700', margin: '8px 0 0' }}>{data.likelyQuestions[currentQ]?.question}</p>
                  </div>

                  <textarea value={userAnswer} onChange={e => setUserAnswer(e.target.value)} placeholder="Type your answer here... Be specific and confident."
                    style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', minHeight: '150px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '12px', lineHeight: '1.6' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <motion.button onClick={getFeedback} disabled={feedbackLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', opacity: feedbackLoading ? 0.7 : 1 }}>
                      {feedbackLoading ? '🤖 Analyzing...' : '🎯 Get AI Feedback'}
                    </motion.button>
                    {currentQ < data.likelyQuestions.length - 1 && (
                      <button onClick={() => { setCurrentQ(currentQ + 1); setUserAnswer(''); setFeedback(''); }}
                        style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', color: '#334155' }}>
                        Next Question →
                      </button>
                    )}
                  </div>

                  {feedback && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: '#f0f9ff', borderRadius: '14px', padding: '20px', border: '1px solid #bae6fd' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0369a1', marginBottom: '10px' }}>🤖 AI Feedback</h4>
                      <p style={{ fontSize: '13px', color: '#0c4a6e', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>{feedback}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InterviewPrep;
