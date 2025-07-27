import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    const commonLinks = [
      { to: '/', label: 'Dashboard', icon: '🏠' },
      { to: '/orders', label: 'Orders', icon: '📦' },
      { to: '/profile', label: 'Profile', icon: '👤' }
    ];
    
    if (user.role === 'vendor') {
      return [
        { to: '/', label: 'Dashboard', icon: '🏠' },
        { to: '/products', label: 'Browse Products', icon: '🛍️' },
        { to: '/cart', label: `Cart (${getCartCount()})`, icon: '🛒' },
        { to: '/orders', label: 'My Orders', icon: '📦' },
        { to: '/profile', label: 'Profile', icon: '👤' },
      ];
    }
    
    return commonLinks;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-xl font-bold text-primary-600">
              🏪 BazaarBuddy
            </div>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <span>{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          )}

          


          {/* User Menu */}
          <div className="flex items-center space-x-4 ml-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="text-xs">
                  <span className="text-gray-600">Welcome, </span>
                  <span className="font-semibold text-gray-900">{user.name}</span>
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {user.role === 'vendor' ? '🧑‍🍳 Vendor' : '🏪 Supplier'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {getNavLinks().map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;