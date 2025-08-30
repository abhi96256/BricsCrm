import React, { useState, useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import api from '../api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'employee'
  });

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const lottieContainer = useRef(null);



  useEffect(() => {
    if (lottieContainer.current) {
      const anim = lottie.loadAnimation({
        container: lottieContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/CRMD.json'
      });

      return () => anim.destroy();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setLoginError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setRegisterError('Please fill in all required fields.');
      return;
    }

    try {
            const response = await api.post('/auth/register', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('Registration successful:', user);
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
      } else {
        setRegisterError(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred. Please try again.';
      setRegisterError(message);
      console.error('Registration error:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
            const response = await api.post('/auth/login', {
        email: loginData.email,
        password: loginData.password,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user)); // Store user info
        
        console.log('Login successful:', user);
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
      } else {
        setLoginError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred. Please try again.';
      setLoginError(message);
      console.error('Login error:', error);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setLoginError('');
    setRegisterError('');
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'employee'
    });
    setLoginData({
      email: '',
      password: ''
    });
  };

  return (
    <div className="login-container">
      {/* Left Panel - Login Form */}
      <div className="login-form-panel">
        <div className="form-content">
          <div className="logo-section">
            <div className="logo">CRM</div>
          </div>
          
          <h1 className="main-heading">
            {isLoginMode ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="subtitle">
            {isLoginMode ? 'Sign in to your account' : 'Sign up and get 30 day free trial'}
          </p>
          
          {isLoginMode ? (
            // Login Form
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="loginEmail">Email</label>
                <input
                  type="email"
                  id="loginEmail"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginInputChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="loginPassword"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    className="form-input"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {loginError && (
                <div className="error-message">
                  {loginError}
                </div>
              )}
              
              <button type="submit" className="submit-btn">
                Sign In
              </button>
            </form>
          ) : (
            // Registration Form
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="fullName">Full name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="employee">Employee</option>
                  <option value="sub-admin">Sub Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your password"
                />
              </div>
              
              {registerError && (
                <div className="error-message">
                  {registerError}
                </div>
              )}
              <button type="submit" className="submit-btn">
                Submit
              </button>
            </form>
          )}
          
          <div className="social-login">
            <button className="social-btn apple-btn">
              <svg className="apple-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
            <button className="social-btn google-btn">
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </div>
          
          <div className="form-footer">
            <span>
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                onClick={toggleMode} 
                className="link-button"
                style={{ background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isLoginMode ? 'Sign up' : 'Sign in'}
              </button>
            </span>
            <a href="#" className="link">Terms & Conditions</a>
          </div>

          {/* Demo Account Info */}
          <div className="demo-info" style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: 'rgba(233, 69, 96, 0.1)', 
            borderRadius: '8px', 
            border: '1px solid rgba(233, 69, 96, 0.3)' 
          }}>
            <h4 style={{ color: '#e94560', margin: '0 0 0.5rem 0' }}>Demo Accounts:</h4>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              <p><strong>Admin:</strong> qqq@gmail.com / 123456</p>
              <p><strong>Sub Admin:</strong> subadmin@gmail.com / 123456</p>
              <p><strong>Manager:</strong> john@gmail.com / 123456</p>
              <p><strong>Employee:</strong> sarah@gmail.com / 123456</p>
            </div>
          </div>

          {/* Additional content to make page scrollable */}
          <div className="additional-content">
            <div className="features-section">
              <h2>Why Choose CRM?</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">🚀</div>
                  <h3>Fast & Efficient</h3>
                  <p>Streamline your workflow with our powerful CRM tools</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🔒</div>
                  <h3>Secure & Reliable</h3>
                  <p>Your data is protected with enterprise-grade security</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📊</div>
                  <h3>Analytics & Insights</h3>
                  <p>Get detailed reports and actionable insights</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🤝</div>
                  <h3>24/7 Support</h3>
                  <p>Our team is always here to help you succeed</p>
                </div>
              </div>
            </div>

            <div className="testimonials-section">
              <h2>What Our Users Say</h2>
              <div className="testimonials-grid">
                <div className="testimonial-card">
                  <p>"CRm has transformed how we manage our customer relationships. Highly recommended!"</p>
                  <div className="testimonial-author">
                    <strong>Sarah Johnson</strong>
                    <span>Marketing Manager</span>
                  </div>
                </div>
                <div className="testimonial-card">
                  <p>"The analytics features are incredible. We've seen a 40% increase in productivity."</p>
                  <div className="testimonial-author">
                    <strong>Mike Chen</strong>
                    <span>Sales Director</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pricing-section">
              <h2>Simple Pricing</h2>
              <div className="pricing-grid">
                <div className="pricing-card">
                  <h3>Starter</h3>
                  <div className="price">$29<span>/month</span></div>
                  <ul>
                    <li>Up to 5 users</li>
                    <li>Basic features</li>
                    <li>Email support</li>
                  </ul>
                </div>
                <div className="pricing-card featured">
                  <h3>Professional</h3>
                  <div className="price">$79<span>/month</span></div>
                  <ul>
                    <li>Up to 25 users</li>
                    <li>Advanced features</li>
                    <li>Priority support</li>
                  </ul>
                </div>
                <div className="pricing-card">
                  <h3>Enterprise</h3>
                  <div className="price">$199<span>/month</span></div>
                  <ul>
                    <li>Unlimited users</li>
                    <li>All features</li>
                    <li>Dedicated support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Lottie Animation */}
      <div className="illustrative-panel">
        <div className="lottie-container" ref={lottieContainer}></div>
      </div>
    </div>
  );
};

export default Login;
