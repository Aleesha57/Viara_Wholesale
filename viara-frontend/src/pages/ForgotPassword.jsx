import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setResetLink(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setMessage('Password reset link generated! (Check mail to reset password)');
      
      // In development, show the reset link
      if (data.reset_link) {
        setResetLink(data);
        console.log('🔗 Reset Link:', data.reset_link);
        console.log('📋 UID:', data.uid);
        console.log('🔑 Token:', data.token);
      }

    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Forgot Password</h1>
          <p className="login-subtitle">Enter your email to reset your password</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {resetLink && (
            <div className="reset-link-box">
              <p><strong>Development Mode:</strong></p>
              <p>Copy this link to reset your password:</p>
              <input 
                type="text" 
                value={resetLink.reset_link} 
                readOnly 
                className="reset-link-input"
                onClick={(e) => e.target.select()}
              />
              <p className="reset-note">
                Or navigate to: <Link to={`/reset-password/${resetLink.uid}/${resetLink.token}`}>Reset Password Page</Link>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="login-footer">
            <p>Remember your password? <Link to="/login">Back to Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;