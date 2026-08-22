import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Footer from '../components/Footer';
import DashboardAnalytics from '../components/DashboardAnalytics';

const statusColors = { draft: '#94A0B3', submitted: '#3B7A9E', under_review: '#C9A227', accepted: '#3D8361', rejected: '#B23A3A', waitlisted: '#7A5FA6' };

// Timeline stages for application tracking
const timelineSteps = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'decision', label: 'Decision' },
];

const getStepState = (currentStatus, stepKey) => {
  const status = currentStatus?.toLowerCase() || 'submitted';
  if (stepKey === 'submitted') return 'completed';
  if (stepKey === 'under_review') {
    if (status === 'submitted') return 'pending';
    return 'completed';
  }
  if (stepKey === 'decision') {
    if (['accepted', 'rejected', 'waitlisted'].includes(status)) return 'completed';
    return 'pending';
  }
  return 'pending';
};

// Application Timeline Component
const ApplicationTimeline = ({ currentStatus }) => {
  return (
    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed var(--line, #E7EAEF)' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Application Timeline
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {timelineSteps.map((step, idx) => {
          const state = getStepState(currentStatus, step.key);
          const isCompleted = state === 'completed';
          const isCurrent = currentStatus === step.key || (step.key === 'decision' && ['accepted', 'rejected', 'waitlisted'].includes(currentStatus));

          return (
            <React.Fragment key={step.key}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: isCompleted ? (statusColors[currentStatus] || '#3D8361') : 'var(--line, #E7EAEF)',
                    color: isCompleted ? '#fff' : 'var(--ink-soft, #94A0B3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: isCurrent ? '2px solid var(--navy)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: '11px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--navy)' : 'var(--ink-soft)', marginTop: '4px' }}>
                  {step.key === 'decision' && ['accepted', 'rejected', 'waitlisted'].includes(currentStatus) 
                    ? currentStatus.toUpperCase() 
                    : step.label}
                </span>
              </div>

              {idx < timelineSteps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: getStepState(currentStatus, timelineSteps[idx + 1].key) === 'completed' || currentStatus === 'under_review' 
                      ? (statusColors[currentStatus] || '#3D8361') 
                      : 'var(--line, #E7EAEF)',
                    margin: '0 8px',
                    marginBottom: '16px',
                    transition: 'all 0.3s ease'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Lightweight count-up for stat numbers
const CountUp = ({ value, duration = 700 }) => {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  useEffect(() => {
    if (typeof value !== 'number') return;
    let frame;
    const step = (t) => {
      if (!startRef.current) startRef.current = t;
      const progress = Math.min((t - startRef.current) / duration, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return <>{typeof value === 'number' ? display : value}</>;
};

const StatCard = ({ label, value, accent, to, index }) => (
  <Link to={to || '#'} style={{ textDecoration: 'none' }}>
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.06, duration: 0.4 }}
      whileHover={{ y: -3 }}
      style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '22px', border: '1px solid var(--line, #E7EAEF)' }}
    >
      <div style={{ fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)', fontSize: '30px', fontWeight: 600, color: accent || 'var(--ink, #16233F)', marginBottom: '6px' }}>
        <CountUp value={typeof value === 'number' ? value : 0} />
      </div>
      <div style={{ fontSize: '12.5px', color: 'var(--ink-soft, #5B6B82)', fontWeight: 600 }}>{label}</div>
    </motion.div>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTool, setActiveTool] = useState('eligibility');
  const [expandedTimeline, setExpandedTimeline] = useState(null);

  // Auto redirect if Admin tries to access Student Dashboard directly
  useEffect(() => {
    if (user && user.role?.toLowerCase() === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/applications/stats');
        setStats(res.data.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  // Safe User Name Display
  const userFirstName = user?.name ? user.name.split(' ')[0] : 'User';

  // Safe Profile Values Resolution (Handles multiple key names safely)
  const displayCgpa = user?.cgpa || user?.academicProfile?.cgpa || 'Not set';
  const displayIelts = user?.ielts || user?.academicProfile?.ieltsScore || user?.ieltsScore || 'Not set';
  
  const rawBudget = user?.budget || user?.annualBudget || user?.academicProfile?.budget;
  const displayBudget = rawBudget ? `$${Number(rawBudget).toLocaleString()}` : 'Not set';
  
  const displayCountry = user?.preferredCountry || user?.targetCountry || user?.country || 'Not set';

  const quickActions = [
    { label: 'Browse Universities', desc: 'Explore programs across 5 countries', to: '/home' },
    { label: 'AI Eligibility Check', desc: 'Get personalized university matches', to: '/assessment' },
    { label: 'Find Scholarships', desc: 'AI-matched funding opportunities', to: '/scholarships' },
    { label: 'Visa Guides', desc: 'Step-by-step visa assistance', to: '/visa-guide/United Kingdom' },
  ];

  const toolTabs = [
    { id: 'eligibility', label: 'Eligibility Predictor' },
    { id: 'scholarship', label: 'Scholarship Matcher' },
    { id: 'sop', label: 'SOP Generator' },
    { id: 'career', label: 'Career Predictor' },
    { id: 'compare', label: 'Country Compare' },
    { id: 'interview', label: 'Interview Prep' },
    { id: 'budget', label: 'Budget Planner' },
    { id: 'ielts', label: 'IELTS Coach' },
    { id: 'documents', label: 'Required Docs' },
  ];

  const renderSelectedTool = () => {
    switch (activeTool) {
      case 'eligibility': return <AdmissionPredictor userCgpa={displayCgpa} />;
      case 'scholarship': return <ScholarshipMatcher />;
      case 'sop': return <SOPGenerator />;
      case 'career': return <CareerPredictor />;
      case 'compare': return <CountryCompare selectedCountry={displayCountry !== 'Not set' ? displayCountry : 'Pakistan'} />;
      case 'interview': return <InterviewPrep />;
      case 'budget': return <CurrencyConverter amountInUSD={rawBudget ? Number(rawBudget) : 12000} />;
      case 'ielts': return <IELTSCoach userIelts={displayIelts} />;
      case 'documents': return <DocumentChecklist country={displayCountry !== 'Not set' ? displayCountry : 'Pakistan'} />;
      default: return <AdmissionPredictor userCgpa={displayCgpa} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper, #F7F6F2)', color: 'var(--ink, #16202E)', fontFamily: 'var(--font-body, "IBM Plex Sans", sans-serif)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,500;0,600;1,500;1,600&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .tool-tab { transition: background 0.15s, color 0.15s; }
        .action-card:hover { border-color: var(--navy) !important; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ background: 'var(--navy-deep, #0E1830)', borderRadius: '16px', padding: '36px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.05,
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '26px 26px',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600 }}>
              Dashboard
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '10px 0 18px' }}>
              <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userFirstName)}&background=C9A227&color=0E1830&size=60`}
                alt="avatar" style={{ width: '54px', height: '54px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)' }} />
              <div>
                <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600, fontSize: '26px', color: '#fff' }}>
                  Welcome back, {userFirstName}
                </h1>
                <p style={{ margin: '2px 0 0', color: '#AEB9CC', fontSize: '14px' }}>Ready to continue your study abroad journey?</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/home" style={{ padding: '10px 20px', background: 'var(--gold)', color: '#0E1830', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '13.5px' }}>
                Explore Universities
              </Link>
              <Link to="/assessment" style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '13.5px', border: '1px solid rgba(255,255,255,0.16)' }}>
                AI Match
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '14px', marginBottom: '28px' }}>
          <StatCard index={0} label="Total Applications" value={loading ? 0 : stats?.total || 0} to="/applications" />
          <StatCard index={1} label="Accepted" value={loading ? 0 : stats?.accepted || 0} accent="#3D8361" to="/applications" />
          <StatCard index={2} label="Pending Review" value={loading ? 0 : stats?.pending || 0} accent="var(--sky)" to="/applications" />
          <StatCard index={3} label="Under Review" value={loading ? 0 : stats?.underReview || 0} accent="var(--gold)" to="/applications" />
          <StatCard index={4} label="Saved Universities" value={user?.favorites?.length || 0} accent="#B23A3A" to="/favorites" />
        </div>

        {/* Visual Analytics / Charts Section */}
        <DashboardAnalytics applications={stats?.recent || []} />

        {/* Student Tools */}
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '14px', padding: '24px', border: '1px solid var(--line)', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600, fontSize: '20px', color: 'var(--navy)', marginTop: 0, marginBottom: '16px' }}>
            Student AI tools & resources
          </h2>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '18px', borderBottom: '1px solid var(--line)' }}>
            {toolTabs.map((tool) => {
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  className="tool-tab"
                  onClick={() => setActiveTool(tool.id)}
                  style={{
                    padding: '8px 14px', borderRadius: '7px', border: 'none', whiteSpace: 'nowrap',
                    fontSize: '13px', fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'var(--navy)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--ink-soft)', cursor: 'pointer',
                  }}
                >
                  {tool.label}
                </button>
              );
            })}
          </div>

          <div style={{ minHeight: '150px' }}>{renderSelectedTool()}</div>
        </div>

        {/* Quick Actions & Profile Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '22px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600, fontSize: '19px', color: 'var(--navy)', marginBottom: '14px' }}>Quick actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '26px' }}>
              {quickActions.map(({ label, desc, to }) => (
                <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ y: -3 }} className="action-card"
                    style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '18px', border: '1px solid var(--line)', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '13.5px', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{desc}</div>
                  </motion.div>
                </Link>
              ))}
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600, fontSize: '19px', color: 'var(--navy)', marginBottom: '14px' }}>Recent applications</h2>
            {loading ? (
              <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '36px', textAlign: 'center', color: 'var(--ink-soft)', fontSize: '13px' }}>Loading...</div>
            ) : !stats?.recent?.length ? (
              <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '36px', textAlign: 'center', border: '1.5px dashed var(--line)' }}>
                <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '13.5px' }}>
                  No applications yet. <Link to="/home" style={{ color: 'var(--sky)', fontWeight: 700 }}>Browse universities →</Link>
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.recent.map((app) => {
                  const isExpanded = expandedTimeline === app._id;
                  return (
                    <div
                      key={app._id}
                      style={{ background: 'var(--card-bg, #fff)', borderRadius: '10px', padding: '15px 18px', border: '1px solid var(--line)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '13.5px' }}>{app.universityId?.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>{app.program} · {app.universityId?.country}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ padding: '4px 11px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, background: `${statusColors[app.status]}18`, color: statusColors[app.status] }}>
                            {app.status?.replace('_', ' ').toUpperCase()}
                          </span>
                          <button
                            onClick={() => setExpandedTimeline(isExpanded ? null : app._id)}
                            style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 600, color: 'var(--navy)', cursor: 'pointer' }}
                          >
                            {isExpanded ? 'Hide Timeline ▲' : 'View Timeline ▼'}
                          </button>
                        </div>
                      </div>

                      {/* Application Timeline Status */}
                      {isExpanded && <ApplicationTimeline currentStatus={app.status} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar (Your Profile Widget Updated) */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600, fontSize: '19px', color: 'var(--navy)', marginBottom: '14px' }}>Your profile</h2>
            <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '18px', border: '1px solid var(--line)', marginBottom: '18px' }}>
              {[
                { label: 'CGPA', value: displayCgpa },
                { label: 'IELTS', value: displayIelts },
                { label: 'Budget', value: displayBudget },
                { label: 'Target country', value: displayCountry },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--paper)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: value === 'Not set' ? 'var(--ink-soft)' : 'var(--ink)' }}>{value}</span>
                </div>
              ))}
              <Link to="/profile" style={{ display: 'block', textAlign: 'center', marginTop: '14px', padding: '9px', background: 'var(--paper)', borderRadius: '8px', color: 'var(--sky)', textDecoration: 'none', fontWeight: 700, fontSize: '12.5px' }}>
                Update profile
              </Link>
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600, fontSize: '19px', color: 'var(--navy)', marginBottom: '14px' }}>Visa guides</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {['United Kingdom', 'United States', 'Germany', 'Canada', 'Australia'].map(country => (
                <Link key={country} to={`/visa-guide/${country}`}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 15px', background: 'var(--card-bg, #fff)', borderRadius: '99px', textDecoration: 'none', border: '1px solid var(--line)', color: 'var(--ink)', fontWeight: 600, fontSize: '13px' }}>
                  {country} <span style={{ color: 'var(--sky)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// ── Internal tool components ──────────────────
const boxStyle = { padding: '16px', background: 'var(--paper, #F7F6F2)', borderRadius: '10px' };
const titleStyle = { margin: '0 0 8px 0', color: 'var(--navy, #16233F)', fontSize: '14px', fontWeight: 700 };

const AdmissionPredictor = ({ userCgpa }) => (
  <div style={boxStyle}>
    <h4 style={titleStyle}>Admission Eligibility Predictor</h4>
    <p style={{ fontSize: '13px', color: 'var(--ink-soft, #5B6B82)' }}>Your current CGPA: <strong>{userCgpa || 'Not set'}</strong></p>
    <div style={{ padding: '10px', background: 'rgba(61,131,97,0.1)', color: '#2E6449', borderRadius: '7px', fontSize: '13px', fontWeight: 600 }}>
      High chance of acceptance in UK & European universities.
    </div>
  </div>
);
const DocumentChecklist = ({ country }) => (
  <div style={boxStyle}>
    <h4 style={titleStyle}>Checklist for {country}</h4>
    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--ink-soft, #5B6B82)' }}>
      <li>Passport valid for at least 6 months</li>
      <li>Transcripts & degree certificates</li>
      <li>Statement of Purpose & recommendation letters</li>
    </ul>
  </div>
);
const CurrencyConverter = ({ amountInUSD }) => (
  <div style={boxStyle}>
    <h4 style={titleStyle}>Budget & currency estimator</h4>
    <p style={{ fontSize: '13px', color: 'var(--ink-soft, #5B6B82)' }}>Estimated annual budget: <strong>${amountInUSD.toLocaleString()} USD</strong></p>
  </div>
);
const SOPGenerator = () => (
  <div style={boxStyle}>
    <h4 style={titleStyle}>SOP assistant</h4>
    <textarea rows="3" placeholder="Write your core focus area..." style={{ width: '100%', padding: '10px', borderRadius: '7px', border: '1px solid var(--line, #DDE1E8)', background: 'var(--card-bg, #fff)', color: 'var(--ink)', boxSizing: 'border-box', fontFamily: 'inherit' }} />
    <button style={{ marginTop: '8px', padding: '8px 16px', background: 'var(--navy, #16233F)', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Generate SOP outline</button>
  </div>
);
const ScholarshipMatcher = () => (
  <div style={boxStyle}>
    <h4 style={titleStyle}>Matched scholarships</h4>
    <div style={{ fontSize: '13px', color: 'var(--ink, #16202E)' }}><strong>Merit Excellence Award</strong> — up to 50% tuition waiver</div>
  </div>
);
const CareerPredictor = () => (
  <div style={boxStyle}>
    <h4 style={titleStyle}>Career path predictor</h4>
    <p style={{ fontSize: '13px', color: 'var(--ink-soft, #5B6B82)' }}>High post-grad employment potential in Software Development & AI roles.</p>
  </div>
);
const CountryCompare = ({ selectedCountry }) => (
  <div style={boxStyle}>
    <h4 style={titleStyle}>Country overview — {selectedCountry}</h4>
    <p style={{ fontSize: '13px', color: 'var(--ink-soft, #5B6B82)' }}>Post-study work visa: 2 years · 20 hrs/week part-time allowed.</p>
  </div>
);
const InterviewPrep = () => (
  <div style={boxStyle}>
    <h4 style={titleStyle}>Embassy interview questions</h4>
    <p style={{ fontSize: '13px', color: 'var(--ink-soft, #5B6B82)' }}>Q: Why did you choose this university and country over your home country?</p>
  </div>
);
const IELTSCoach = ({ userIelts }) => (
  <div style={boxStyle}>
    <h4 style={titleStyle}>IELTS band tracker</h4>
    <p style={{ fontSize: '13px', color: 'var(--ink, #16202E)' }}>Your current band: <strong>{userIelts || 'Not set'}</strong></p>
  </div>
);

export default Dashboard;