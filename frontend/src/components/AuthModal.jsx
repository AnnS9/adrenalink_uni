import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthModal.css';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  
  useEffect(() => {
    if (isOpen) {
      setIsLoginMode(true); 
      setError(null);
      setUsername('');
      setEmail('');
      setPassword('');
    }
  }, [isOpen]);

  
  const toggleMode = () => {
    setIsLoginMode(prevMode => !prevMode);
    setError(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const endpoint = isLoginMode ? '/api/login' : '/api/signup';
    const payload = isLoginMode 
      ? { email, password } 
      : { username, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) { throw new Error(data.error || 'Something went wrong.'); }

      if (data.user) {
        
        localStorage.setItem('user', JSON.stringify(data.user));

        
        onLoginSuccess(data.user);

        navigate('/adrenaid');
      } else {
        throw new Error("Login failed: no user data returned.");
      }

  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }};

  if (!isOpen) return null;

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{isLoginMode ? 'Login' : 'Sign Up'}</h2>
        
        <form onSubmit={handleSubmit}>
          {error && <p className="error-text">{error}</p>}
          
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
