import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const result = await updateProfile(formData);
      
      if (result.success) {
        success('Profile updated successfully!');
      } else {
        error(result.error || 'Failed to update profile');
      }
    } catch (err) {
      error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
          {user.role === 'vendor' ? '🧑‍🍳 Street Food Vendor' : '🏪 Raw Material Supplier'}
        </div>
      </div>

      {/* Profile Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Profile Information</h2>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="label">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input mt-1"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="input mt-1 bg-gray-50"
                value={user.email}
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
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
                rows={4}
                className="input mt-1"
                placeholder="Enter your complete address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Role</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <span className="text-gray-700 font-medium">
                  {user.role === 'vendor' ? 'Street Food Vendor' : 'Raw Material Supplier'}
                </span>
                <p className="text-sm text-gray-500 mt-1">Role cannot be changed</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="spinner"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Profile'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Account Statistics</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl text-primary-600 mb-2">⭐</div>
              <div className="text-2xl font-bold text-primary-600">
                {user.rating > 0 ? user.rating.toFixed(1) : 'New'}
              </div>
              <div className="text-sm text-gray-600">
                {user.role === 'vendor' ? 'Your Rating' : 'Supplier Rating'}
              </div>
              {user.totalRatings > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Based on {user.totalRatings} review{user.totalRatings !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-3xl text-secondary-600 mb-2">📅</div>
              <div className="text-lg font-bold text-secondary-600">
                {formatDate(user.createdAt)}
              </div>
              <div className="text-sm text-gray-600">Member Since</div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Account Status</h2>
        </div>
        <div className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Account Status</div>
              <div className="text-sm text-gray-600">Your account is currently active</div>
            </div>
            <span className="badge badge-success">Active</span>
          </div>
        </div>
      </div>

      {/* Role-specific Information */}
      {user.role === 'vendor' ? (
        <div className="card bg-blue-50">
          <div className="card-content">
            <h3 className="font-semibold text-blue-900 mb-3">🧑‍🍳 Vendor Benefits</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Access to verified suppliers across your region</li>
              <li>• Competitive wholesale pricing for street vendors</li>
              <li>• Order tracking from placement to delivery</li>
              <li>• Rate and review suppliers to help the community</li>
              <li>• Build relationships with trusted suppliers</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="card bg-green-50">
          <div className="card-content">
            <h3 className="font-semibold text-green-900 mb-3">🏪 Supplier Benefits</h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li>• Reach street food vendors in your area</li>
              <li>• Manage your product catalog and inventory</li>
              <li>• Process orders and update delivery status</li>
              <li>• Build your reputation through vendor ratings</li>
              <li>• Grow your business with BazaarBuddy</li>
            </ul>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.role === 'vendor' ? (
              <>
                <a href="/products" className="btn btn-outline w-full">
                  Browse Products
                </a>
                <a href="/orders" className="btn btn-outline w-full">
                  View My Orders
                </a>
              </>
            ) : (
              <>
                <a href="/" className="btn btn-outline w-full">
                  Manage Products
                </a>
                <a href="/orders" className="btn btn-outline w-full">
                  View Orders
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Help & Support */}
      <div className="card bg-gray-50">
        <div className="card-content">
          <h3 className="font-semibold text-gray-900 mb-3">📞 Need Help?</h3>
          <p className="text-sm text-gray-700 mb-4">
            If you have any questions or need assistance, our support team is here to help.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-900">Contact Support</div>
              <div className="text-gray-600">support@bazaarbuddy.com</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Business Hours</div>
              <div className="text-gray-600">Mon-Sat, 9 AM - 6 PM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;