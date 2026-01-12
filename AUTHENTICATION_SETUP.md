# Authentication Setup Guide

Due to file permission issues, please create these files manually. Here are all the files you need:

## Step 1: Install react-router-dom
```bash
npm install react-router-dom
```

## Step 2: Create the following files

### File 1: `src/api/authApi.js`
```javascript
import axios from 'axios';

const AUTH_API_URL = 'http://localhost:8080/api/auth';

// Create axios instance for auth
const authClient = axios.create({
  baseURL: AUTH_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (username, password) => {
    try {
      const response = await authClient.post('/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (username, password, prePassword) => {
    try {
      const response = await authClient.post('/register', {
        username,
        password,
        prePassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async (token) => {
    try {
      const response = await axios.get(`${AUTH_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
```

### File 2: `src/context/AuthContext.js`
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
      // Optionally fetch user info
      fetchUserInfo(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async (authToken) => {
    try {
      const userData = await authService.getCurrentUser(authToken);
      if (userData.data) {
        setUser(userData.data);
      } else {
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      // If token is invalid, clear it
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const { accessToken, refreshToken } = response;
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setToken(accessToken);
      
      // Fetch user info
      await fetchUserInfo(accessToken);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please check your credentials.';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (username, password, prePassword) => {
    try {
      const response = await authService.register(username, password, prePassword);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### File 3: `src/pages/Login.js`
```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [prePassword, setPrePassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (isRegister) {
        if (password !== prePassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        result = await register(username, password, prePassword);
        if (result.success) {
          // After successful registration, automatically log in
          const loginResult = await login(username, password);
          if (loginResult.success) {
            navigate('/');
          } else {
            setError(loginResult.error || 'Registration successful. Please log in.');
            setIsRegister(false);
          }
        } else {
          setError(result.error);
        }
      } else {
        result = await login(username, password);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <LogIn size={32} />
          </div>
          <h1 className="login-title">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="login-subtitle">
            {isRegister 
              ? 'Sign up to start managing your tasks' 
              : 'Sign in to continue to your task manager'}
          </p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">
              <User size={16} />
              Username
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Confirm your password"
                  value={prePassword}
                  onChange={(e) => setPrePassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner">Loading...</span>
            ) : (
              <>
                <LogIn size={18} />
                {isRegister ? 'Sign Up' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setPassword('');
                setPrePassword('');
              }}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

### File 4: `src/pages/Login.css`
```css
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 48px;
  width: 100%;
  max-width: 440px;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 14px;
  animation: shake 0.3s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-message svg {
  flex-shrink: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-label svg {
  color: #6b7280;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  color: #111827;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .form-input {
  padding-right: 48px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.password-toggle:hover {
  color: #374151;
  background: #f3f4f6;
}

.login-button {
  width: 100%;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  transition: color 0.2s;
}

.link-button:hover {
  color: #764ba2;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }

  .login-title {
    font-size: 24px;
  }
}
```

## Step 3: Update existing files

### Update `src/index.js`:
Replace the entire content with:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
```

### Update `src/App.js`:
Add these imports at the top:
```javascript
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import LogOut from 'lucide-react';
```

Then wrap your existing component in a function and add routing. The full updated App.js will be provided separately.

### Update `src/components/TaskManager.js`:
Move all the current App.js content (except imports and routing) to a new file `src/components/TaskManager.js`, then import it in App.js.

## Step 4: Add logout button to header

In your TaskManager component, add a logout button in the header icons section.
