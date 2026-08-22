import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Footer from '../components/Footer';

const BudgetPlanner = () => {
  const [form, setForm] = useState({
    country: '',
    city: '',
    program: '',
    duration: '1',
    tuitionFee: '',
    currency: 'USD'
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.country || !form.program) return toast.error('Country and program are required');
    setLoading(true);
    try {
      const res = await api.post('/ai/plan-budget', form);
      setResults(res.data.data);
      toast.success('Budget plan generated!');
    } catch (err) {
      toast.error('Failed to generate budget plan');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' };
    return `${symbols[currency] || currency} ${amount}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#1e1b4b)', padding: '48px 40px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: 'white', margin: '0 0 8px' }}>AI Budget Planner</h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>Get a detailed monthly budget breakdown for your study abroad expenses</p>
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
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>Your Study Details</h2>
            <form onSubmit={handleSubmit}>
              {[
                { key: 'country', label: 'Country', placeholder: 'e.g. Germany', type: 'text' },
                { key: 'city', label: 'City (optional)', placeholder: 'e.g. Berlin', type: 'text' },
                { key: 'program', label: 'Program', placeholder: 'e.g. Computer Science', type: 'text' },
                { key: 'duration', label: 'Duration (years)', placeholder: '1', type: 'number', min: '1' },
                { key: 'tuitionFee', label: 'Tuition Fee (annual)', placeholder: 'e.g. 12000', type: 'number' },
                { key: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] }
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: 'white'
                      }}
                    >
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      min={field.min}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  )}
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
                {loading ? 'Generating...' : 'Generate Budget Plan'}
              </button>
            </form>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {results ? (
              <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '24px' }}>Your Budget Breakdown</h2>

                {/* Monthly Breakdown */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '16px' }}>Monthly Expenses</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {Object.entries(results.monthlyBreakdown || {}).map(([key, value]) => (
                      <div key={key} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '14px', color: '#64748b', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{formatCurrency(value, results.currencySymbol || form.currency)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ background: '#dbeafe', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#1e40af' }}>Total Monthly</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e40af' }}>{formatCurrency(results.totalMonthly, results.currencySymbol || form.currency)}</div>
                  </div>
                  <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#166534' }}>Total Annual</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#166534' }}>{formatCurrency(results.totalAnnual, results.currencySymbol || form.currency)}</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '12px' }}>Saving Tips</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {(results.savingTips || []).map((tip, i) => (
                        <li key={i} style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                          <span style={{ color: '#10b981', marginRight: '8px' }}>💡</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', marginBottom: '12px' }}>Student Discounts</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {(results.studentDiscounts || []).map((discount, i) => (
                        <li key={i} style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'flex-start' }}>
                          <span style={{ color: '#f59e0b', marginRight: '8px' }}>🎟️</span>
                          {discount}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Part-time Work */}
                {results.partTimeWorkInfo && (
                  <div style={{ marginTop: '24px', padding: '16px', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#92400e', marginBottom: '8px' }}>Part-time Work Opportunities</h4>
                    <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>{results.partTimeWorkInfo}</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '20px', padding: '64px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Ready to Plan Your Budget?</h3>
                <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>Fill in your study details on the left to get a personalized budget breakdown</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BudgetPlanner;