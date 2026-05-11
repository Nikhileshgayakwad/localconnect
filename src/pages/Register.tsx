import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { apiClient, API_BASE_URL, getApiErrorMessage } from '../lib/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as 'buyer' | 'seller',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setIsLoading(true);

    try {
      const requestUrl = '/api/auth/register';
      console.log('[Auth:Register] Sending request to', `${API_BASE_URL}${requestUrl}`);
      const response = await apiClient.post(requestUrl, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      
      login(response.data);
      const role = response.data?.user?.role === 'seller' ? 'seller' : 'buyer';
      navigate(role === 'seller' ? '/seller/dashboard' : '/marketplace');
    } catch (err) {
      console.error('[Auth:Register] Request failed:', err);
      setError(getApiErrorMessage(err, 'Could not reach the backend. Ensure API is running at http://localhost:3000.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mx-auto mt-8 w-full max-w-md"
      >
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg shadow-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-900 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Start buying and selling in your local community.
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
                Sign in here
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start rounded-xl border border-rose-300 bg-rose-50 p-3 dark:border-rose-500/50 dark:bg-rose-500/10">
                <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 text-rose-500" />
                <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Account Type</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'buyer' }))}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    formData.role === 'buyer'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300'
                      : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'seller' }))}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    formData.role === 'seller'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300'
                      : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  Seller
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Full Name
              </label>
              <div className="relative mt-1 rounded-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-zinc-300 bg-white p-2.5 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Email address
              </label>
              <div className="relative mt-1 rounded-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-zinc-300 bg-white p-2.5 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Password
              </label>
              <div className="relative mt-1 rounded-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-zinc-300 bg-white p-2.5 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Confirm Password
              </label>
              <div className="relative mt-1 rounded-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-zinc-300 bg-white p-2.5 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${isLoading ? 'cursor-not-allowed opacity-75' : ''} dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Create account <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
