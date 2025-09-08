'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '../services/supabase';
import { LogIn, Mail } from 'lucide-react';
import './login.css';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log('LoginPage component mounted');
  }, []);

  const handleGoogleLogin = async () => {
    console.log('Google login button clicked');
    setIsLoading(true);
    setError(null);
    
    try {
      const authService = new AuthService();
      console.log('AuthService created');
      const { error } = await authService.signInWithGoogle();
      console.log('Sign in result:', { error });
      
      if (error) {
        console.error('Sign in error:', error);
        setError(error.message);
        setIsLoading(false);
      }
      // If successful, the OAuth flow will redirect automatically
    } catch (err) {
      console.error('Unexpected error in handleGoogleLogin:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const authService = new AuthService();
    const result = isSignUp 
      ? await authService.signUpWithEmail(email, password)
      : await authService.signInWithEmail(email, password);
    
    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
    } else {
      // Redirect to home page after successful login
      window.location.href = '/';
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Roadmapster</h1>
          <p className="login-subtitle">Visual Capacity Planning for Teams</p>
        </div>
        
        <div className="login-content">
          {!showEmailForm ? (
            <>
              <p className="login-description">
                Sign in with your Google Workspace account to access your team's roadmap.
              </p>
              
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Button clicked - native event');
                  handleGoogleLogin();
                }}
                disabled={isLoading}
                className="login-button"
                type="button"
              >
                <LogIn size={20} />
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
              
              <div className="login-divider">
                <span>OR</span>
              </div>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Email login button clicked - native event');
                  setShowEmailForm(true);
                }}
                className="login-button secondary"
                data-testid="email-login-button"
                type="button"
              >
                <Mail size={20} />
                Sign in with Email
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailAuth} className="email-form">
              <h3>{isSignUp ? 'Create Account' : 'Sign In'}</h3>
              
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}
              
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
                data-testid="email-input"
              />
              
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
                data-testid="password-input"
                minLength={6}
              />
              
              <button
                type="submit"
                disabled={isLoading}
                className="login-button"
                data-testid="submit-button"
              >
                {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
              
              <p className="login-toggle">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="link-button"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
              
              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(false);
                  setError(null);
                }}
                className="link-button"
              >
                ← Back to other options
              </button>
            </form>
          )}
          
          <p className="login-note">
            By signing in, you agree to use Roadmapster for your team's capacity planning.
          </p>
        </div>
      </div>
    </div>
  );
}