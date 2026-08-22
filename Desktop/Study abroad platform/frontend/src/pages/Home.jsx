import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UniversityCard from '../components/UniversityCard';
import Footer from '../components/Footer';
import api from '../utils/api';

const COUNTRIES = ['All', 'Pakistan', 'UK', 'USA', 'Germany', 'Canada', 'Australia'];

export const DEFAULT_UNIVERSITIES = [
  {
    _id: '65f1a2b3c4d5e6f789012341',
    name: 'National University of Sciences and Technology (NUST)',
    country: 'Pakistan',
    city: 'Islamabad',
    description: 'Top ranked public university in Pakistan for Engineering & Computer Science.',
    website: 'https://nust.edu.pk',
    courses: ['Computer Science', 'Software Engineering', 'Data Science', 'Electrical Engineering'],
    ranking: 334,
    fees: 1200,
    currency: 'USD',
    scholarships: [{ name: 'HEC Need-Based Scholarship', details: 'Full tuition fee waiver' }],
    isActive: true,
  },
  {
    _id: '65f1a2b3c4d5e6f789012346',
    name: 'COMSATS University Islamabad',
    country: 'Pakistan',
    city: 'Islamabad / Lahore / Sahiwal',
    description: 'Leading public sector university renowned for IT, Computer Science, and Engineering programs.',
    website: 'https://www.comsats.edu.pk',
    courses: ['Computer Science', 'Software Engineering', 'Artificial Intelligence', 'Cyber Security'],
    ranking: 601,
    fees: 900,
    currency: 'USD',
    scholarships: [{ name: 'Campus Need-Based Scholarship', details: 'Partial to Full tuition fee support' }],
    isActive: true,
  },
  {
    _id: '65f1a2b3c4d5e6f789012347',
    name: 'FAST NUCES',
    country: 'Pakistan',
    city: 'Lahore / Islamabad',
    description: 'Premier university in Pakistan for Software Engineering and Computer Science education.',
    website: 'https://nu.edu.pk',
    courses: ['Software Engineering', 'Computer Science', 'Data Science'],
    ranking: 500,
    fees: 1100,
    currency: 'USD',
    scholarships: [{ name: 'FAST Financial Assistance', details: 'Need-based loan/scholarship' }],
    isActive: true,
  },
  {
    _id: '65f1a2b3c4d5e6f789012344',
    name: 'LUMS (Lahore University of Management Sciences)',
    country: 'Pakistan',
    city: 'Lahore',
    description: 'Leading private university in Pakistan with top-tier business & CS faculty.',
    website: 'https://lums.edu.pk',
    courses: ['Computer Science', 'Business Administration', 'Electrical Engineering'],
    ranking: 600,
    fees: 3500,
    currency: 'USD',
    scholarships: [{ name: 'NOP Scholarship Program', details: '100% Fully Funded' }],
    isActive: true,
  },
  {
    _id: '65f1a2b3c4d5e6f789012345',
    name: 'Quaid-i-Azam University (QAU)',
    country: 'Pakistan',
    city: 'Islamabad',
    description: 'Ranked #1 public research university in Pakistan.',
    website: 'https://qau.edu.pk',
    courses: ['Physics', 'Computer Science', 'Chemistry'],
    ranking: 1,
    fees: 800,
    currency: 'USD',
    scholarships: [{ name: 'Ehsaas Scholarship', details: 'Need-based' }],
    isActive: true,
  },
  {
    _id: '65f1a2b3c4d5e6f789012342',
    name: 'University of Oxford',
    country: 'UK',
    city: 'Oxford',
    description: 'A world-leading research university with global alumni networks.',
    website: 'https://www.ox.ac.uk',
    courses: ['Computer Science', 'Economics', 'Physics'],
    ranking: 1,
    fees: 28000,
    currency: 'GBP',
    scholarships: [{ name: 'Clarendon Fund', details: 'Fully Funded' }],
    isActive: true,
  },
  {
    _id: '65f1a2b3c4d5e6f789012343',
    name: 'Harvard University',
    country: 'USA',
    city: 'Cambridge',
    description: 'Prestigious Ivy League institution known for academic excellence.',
    website: 'https://www.harvard.edu',
    courses: ['Business', 'Data Science', 'Law'],
    ranking: 2,
    fees: 56000,
    currency: 'USD',
    scholarships: [{ name: 'Harvard Financial Aid', details: 'Need-based aid' }],
    isActive: true,
  }
];

const Home = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [hasScholarship, setHasScholarship] = useState(false);

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      try {
        const res = await api.get('/universities', {
          params: {
            search: searchTerm || undefined,
            // Agar hasScholarship selected hai toh country check mat lagayein taake har country se results aayein
            country: hasScholarship ? undefined : (selectedCountry === 'All' ? undefined : selectedCountry),
            hasScholarship: hasScholarship ? 'true' : undefined,
          },
        });

        const data = res?.data?.data || res?.data;
        
        if (Array.isArray(data) && data.length > 0) {
          setUniversities(data);
        } else {
          filterLocalData();
        }
      } catch (err) {
        console.log('Backend fallback triggering local dataset:', err);
        filterLocalData();
      } finally {
        setLoading(false);
      }
    };

    const filterLocalData = () => {
      let list = [...DEFAULT_UNIVERSITIES];

      // Step 1: Filter by Scholarships first if active
      if (hasScholarship) {
        list = list.filter((u) => u.scholarships && u.scholarships.length > 0);
      } else if (selectedCountry !== 'All') {
        // Only apply country filter if scholarship toggle is NOT active
        list = list.filter((u) => u.country.toLowerCase() === selectedCountry.toLowerCase());
      }

      // Step 2: Search term filter
      if (searchTerm) {
        list = list.filter(
          (u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.country.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setUniversities(list);
    };

    fetchUniversities();
  }, [selectedCountry, searchTerm, hasScholarship]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header / Hero */}
      <section style={{ background: '#0f172a', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '12px' }}>Explore Universities</h1>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Find and filter top universities worldwide</p>

        {/* Search Bar */}
        <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', background: 'white', borderRadius: '30px', padding: '6px 16px' }}>
          <input
            type="text"
            placeholder="Search by name, city, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '10px', fontSize: '14px', color: '#1e293b' }}
          />
        </div>
      </section>

      {/* Filters Bar */}
      <div style={{ background: 'white', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {COUNTRIES.map((country) => (
          <button
            key={country}
            onClick={() => {
              setSelectedCountry(country);
              setHasScholarship(false); // Country click karne par scholarship filter toggle off ho jaye
            }}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              background: (!hasScholarship && selectedCountry === country) ? '#6366f1' : '#f1f5f9',
              color: (!hasScholarship && selectedCountry === country) ? 'white' : '#475569',
            }}
          >
            {country === 'Pakistan' ? '🇵🇰 Pakistan' : country}
          </button>
        ))}

        <button
          onClick={() => setHasScholarship(!hasScholarship)}
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            background: hasScholarship ? '#fef3c7' : '#f1f5f9',
            color: hasScholarship ? '#d97706' : '#475569',
            border: hasScholarship ? '1px solid #f59e0b' : 'none'
          }}
        >
          🎓 Scholarships Available
        </button>
      </div>

      {/* Grid Results */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Loading universities...</p>
        ) : universities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '18px', color: '#64748b' }}>No universities matched your search.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {universities.map((uni) => (
              <UniversityCard key={uni._id} uni={uni} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;