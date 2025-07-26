import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData);
      
      if (result.success) {
        success('Registration successful! Welcome to BazaarBuddy');
        navigate('/');
      } else {
        error(result.error || 'Registration failed');
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        <div className="card">
          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="label">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className={`input mt-1 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`input mt-1 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="role" className="label">
                  I am a *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className={`input mt-1 ${errors.role ? 'border-red-500' : ''}`}
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">Select your role</option>
                  <option value="vendor">🧑‍🍳 Street Food Vendor</option>
                  <option value="supplier">🏪 Raw Material Supplier</option>
                </select>
                {errors.role && <p className="error-message">{errors.role}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="label">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input mt-1"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="address" className="label">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  className="input mt-1"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`input mt-1 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <p className="error-message">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={`input mt-1 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
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
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Role Description */}
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Role</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">🧑‍🍳 Street Food Vendor</p>
                <p className="text-blue-700">Browse and order raw materials from verified suppliers</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-900">🏪 Raw Material Supplier</p>
                <p className="text-green-700">List your products and manage orders from vendors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;