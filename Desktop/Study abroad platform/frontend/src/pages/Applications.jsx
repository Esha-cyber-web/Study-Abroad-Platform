import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Footer from '../components/Footer';

const STATUS_CONFIG = {
  draft:        { color: '#94a3b8', bg: '#f8fafc', label: 'Draft',        icon: '📝' },
  submitted:    { color: '#6366f1', bg: '#eef2ff', label: 'Submitted',    icon: '📤' },
  under_review: { color: '#f59e0b', bg: '#fffbeb', label: 'Under Review', icon: '🔍' },
  accepted:     { color: '#22c55e', bg: '#f0fdf4', label: 'Accepted',     icon: '✅' },
  rejected:     { color: '#ef4444', bg: '#fef2f2', label: 'Rejected',     icon: '❌' },
  waitlisted:   { color: '#8b5cf6', bg: '#f5f3ff', label: 'Waitlisted',   icon: '⏳' },
};

const STEPS = ['draft', 'submitted', 'under_review', 'accepted'];

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/applications');
        setApplications(res.data.data || []);
      } catch { toast.error('Failed to load applications'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#1e1b4b)', padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', margin: '0 0 8px' }}>📋 My Applications</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>Track all your university applications in one place</p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['all', ...Object.keys(STATUS_CONFIG)].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding: '6px 16px', borderRadius: '25px', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                background: filter === s ? 'linear-gradient(135deg,#6366f1,#a855f7)' : '#f1f5f9',
                color: filter === s ? 'white' : '#64748b' }}>
              {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label}
              {s !== 'all' && <span style={{ marginLeft: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '1px 6px', fontSize: '11px' }}>
                {applications.filter(a => a.status === s).length}
              </span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ height: '100px', borderRadius: '16px', background: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No applications yet</h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Start by browsing universities and applying</p>
            <Link to="/home" style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', borderRadius: '25px', textDecoration: 'none', fontWeight: '700' }}>
              Browse Universities →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((app, i) => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft;
              const stepIdx = STEPS.indexOf(app.status);
              return (
                <motion.div key={app._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(selected?._id === app._id ? null : app)}
                  style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', border: `1px solid ${cfg.color}30`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      {app.universityId?.logo ? (
                        <img src={app.universityId.logo} alt="" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎓</div>
                      )}
                      <div>
                        <h3 style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{app.universityId?.name || 'University'}</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{app.program} • {app.universityId?.country}</p>
                      </div>
                    </div>
                    <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: cfg.bg, color: cfg.color }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  {/* Progress Stepper */}
                  {app.status !== 'rejected' && app.status !== 'waitlisted' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                      {STEPS.map((s, idx) => (
                        <React.Fragment key={s}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800',
                              background: idx <= stepIdx ? 'linear-gradient(135deg,#6366f1,#a855f7)' : '#f1f5f9',
                              color: idx <= stepIdx ? 'white' : '#94a3b8' }}>
                              {idx < stepIdx ? '✓' : idx + 1}
                            </div>
                            <span style={{ fontSize: '9px', color: idx <= stepIdx ? '#6366f1' : '#94a3b8', fontWeight: '600', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                              {STATUS_CONFIG[s]?.label}
                            </span>
                          </div>
                          {idx < STEPS.length - 1 && (
                            <div style={{ flex: 1, height: '2px', background: idx < stepIdx ? '#6366f1' : '#f1f5f9', margin: '0 4px', marginBottom: '16px' }} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {selected?._id === app._id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                        {app.academicInfo?.cgpa && <div><span style={{ color: '#94a3b8' }}>CGPA: </span><strong>{app.academicInfo.cgpa}</strong></div>}
                        {app.academicInfo?.ielts && <div><span style={{ color: '#94a3b8' }}>IELTS: </span><strong>{app.academicInfo.ielts}</strong></div>}
                        {app.startDate && <div><span style={{ color: '#94a3b8' }}>Start Date: </span><strong>{new Date(app.startDate).toLocaleDateString()}</strong></div>}
                        <div><span style={{ color: '#94a3b8' }}>Applied: </span><strong>{new Date(app.createdAt).toLocaleDateString()}</strong></div>
                      </div>
                      {app.notes && <p style={{ marginTop: '10px', fontSize: '13px', color: '#475569', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>{app.notes}</p>}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Applications;
