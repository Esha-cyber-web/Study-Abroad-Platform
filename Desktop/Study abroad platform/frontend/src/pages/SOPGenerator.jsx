import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Footer from '../components/Footer';

const SOPGenerator = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', university: '', program: '', country: '',
    cgpa: user?.cgpa || '', ielts: user?.ielts || '',
    workExperience: '', achievements: '',
    whyProgram: '', whyUniversity: '', careerGoals: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.whyProgram || !form.whyUniversity || !form.careerGoals)
      return toast.error('Please fill in Why Program, Why University, and Career Goals');
    setLoading(true);
    try {
      const res = await api.post('/ai/generate-sop', form);
      setResult(res.data.data);
      toast.success('SOP generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate SOP');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.sop);
    setCopied(true);
    toast.success('SOP copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('sop-text-container');
    if (!element) return toast.error('No SOP content found to export');

    setDownloadingPdf(true);
    const options = {
      margin:       15,
      filename:     `${form.name ? form.name.replace(/\s+/g, '_') : 'My'}_Statement_of_Purpose.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        toast.success('PDF downloaded successfully!');
        setDownloadingPdf(false);
      })
      .catch((err) => {
        console.error('PDF Export Error:', err);
        toast.error('Failed to download PDF');
        setDownloadingPdf(false);
      });
  };

  const scoreColor = (s) => s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#1e1b4b)', padding: '48px 40px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✍️</div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: 'white', margin: '0 0 8px' }}>AI SOP Generator</h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>Generate a compelling Statement of Purpose tailored to your target university</p>
        </motion.div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '600px 1fr', gap: '32px', justifyContent: 'center' }}>

          {/* Form */}
          <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleGenerate}
            style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>Your Details</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {[
                { key: 'name', label: 'Full Name', placeholder: 'Your full name' },
                { key: 'university', label: 'Target University', placeholder: 'e.g. Oxford University' },
                { key: 'program', label: 'Program', placeholder: 'e.g. MSc Computer Science' },
                { key: 'country', label: 'Country', placeholder: 'e.g. UK' },
                { key: 'cgpa', label: 'CGPA', placeholder: 'e.g. 3.6', type: 'number' },
                { key: 'ielts', label: 'IELTS Score', placeholder: 'e.g. 7.0', type: 'number' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '5px', textTransform: 'uppercase' }}>{label}</label>
                  <input type={type || 'text'} placeholder={placeholder} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              ))}
            </div>

            {[
              { key: 'workExperience', label: 'Work / Research Experience', placeholder: 'e.g. 1 year as software intern at XYZ, published research paper on ML...' },
              { key: 'achievements', label: 'Key Achievements', placeholder: 'e.g. Dean\'s list, won national coding competition, led student society...' },
              { key: 'whyProgram', label: 'Why This Program? *', placeholder: 'What specifically draws you to this field and program?' },
              { key: 'whyUniversity', label: 'Why This University? *', placeholder: 'Specific professors, labs, research groups, or unique aspects...' },
              { key: 'careerGoals', label: 'Career Goals *', placeholder: 'Where do you see yourself in 5-10 years after this degree?' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '5px', textTransform: 'uppercase' }}>{label}</label>
                <textarea placeholder={placeholder} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', minHeight: '70px', resize: 'vertical', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            ))}

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '✍️ Generating your SOP...' : '✨ Generate My SOP'}
            </motion.button>
          </motion.form>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                {/* Score Card */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', itemsAlign: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>SOP Strength Score</h3>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: scoreColor(result.strengthScore) }}>{result.strengthScore}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${result.strengthScore}%` }} transition={{ duration: 1 }}
                      style={{ height: '100%', background: `linear-gradient(90deg,${scoreColor(result.strengthScore)},${scoreColor(result.strengthScore)}88)`, borderRadius: '4px' }} />
                  </div>
                  {result.improvements?.length > 0 && (
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b', margin: '0 0 6px' }}>💡 Suggestions to improve:</p>
                      {result.improvements.map((imp, i) => (
                        <p key={i} style={{ fontSize: '12px', color: '#64748b', margin: '3px 0' }}>• {imp}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* SOP Text */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Your Statement of Purpose</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8', background: '#f8fafc', padding: '4px 10px', borderRadius: '20px' }}>{result.wordCount} words</span>
                      
                      {/* Copy Button */}
                      <button onClick={handleCopy}
                        style={{ padding: '6px 14px', background: copied ? '#22c55e' : 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                        {copied ? '✓ Copied!' : '📋 Copy'}
                      </button>

                      {/* Download PDF Button */}
                      <button onClick={handleDownloadPDF} disabled={downloadingPdf}
                        style={{ padding: '6px 14px', background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', opacity: downloadingPdf ? 0.7 : 1 }}>
                        {downloadingPdf ? '⏳ Saving...' : '📥 PDF'}
                      </button>
                    </div>
                  </div>

                  {/* Target Container for PDF Export */}
                  <div id="sop-text-container" style={{ fontSize: '14px', lineHeight: '1.8', color: '#334155', whiteSpace: 'pre-wrap', maxHeight: '500px', overflowY: 'auto', padding: '12px', background: '#ffffff' }}>
                    {result.sop}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Placeholder when no result */}
          {!result && !loading && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '60px 40px', textAlign: 'center', border: '2px dashed #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📄</div>
              <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Your SOP will appear here</h3>
              <p style={{ color: '#64748b', maxWidth: '300px', lineHeight: '1.6' }}>Fill in your details and our AI will craft a compelling, personalized Statement of Purpose in seconds.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SOPGenerator;