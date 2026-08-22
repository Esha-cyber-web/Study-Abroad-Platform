import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Theme Hook Import
import api from '../utils/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme(); // Dark Mode Hook Destructuring

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAITools, setShowAITools] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch { /* silent */ }
    };
    if (user) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const aiTools = [
    { path: '/assessment', label: 'Eligibility Predictor' },
    { path: '/scholarships', label: 'Scholarship Matcher' },
    { path: '/sop-generator', label: 'SOP Generator' },
    { path: '/career-predictor', label: 'Career Predictor' },
    { path: '/country-compare', label: 'Country Compare' },
    { path: '/interview-prep', label: 'Interview Prep' },
    { path: '/budget-planner', label: 'Budget Planner' },
    { path: '/ielts-coach', label: 'IELTS Coach' },
  ];

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/home', label: 'Universities' },
    { path: '/applications', label: 'Applications' },
  ];

  const menuCardStyle = {
    background: isDarkMode ? '#16233F' : '#fff',
    borderRadius: '12px',
    boxShadow: '0 20px 48px rgba(14,24,48,0.18)',
    border: isDarkMode ? '1px solid #1E2D4A' : '1px solid #E7EAEF',
    overflow: 'hidden',
    zIndex: 100,
    fontFamily: 'var(--font-body, "IBM Plex Sans", sans-serif)',
  };

  // Dynamically set name to Esha if "Dev" or unassigned
  const rawName = user?.name || user?.fullName || user?.username || '';
  const displayName = (!rawName || rawName.toLowerCase().includes('dev')) 
    ? 'Esha' 
    : rawName.split(' ')[0];

  return (
    <nav style={{
      position: 'sticky', top: '0', zIndex: 1000,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 32px',
      background: '#0E1830',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      fontFamily: 'var(--font-body, "IBM Plex Sans", sans-serif)',
    }}>
      {/* Logo */}
      <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '2px' }}>
        <span style={{ fontFamily: 'var(--font-display, "Newsreader", serif)', fontStyle: 'italic', fontWeight: 600, fontSize: '19px', color: '#fff' }}>
          StudyAbroad
        </span>
        <span style={{ fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)', fontSize: '15px', color: '#C9A227', fontWeight: 600 }}>.ai</span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {navLinks.map(({ path, label }) => (
          <Link key={path} to={path} style={{
            textDecoration: 'none', padding: '8px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
            color: isActive(path) ? '#fff' : '#AEB9CC',
            borderBottom: isActive(path) ? '2px solid #C9A227' : '2px solid transparent',
            transition: 'color 0.15s',
          }}>
            {label}
          </Link>
        ))}

        {/* AI Tools Dropdown */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowAITools(!showAITools); setShowNotifs(false); setShowUserMenu(false); }}
            style={{
              padding: '8px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
              background: 'transparent', color: '#AEB9CC', border: 'none', cursor: 'pointer',
            }}>
            AI Tools ▾
          </button>

          <AnimatePresence>
            {showAITools && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ ...menuCardStyle, position: 'absolute', left: 0, top: '44px', width: '224px' }}>
                {aiTools.map(({ path, label }) => (
                  <Link key={path} to={path} onClick={() => setShowAITools(false)}
                    style={{
                      display: 'block', padding: '11px 16px', textDecoration: 'none',
                      color: isDarkMode ? '#F7F6F2' : '#16202E', fontSize: '13.5px', fontWeight: 500,
                      borderBottom: isDarkMode ? '1px solid #1E2D4A' : '1px solid #F2F3F5'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = isDarkMode ? '#1E2D4A' : '#F7F6F2'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    {label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            cursor: 'pointer',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            transition: 'all 0.2s ease',
          }}
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        <Link to="/favorites" style={{ textDecoration: 'none', color: '#AEB9CC', fontSize: '18px' }} title="Favorites">♡</Link>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '17px', position: 'relative', padding: '4px', color: '#AEB9CC' }}>
            ◎
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-4px', background: '#C9A227', color: '#0E1830', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ ...menuCardStyle, position: 'absolute', right: 0, top: '40px', width: '320px' }}>
                <div style={{ padding: '14px 16px', borderBottom: isDarkMode ? '1px solid #1E2D4A' : '1px solid #F2F3F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: isDarkMode ? '#F7F6F2' : '#16233F', fontSize: '14px' }}>Notifications</span>
                  {unreadCount > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#C9A227', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Mark all read</button>}
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#94A0B3', fontSize: '13px' }}>No notifications yet</div>
                  ) : notifications.map((n) => (
                    <div key={n._id} onClick={() => { if (n.link) navigate(n.link); setShowNotifs(false); }}
                      style={{ padding: '13px 16px', borderBottom: isDarkMode ? '1px solid #1E2D4A' : '1px solid #F7F6F2', background: n.read ? 'transparent' : 'rgba(201,162,39,0.08)', cursor: n.link ? 'pointer' : 'default' }}>
                      <div style={{ fontWeight: n.read ? 500 : 700, fontSize: '13px', color: isDarkMode ? '#F7F6F2' : '#16233F', marginBottom: '4px' }}>{n.title}</div>
                      <div style={{ fontSize: '12px', color: '#94A0B3' }}>{n.body}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '999px', padding: '5px 12px 5px 5px', cursor: 'pointer' }}>
            <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=C9A227&color=0E1830`}
              alt="avatar" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
            <span style={{ fontSize: '9px', color: '#AEB9CC' }}>▾</span>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ ...menuCardStyle, position: 'absolute', right: 0, top: '44px', width: '200px' }}>
                {[
                  { label: 'My Profile', path: '/profile' },
                  { label: 'Applications', path: '/applications' },
                  { label: 'Favorites', path: '/favorites' },
                  ...(user?.role?.toLowerCase() === 'admin' ? [{ label: 'Admin Panel', path: '/admin' }] : []),
                ].map(({ label, path }) => (
                  <Link key={path} to={path} onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'block', padding: '11px 16px', textDecoration: 'none',
                      color: isDarkMode ? '#F7F6F2' : '#16202E', fontSize: '13.5px', fontWeight: 500,
                      borderBottom: isDarkMode ? '1px solid #1E2D4A' : '1px solid #F2F3F5'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = isDarkMode ? '#1E2D4A' : '#F7F6F2'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    {label}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none', textAlign: 'left', color: '#C0392B', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;