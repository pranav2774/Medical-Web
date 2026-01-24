import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../utils/authService';
import '../styles/globals.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    passwordConfirm: '',
    role: 'user',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check password strength in real-time for signup
    if (name === 'password' && !isLogin) {
      setPasswordStrength({
        minLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecialChar: /[@$!%*?&]/.test(value)
      });
    }

    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError(isLogin ? 'Email/Phone and password are required' : 'Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError('Name is required');
        return false;
      }

      if (formData.password !== formData.passwordConfirm) {
        setError('Passwords do not match');
        return false;
      }

      // Validate password strength
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }

      if (!/[A-Z]/.test(formData.password)) {
        setError('Password must contain at least 1 uppercase letter');
        return false;
      }

      if (!/[a-z]/.test(formData.password)) {
        setError('Password must contain at least 1 lowercase letter');
        return false;
      }

      if (!/\d/.test(formData.password)) {
        setError('Password must contain at least 1 number');
        return false;
      }

      if (!/[@$!%*?&]/.test(formData.password)) {
        setError('Password must contain at least 1 special character (@$!%*?&)');
        return false;
      }

      if (formData.phone && formData.phone.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const response = await authService.login({
          email: formData.email,
          password: formData.password,
        });

        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = response.user.role === 'admin' ? '/admin' : '/dashboard';
        }, 1500);
      } else {
        const response = await authService.register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
          role: formData.role,
        });

        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          window.location.href = formData.role === 'admin' ? '/admin' : '/dashboard';
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      passwordConfirm: '',
      role: 'user',
    });
    setPasswordStrength({
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4 py-6 sm:py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block p-3 bg-primary-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-primary-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 1 1 0 100-2 4 4 0 00-4 4v10a4 4 0 004 4h8a4 4 0 004-4V5a1 1 0 10-2 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Morya Medical</h1>
          <p className="text-gray-600">
            {isLogin ? 'Welcome back!' : 'Join us today'}
          </p>
        </div>

        {/* Form Card */}
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

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Name Field - Only for Register */}
            {!isLogin && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="form-input text-sm"
                  required
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {isLogin ? 'Email or Phone Number' : 'Email Address'} <span className="text-red-500">*</span>
              </label>
              <input
                type={isLogin ? "text" : "email"}
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={isLogin ? "Enter email or phone number" : "Enter your email"}
                className="form-input text-sm"
                required
              />
            </div>

            {/* Phone Field - Only for Register */}
            {!isLogin && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  maxLength="10"
                  className="form-input text-sm"
                />
              </div>
            )}

            {/* Sign up as Admin Checkbox - Only for Register */}
            {!isLogin && (
              <div className="p-3 bg-gray-50 rounded-lg flex items-center">
                <input
                  type="checkbox"
                  id="signupAsAdmin"
                  checked={formData.role === 'admin'}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.checked ? 'admin' : 'user' }))}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="signupAsAdmin" className="ml-2 text-xs sm:text-sm text-gray-700 cursor-pointer font-medium">
                  Sign up as Admin
                </label>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="form-input text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {isLogin && (
                <p className="text-right text-xs text-primary-600 hover:text-primary-700 mt-1 cursor-pointer">
                  Forgot password?
                </p>
              )}

              {/* Password Strength Indicator - Only for Signup */}
              {!isLogin && formData.password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center text-xs ${passwordStrength.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        {passwordStrength.minLength ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        )}
                      </svg>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center text-xs ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        {passwordStrength.hasUpperCase ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        )}
                      </svg>
                      One uppercase letter
                    </div>
                    <div className={`flex items-center text-xs ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        {passwordStrength.hasLowerCase ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        )}
                      </svg>
                      One lowercase letter
                    </div>
                    <div className={`flex items-center text-xs ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        {passwordStrength.hasNumber ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        )}
                      </svg>
                      One number
                    </div>
                    <div className={`flex items-center text-xs ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        {passwordStrength.hasSpecialChar ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        )}
                      </svg>
                      One special character (@$!%*?&)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field - Only for Register */}
            {!isLogin && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="form-input text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-4 sm:mt-6 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-4 sm:mt-6">
          By continuing, you agree to our{' '}
          <span className="text-primary-600 cursor-pointer hover:underline">
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="text-primary-600 cursor-pointer hover:underline">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
