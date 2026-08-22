import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS = {
  Submitted: '#3B7A9E',
  'Under Review': '#C9A227',
  Accepted: '#3D8361',
  Rejected: '#B23A3A',
  Waitlisted: '#7A5FA6',
};

const DashboardAnalytics = ({ applications = [] }) => {
  // 1. Process Data for Status (Pie Chart)
  const statusCounts = applications.reduce((acc, app) => {
    const status = app.status ? app.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.keys(statusCounts).map((key) => ({
    name: key,
    value: statusCounts[key],
  }));

  // Fallback dummy data if no applications exist yet
  const displayStatusData = statusData.length > 0 ? statusData : [
    { name: 'Submitted', value: 4 },
    { name: 'Under Review', value: 3 },
    { name: 'Accepted', value: 5 },
    { name: 'Rejected', value: 1 },
  ];

  // 2. Process Data for Country (Bar Chart)
  const countryCounts = applications.reduce((acc, app) => {
    const country = app.universityId?.country || app.country || 'USA';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  const countryData = Object.keys(countryCounts).map((key) => ({
    country: key,
    applications: countryCounts[key],
  }));

  // Fallback dummy data
  const displayCountryData = countryData.length > 0 ? countryData : [
    { country: 'USA', applications: 6 },
    { country: 'UK', applications: 4 },
    { country: 'Canada', applications: 3 },
    { country: 'Germany', applications: 2 },
    { country: 'Australia', applications: 1 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
      
      {/* Chart 1: Applications by Status */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #E7EAEF' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#16233F', fontWeight: 600 }}>
          Applications by Status
        </h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayStatusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {displayStatusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.name] || '#3B7A9E'} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Applications by Country */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #E7EAEF' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#16233F', fontWeight: 600 }}>
          Applications by Destination Country
        </h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayCountryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="country" tick={{ fontSize: 12, fill: '#5B6B82' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5B6B82' }} />
              <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
              <Bar dataKey="applications" fill="#0E1830" radius={[6, 6, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default DashboardAnalytics;