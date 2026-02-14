import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../utils/authService';
import '../styles/globals.css';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email;

  const [email, setEmail] = useState(emailFromState || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!emailFromState && !email) {
      const stored = sessionStorage.getItem('verifyEmail');
      if (stored) setEmail(stored);
    }
  }, [emailFromState, email]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter the 6-digit code from your email');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.verifyEmail({ email: email.trim(), otp: otp.trim() });
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      setSuccess('Email verified! Redirecting...');
      setTimeout(() => {
        navigate(response.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Try again or request a new one.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');
    setResendLoading(true);
    try {
      await authService.resendVerification({ email: email.trim() });
      setSuccess('New code sent. Check your email.');
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Could not send code. Try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();
    if (user?.emailVerified) {
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4 py-6 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block p-3 bg-primary-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Verify your email</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            We sent a 6-digit code to your email. Enter it below.
          </p>
        </div>

        <div className="card p-6 sm:p-8 shadow-lg">
          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-xs sm:text-sm font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-xs sm:text-sm font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="form-input text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                6-digit code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="form-input text-sm text-center tracking-[0.5em] text-lg"
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify email'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Didn&apos;t receive the code?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              className="text-primary-600 font-semibold text-sm hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : resendLoading
                  ? 'Sending...'
                  : 'Resend code'}
            </button>
          </div>

          <p className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-primary-600 font-semibold text-sm hover:text-primary-700"
            >
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
