import React, { useState } from 'react';

const CareerPredictor = () => {
  const [formData, setFormData] = useState({
    program: '',
    academicLevel: 'undergraduate',
    country: 'Pakistan',
    skills: '',
    interests: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/predict-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to predict career path.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
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
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          AI Career Path Predictor
        </h1>
        <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Explore job roles, salary ranges, and market demand tailored to your degree and target country.
        </p>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
        
        {/* Left Form Card */}
        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
            Career Profile
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div>
              <label style={labelStyle}>Degree / Program Name *</label>
              <input
                type="text"
                name="program"
                value={formData.program}
                onChange={handleChange}
                placeholder="e.g. Computer Science, BS SE, BBA"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ ...labelStyle, textTransform: 'uppercase', fontSize: '11px', color: '#64748b' }}>
                Degree Level *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, academicLevel: 'undergraduate' })}
                  style={{
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: formData.academicLevel === 'undergraduate' ? '#ffffff' : 'transparent',
                    color: formData.academicLevel === 'undergraduate' ? '#2563eb' : '#64748b',
                    boxShadow: formData.academicLevel === 'undergraduate' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  Undergraduate (BS)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, academicLevel: 'postgraduate' })}
                  style={{
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: formData.academicLevel === 'postgraduate' ? '#ffffff' : 'transparent',
                    color: formData.academicLevel === 'postgraduate' ? '#2563eb' : '#64748b',
                    boxShadow: formData.academicLevel === 'postgraduate' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  Postgraduate (MS)
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Target Country Market *</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                style={{ ...inputStyle, backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                <option value="Pakistan">Pakistan</option>
                <option value="UK">UK</option>
                <option value="USA">USA</option>
                <option value="Germany">Germany</option>
                <option value="Australia">Australia</option>
                <option value="Canada">Canada</option>
                <option value="Global">Global / Remote</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Your Technical / Soft Skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, Python, SQL"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Personal Interests</label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="e.g. Web Development, AI, Cloud"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={submitBtnStyle}
            >
              {loading ? 'Analyzing Career Market...' : 'Predict Career Outcomes'}
            </button>
          </form>
        </div>

        {/* Right Output Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '12px', border: '1px solid #fecaca', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          {!result && !loading && !error && (
            <div style={{ backgroundColor: '#ffffff', padding: '50px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
              <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>📊</span>
              <p style={{ fontSize: '15px', margin: 0 }}>Select your degree and target country to predict career opportunities.</p>
            </div>
          )}

          {loading && (
            <div style={{ backgroundColor: '#ffffff', padding: '50px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#2563eb', fontWeight: '500' }}>
              Analyzing industry demand, salary trends, and job opportunities...
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {result.salaryRange && (
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>💰 Estimated Salary Ranges</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Entry Level</span>
                      <strong style={{ fontSize: '15px', color: '#16a34a' }}>{result.salaryRange.entry || 'N/A'}</strong>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Mid Level</span>
                      <strong style={{ fontSize: '15px', color: '#2563eb' }}>{result.salaryRange.mid || 'N/A'}</strong>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Senior Level</span>
                      <strong style={{ fontSize: '15px', color: '#9333ea' }}>{result.salaryRange.senior || 'N/A'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {result.topCareers && result.topCareers.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>💼 Top Career Roles</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {result.topCareers.map((career, idx) => (
                      <div key={idx} style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{career.title}</h4>
                          <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: '#dcfce7', color: '#15803d' }}>
                            {career.demandLevel || 'High'} Demand
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 10px 0', lineHeight: '1.5' }}>{career.description}</p>
                        {career.avgSalary && (
                          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600', marginBottom: '8px' }}>
                            Avg Salary: {career.avgSalary}
                          </div>
                        )}
                        {career.requiredSkills && career.requiredSkills.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {career.requiredSkills.map((skill, sIdx) => (
                              <span key={sIdx} style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px' }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

export default CareerPredictor;