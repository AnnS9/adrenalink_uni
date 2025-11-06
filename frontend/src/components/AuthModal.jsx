import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthModal.css';

const BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, nextPath }) {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoginMode(true);
      setError(null);
      setUsername('');
      setFullName('');
      setEmail('');
      setPassword('');
    }
  }, [isOpen]);

  const toggleMode = () => {
    setIsLoginMode(prevMode => !prevMode);
    setError(null);
  };

  const parseJsonSafe = async (res) => {
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return null;
    const txt = await res.text();
    if (!txt) return null;
    try { return JSON.parse(txt); } catch { return null; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const endpoint = isLoginMode ? `${BASE}/api/login` : `${BASE}/api/signup`;
    const payload = isLoginMode
      ? { email, password }
      : { username, full_name: fullName, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `HTTP ${response.status}`);
      }

      const data = await parseJsonSafe(response);
      if (!data || !data.user) throw new Error('Invalid server response');

      localStorage.setItem('user', JSON.stringify(data.user));
      if (onLoginSuccess) onLoginSuccess(data.user);

      navigate(nextPath || '/adrenaid', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{isLoginMode ? 'Login' : 'Sign Up'}</h2>

        <form onSubmit={handleSubmit}>
          {error && <p className="error-text">{error}</p>}

          {!isLoginMode && (
            <>
              <div className="form-group">
                <label htmlFor="full_name">Full name</label>
                <input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLoginMode ? 'Log In' : 'Create Account')}
          </button>

          <p className="toggle-text">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
            <button type="button" className="toggle-btn" onClick={toggleMode}>
              {isLoginMode ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
