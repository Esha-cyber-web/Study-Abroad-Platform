import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const statusColors = {
  submitted: '#3B7A9E',
  under_review: '#C9A227',
  accepted: '#3D8361',
  rejected: '#B23A3A',
  waitlisted: '#7A5FA6',
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalApps: 0, pendingApps: 0, acceptedApps: 0 });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Fallback to "Esha" if user context name is Dev User / empty
  const rawName = user?.name || user?.fullName || user?.username || (user?.email ? user.email.split('@')[0] : '');
  const displayName = (!rawName || rawName.toLowerCase().includes('dev')) ? 'Esha' : rawName;
  const avatarInitials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          api.get('/admin/stats').catch(() => ({ data: { data: null } })),
          api.get('/admin/applications').catch(() => ({ data: { data: [] } })),
        ]);

        if (statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
        if (appsRes.data?.data) {
          setApplications(appsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await api.patch(`/admin/applications/${appId}`, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Failed to update application status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Welcome Header */}
        <div style={{ background: '#0E1830', borderRadius: '16px', padding: '36px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '11px', letterSpacing: '2px', color: '#C9A227', textTransform: 'uppercase', fontWeight: 600 }}>
              Admin Panel
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '10px 0 6px' }}>
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt="avatar" 
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} 
                />
              ) : (
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '20px', border: '2px solid rgba(255,255,255,0.2)'
                }}>
                  {avatarInitials}
                </div>
              )}
              <div>
                <h1 style={{ margin: 0, fontWeight: 600, fontSize: '26px', color: '#fff' }}>
                  Welcome back, {displayName}
                </h1>
                <p style={{ margin: '2px 0 0', color: '#AEB9CC', fontSize: '14px' }}>System Overview & Student Applications Management</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '22px', border: '1px solid #E7EAEF' }}>
            <div style={{ fontSize: '30px', fontWeight: 600, color: '#16233F', marginBottom: '6px' }}>
              {loading ? '...' : stats.totalUsers || 0}
            </div>
            <div style={{ fontSize: '12.5px', color: '#5B6B82', fontWeight: 600 }}>Total Registered Students</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '22px', border: '1px solid #E7EAEF' }}>
            <div style={{ fontSize: '30px', fontWeight: 600, color: '#3B7A9E', marginBottom: '6px' }}>
              {loading ? '...' : stats.totalApps || applications.length || 0}
            </div>
            <div style={{ fontSize: '12.5px', color: '#5B6B82', fontWeight: 600 }}>Total Applications Submitted</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '22px', border: '1px solid #E7EAEF' }}>
            <div style={{ fontSize: '30px', fontWeight: 600, color: '#C9A227', marginBottom: '6px' }}>
              {loading ? '...' : stats.pendingApps || applications.filter(a => ['submitted', 'under_review'].includes(a?.status)).length}
            </div>
            <div style={{ fontSize: '12.5px', color: '#5B6B82', fontWeight: 600 }}>Pending Review</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '22px', border: '1px solid #E7EAEF' }}>
            <div style={{ fontSize: '30px', fontWeight: 600, color: '#3D8361', marginBottom: '6px' }}>
              {loading ? '...' : stats.acceptedApps || applications.filter(a => a?.status === 'accepted').length}
            </div>
            <div style={{ fontSize: '12.5px', color: '#5B6B82', fontWeight: 600 }}>Accepted Applications</div>
          </div>
        </div>

        {/* Student Applications Table */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E7EAEF' }}>
          <h2 style={{ fontWeight: 600, fontSize: '20px', color: '#16233F', marginTop: 0, marginBottom: '18px' }}>
            Recent Student Applications
          </h2>

          {loading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#5B6B82', fontSize: '13.5px' }}>
              Loading applications dataset...
            </div>
          ) : applications.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', border: '1.5px dashed #E7EAEF', borderRadius: '10px', color: '#5B6B82', fontSize: '13.5px' }}>
              No applications found in system database.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #E7EAEF', color: '#5B6B82' }}>
                    <th style={{ padding: '12px 10px', fontWeight: 700 }}>Student Name</th>
                    <th style={{ padding: '12px 10px', fontWeight :700 }}>University</th>
                    <th style={{ padding: '12px 10px', fontWeight: 700 }}>Program</th>
                    <th style={{ padding: '12px 10px', fontWeight :700 }}>Current Status</th>
                    <th style={{ padding: '12px 10px', fontWeight :700, textAlign: 'right' }}>Action Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id} style={{ borderBottom: '1px solid #E7EAEF' }}>
                      <td style={{ padding: '14px 10px', fontWeight: 600, color: '#16233F' }}>
                        {app.userId?.name || app.studentName || 'Student'}
                        <div style={{ fontSize: '11px', color: '#5B6B82', fontWeight: 400 }}>{app.userId?.email}</div>
                      </td>
                      <td style={{ padding: '14px 10px', color: '#16202E' }}>
                        {app.universityId?.name || app.universityName || 'University'}
                      </td>
                      <td style={{ padding: '14px 10px', color: '#5B6B82' }}>
                        {app.program || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700,
                          background: `${statusColors[app.status] || '#94A0B3'}18`,
                          color: statusColors[app.status] || '#94A0B3'
                        }}>
                          {app.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                        <select
                          disabled={updatingId === app._id}
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          style={{
                            padding: '6px 10px', borderRadius: '6px', border: '1px solid #E7EAEF',
                            fontSize: '12px', fontWeight: 600, color: '#16233F', cursor: 'pointer', background: '#F7F6F2'
                          }}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="waitlisted">Waitlisted</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;