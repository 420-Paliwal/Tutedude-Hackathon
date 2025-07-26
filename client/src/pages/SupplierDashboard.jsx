import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import OrderCard from '../components/OrderCard';

const SupplierDashboard = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    stock: '',
    category: 'vegetables',
    imageURL: '',
    minOrderQuantity: '1'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, ordersResponse, productsResponse] = await Promise.all([
        api.get('/orders/statistics/dashboard'),
        api.get('/orders?limit=5'),
        api.get(`/products/supplier/${user._id}`)
      ]);

      setStats(statsResponse.data.stats);
      setRecentOrders(ordersResponse.data.orders);
      setProducts(productsResponse.data.products);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/products', {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        minOrderQuantity: parseInt(productForm.minOrderQuantity)
      });

      success('Product added successfully!');
      setProducts([response.data.product, ...products]);
      setProductForm({
        name: '',
        description: '',
        price: '',
        unit: 'kg',
        stock: '',
        category: 'vegetables',
        imageURL: '',
        minOrderQuantity: '1'
      });
      setShowAddProduct(false);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      success(`Order status updated to ${newStatus}`);
      
      // Update the order in the list
      setRecentOrders(orders => 
        orders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update order status');
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
      <div className="bg-gradient-to-r from-secondary-600 to-primary-600 rounded-lg text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.name}! 🏪
            </h1>
            <p className="text-lg opacity-90">
              Manage your products and fulfill orders from street food vendors
            </p>
          </div>
          <div className="text-6xl opacity-20">
            📦
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowAddProduct(true)}
            className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-all text-left"
          >
            <div className="text-2xl mb-2">➕</div>
            <div className="font-semibold">Add Product</div>
            <div className="text-sm opacity-80">List new items</div>
          </button>
          
          <Link to="/orders" className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-all">
            <div className="text-2xl mb-2">📦</div>
            <div className="font-semibold">Manage Orders</div>
            <div className="text-sm opacity-80">Process customer orders</div>
          </Link>
          
          <Link to="/profile" className="bg-white bg-opacity-20 rounded-lg p-4 hover:bg-opacity-30 transition-all">
            <div className="text-2xl mb-2">👤</div>
            <div className="font-semibold">My Profile</div>
            <div className="text-sm opacity-80">Update your information</div>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
                {formatPrice(stats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-content text-center">
              <div className="text-3xl text-secondary-600 mb-2">📦</div>
              <div className="text-2xl font-bold text-secondary-600">{stats.totalProducts}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Add New Product</h3>
                <button 
                  onClick={() => setShowAddProduct(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="card-content">
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Product Name *</label>
                    <input
                      type="text"
                      required
                      className="input mt-1"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      placeholder="Enter product name"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Category *</label>
                    <select
                      required
                      className="input mt-1"
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    >
                      <option value="vegetables">🥬 Vegetables</option>
                      <option value="fruits">🍎 Fruits</option>
                      <option value="spices">🌶️ Spices</option>
                      <option value="grains">🌾 Grains</option>
                      <option value="oils">🫒 Oils</option>
                      <option value="dairy">🥛 Dairy</option>
                      <option value="meat">🥩 Meat</option>
                      <option value="beverages">🥤 Beverages</option>
                      <option value="packaging">📦 Packaging</option>
                      <option value="other">📋 Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input mt-1"
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    placeholder="Enter product description"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="input mt-1"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Unit *</label>
                    <select
                      required
                      className="input mt-1"
                      value={productForm.unit}
                      onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="l">Liter (l)</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="piece">Piece</option>
                      <option value="dozen">Dozen</option>
                      <option value="packet">Packet</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="label">Stock Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="input mt-1"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Min Order Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="input mt-1"
                      value={productForm.minOrderQuantity}
                      onChange={(e) => setProductForm({...productForm, minOrderQuantity: e.target.value})}
                      placeholder="1"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Image URL</label>
                    <input
                      type="url"
                      className="input mt-1"
                      value={productForm.imageURL}
                      onChange={(e) => setProductForm({...productForm, imageURL: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    Add Product
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddProduct(false)}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
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
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order._id} className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">From: {order.vendorName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        {formatPrice(order.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-600">{order.items.length} items</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`badge ${order.status === 'pending' ? 'badge-warning' : order.status === 'delivered' ? 'badge-success' : 'badge-info'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')}
                            className="btn btn-primary btn-sm"
                          >
                            Confirm
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'dispatched')}
                            className="btn btn-primary btn-sm"
                          >
                            Dispatch
                          </button>
                        )}
                        {order.status === 'dispatched' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                            className="btn btn-primary btn-sm"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-content text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">Orders from vendors will appear here once you list your products!</p>
              <button 
                onClick={() => setShowAddProduct(true)}
                className="btn btn-primary"
              >
                Add Your First Product
              </button>
            </div>
          </div>
        )}
      </div>

      {/* My Products */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Products ({products.length})</h2>
          <button 
            onClick={() => setShowAddProduct(true)}
            className="btn btn-primary"
          >
            Add New Product
          </button>
        </div>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product._id} className="card">
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
                  
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
                      <span className="text-white font-semibold">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className="card-content">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  
                  <div className="flex items-center justify-between mb-2">
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
                  
                  <div className="text-sm text-gray-600 mb-3">
                    Stock: {product.stock} {product.unit}
                  </div>
                  
                  <Link to={`/products/${product._id}`} className="btn btn-outline btn-sm w-full">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-content text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Listed</h3>
              <p className="text-gray-600 mb-6">Start by adding your first product to attract vendors!</p>
              <button 
                onClick={() => setShowAddProduct(true)}
                className="btn btn-primary"
              >
                Add Your First Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierDashboard;