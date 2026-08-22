import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    const role = params.get('role');
    const pic = params.get('pic');

    if (token) {
      login({ name, email, role, profilePicture: pic }, token);
      toast.success(`Welcome, ${name}! 🎉`);
      navigate('/dashboard');
    } else {
      toast.error('Authentication failed');
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0f1e' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
        <p style={{ color: '#94a3b8' }}>Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
