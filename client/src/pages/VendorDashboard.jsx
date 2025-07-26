import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import OrderCard from '../components/OrderCard';

const VendorDashboard = () => {
  const { user } = useAuth();
  const { getCartCount, getCartTotal } = useCart();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const [statsResponse, ordersResponse, productsResponse] = await Promise.all([
        api.get('/orders/statistics/dashboard'),
        api.get('/orders?limit=3'),
        api.get('/products?limit=6&sortBy=rating&sortOrder=desc')
      ]);

      setStats(statsResponse.data.stats);
      setRecentOrders(ordersResponse.data.orders);
      setFeaturedProducts(productsResponse.data.products);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      vegetables: '🥬',
      fruits: '🍎',
      spices: '🌶️',
      grains: '🌾',
      oils: '🫒',
      dairy: '🥛',
      meat: '🥩',
      beverages: '🥤',
      packaging: '📦',
      other: '📋'
    };
    return icons[category] || '📋';
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.name}! 🧑‍🍳
            </h1>
            <p className="text-lg opacity-90">
              Ready to source quality ingredients for your street food business?
            </p>
          </div>
          <div className="text-6xl opacity-20">
            🏪
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/products" className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-all">
            <div className="text-2xl mb-2">🛍️</div>
            <div className="font-semibold">Browse Products</div>
            <div className="text-sm opacity-80">Find quality ingredients</div>
          </Link>
          
          <Link to="/cart" className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-all">
            <div className="text-2xl mb-2">🛒</div>
            <div className="font-semibold">My Cart ({getCartCount()})</div>
            <div className="text-sm opacity-80">{formatPrice(getCartTotal())}</div>
          </Link>
          
          <Link to="/orders" className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-all">
            <div className="text-2xl mb-2">📦</div>
            <div className="font-semibold">My Orders</div>
            <div className="text-sm opacity-80">Track your purchases</div>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-content text-center">
              <div className="text-3xl text-blue-600 mb-2">📊</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content text-center">
              <div className="text-3xl text-yellow-600 mb-2">⏳</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              <div className="text-sm text-gray-600">Pending Orders</div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content text-center">
              <div className="text-3xl text-green-600 mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</div>
              <div className="text-sm text-gray-600">Delivered Orders</div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content text-center">
              <div className="text-3xl text-primary-600 mb-2">💰</div>
              <div className="text-2xl font-bold text-primary-600">
                {formatPrice(stats.totalSpent)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
          <Link to="/orders" className="text-primary-600 hover:text-primary-700 font-medium">
            View All Orders →
          </Link>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentOrders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-content text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">Start by browsing our quality ingredients!</p>
              <Link to="/products" className="btn btn-primary">
                Browse Products
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Top Rated Products</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
            View All Products →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map(product => (
            <div key={product._id} className="card hover:shadow-md transition-shadow">
              <Link to={`/products/${product._id}`}>
                <div className="relative">
                  {product.imageURL ? (
                    <img
                      src={product.imageURL}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
                      <span className="text-4xl">{getCategoryIcon(product.category)}</span>
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="card-content">
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">by {product.supplierName}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(product.price)}<span className="text-sm text-gray-500">/{product.unit}</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm text-gray-600">
                      {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
                    </span>
                  </div>
                </div>
                
                <Link 
                  to={`/products/${product._id}`}
                  className="btn btn-outline btn-sm w-full mt-3"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-gray-50">
        <div className="card-content">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/products?category=vegetables" className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
              <span className="text-3xl mb-2">🥬</span>
              <span className="text-sm font-medium">Vegetables</span>
            </Link>
            
            <Link to="/products?category=spices" className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
              <span className="text-3xl mb-2">🌶️</span>
              <span className="text-sm font-medium">Spices</span>
            </Link>
            
            <Link to="/products?category=oils" className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
              <span className="text-3xl mb-2">🫒</span>
              <span className="text-sm font-medium">Oils</span>
            </Link>
            
            <Link to="/products?category=packaging" className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
              <span className="text-3xl mb-2">📦</span>
              <span className="text-sm font-medium">Packaging</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;