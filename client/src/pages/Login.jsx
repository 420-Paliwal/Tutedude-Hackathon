import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        success('Login successful! Welcome to BazaarBuddy');
        navigate('/');
      } else {
        error(result.error || 'Login failed');
      }
    } catch (err) {
      error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary-600 mb-2">
            🏪 BazaarBuddy
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="card">
          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input mt-1"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input mt-1"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="spinner"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Accounts <span className='text-xs'>(can register too)</span></h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">🧑‍🍳 Vendor Account</p>
                <p className="text-blue-700">vendor@demo.com / password123</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-900">🏪 Supplier Account</p>
                <p className="text-green-700">supplier@demo.com / password123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="text-center">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span>🔒</span>
              <span>Secure Login</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>⚡</span>
              <span>Fast & Easy</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎯</span>
              <span>Role-based Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📱</span>
              <span>Mobile Friendly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;