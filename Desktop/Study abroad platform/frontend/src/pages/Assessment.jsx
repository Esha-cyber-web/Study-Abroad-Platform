import React, { useState } from 'react';

const Assessment = () => {
  const [academicLevel, setAcademicLevel] = useState('undergraduate');
  const [formData, setFormData] = useState({
    fscMarks: '',
    cgpa: '',
    ielts: '',
    gre: '',
    budget: '',
    program: '',
    country: 'All',
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    const payload = {
      academicLevel,
      ...(academicLevel === 'undergraduate' ? { fscMarks: formData.fscMarks } : { cgpa: formData.cgpa }),
      ielts: formData.country === 'Pakistan' ? 'N/A' : formData.ielts,
      gre: formData.gre,
      budget: formData.budget,
      program: formData.program,
      country: formData.country,
    };

    try {
      const response = await fetch('/api/ai/predict-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.message || 'Failed to fetch predictions.');
      }
    } catch (err) {
      setError('Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Top Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '50px 20px',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎓</div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          AI Eligibility Predictor
        </h1>
        <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Get instant admission chances and university recommendations tailored to your academic profile.
        </p>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
        
        {/* Left Form Card */}
        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
            Your Profile
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div>
              <label style={labelStyle}>Preferred Country *</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                style={{ ...inputStyle, backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                <option value="All">All Countries</option>
                <option value="Pakistan">Pakistan</option>
                <option value="UK">UK</option>
                <option value="USA">USA</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="Canada">Canada</option>
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, textTransform: 'uppercase', fontSize: '11px', color: '#64748b' }}>
                Applying For *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAcademicLevel('undergraduate')}
                  style={{
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: academicLevel === 'undergraduate' ? '#ffffff' : 'transparent',
                    color: academicLevel === 'undergraduate' ? '#2563eb' : '#64748b',
                    boxShadow: academicLevel === 'undergraduate' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  BS (2nd Year / FSc)
                </button>
                <button
                  type="button"
                  onClick={() => setAcademicLevel('postgraduate')}
                  style={{
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: academicLevel === 'postgraduate' ? '#ffffff' : 'transparent',
                    color: academicLevel === 'postgraduate' ? '#2563eb' : '#64748b',
                    boxShadow: academicLevel === 'postgraduate' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  MS (Master's)
                </button>
              </div>
            </div>

            {academicLevel === 'undergraduate' ? (
              <div>
                <label style={labelStyle}>FSc / 2nd Year Marks (%) *</label>
                <input
                  type="text"
                  name="fscMarks"
                  value={formData.fscMarks}
                  onChange={handleChange}
                  placeholder="e.g. 85% or 935/1100"
                  required
                  style={inputStyle}
                />
              </div>
            ) : (
              <div>
                <label style={labelStyle}>CGPA (Out of 4.0) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g. 3.4"
                  required
                  style={inputStyle}
                />
              </div>
            )}

            {formData.country !== 'Pakistan' && (
              <div>
                <label style={labelStyle}>IELTS Score (Out of 9) *</label>
                <input
                  type="number"
                  step="0.5"
                  name="ielts"
                  value={formData.ielts}
                  onChange={handleChange}
                  placeholder="e.g. 7.0"
                  required={formData.country !== 'Pakistan'}
                  style={inputStyle}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>GRE / Entry Test Score (Optional)</label>
              <input
                type="number"
                name="gre"
                value={formData.gre}
                onChange={handleChange}
                placeholder="e.g. 320 or NTS Marks"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Max Annual Budget ($ or PKR)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. 25000"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Intended Program</label>
              <input
                type="text"
                name="program"
                value={formData.program}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={submitBtnStyle}
            >
              {loading ? 'Evaluating Profile...' : 'Predict Eligibility'}
            </button>
          </form>
        </div>

        {/* Right Output Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '12px', border: '1px solid #fecaca', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {!results && !loading && !error && (
            <div style={{ backgroundColor: '#ffffff', padding: '50px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
              <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>🎯</span>
              <p style={{ fontSize: '15px', margin: 0 }}>Enter your academic details and click <strong>Predict Eligibility</strong> to view matching universities.</p>
            </div>
          )}

          {loading && (
            <div style={{ backgroundColor: '#ffffff', padding: '50px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#2563eb', fontWeight: '500' }}>
              Analyzing profile against university requirements...
            </div>
          )}

          {results && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Matched Universities</h3>
              {results.map((res, idx) => (
                <div key={idx} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', itemsAlign: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>{res.university?.name || res.name}</h4>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{res.university?.country || res.country} • Tuition: ${res.university?.fees || res.fees || 'N/A'}/yr</p>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: res.likelihood === 'High' ? '#dcfce7' : '#fef9c3',
                      color: res.likelihood === 'High' ? '#15803d' : '#a16207'
                    }}>
                      {res.matchScore}% ({res.likelihood})
                    </span>
                  </div>

                  {res.tip && (
                    <p style={{ fontSize: '13px', color: '#1e40af', backgroundColor: '#eff6ff', padding: '10px 12px', borderRadius: '8px', margin: '10px 0 0 0' }}>
                      💡 <strong>Tip:</strong> {res.tip}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', fontSize: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' };
const submitBtnStyle = { marginTop: '10px', padding: '12px 20px', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '14px', fontWeight: '600', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' };

export default Assessment;