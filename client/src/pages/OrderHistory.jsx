import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import OrderCard from '../components/OrderCard';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    status: 'all'
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });

      // Remove 'all' filter
      if (filters.status === 'all') {
        params.delete('status');
      }

      const response = await api.get(`/orders?${params}`);
      
      if (page === 1) {
        setOrders(response.data.orders);
      } else {
        setOrders(prev => [...prev, ...response.data.orders]);
      }
      
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (pagination.hasNext) {
      fetchOrders(pagination.current + 1);
    }
  };

  const getStatusStats = () => {
    const stats = {
      all: orders.length,
      pending: orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length,
      dispatched: orders.filter(o => o.status === 'dispatched').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user.role === 'vendor' ? 'My Orders' : 'Order Management'}
        </h1>
        <p className="text-gray-600">
          {user.role === 'vendor' 
            ? 'Track your orders and view order history'
            : 'Manage orders from vendors and update their status'
          }
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'all', label: 'All Orders', count: stats.all },
            { key: 'pending', label: 'Pending', count: stats.pending },
            { key: 'dispatched', label: 'In Transit', count: stats.dispatched },
            { key: 'delivered', label: 'Delivered', count: stats.delivered },
            { key: 'cancelled', label: 'Cancelled', count: stats.cancelled }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilters({ ...filters, status: tab.key })}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                filters.status === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  filters.status === tab.key
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <LoadingSpinner text="Loading your orders..." />
      ) : orders.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>

          {/* Load More Button */}
          {pagination.hasNext && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="btn btn-outline btn-lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="spinner"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  'Load More Orders'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {filters.status === 'all' ? '📦' : 
             filters.status === 'pending' ? '⏳' :
             filters.status === 'dispatched' ? '🚚' :
             filters.status === 'delivered' ? '✅' : '❌'}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filters.status === 'all' ? 'No Orders Yet' :
             `No ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)} Orders`}
          </h3>
          <p className="text-gray-600 mb-6">
            {user.role === 'vendor' ? (
              filters.status === 'all' 
                ? "You haven't placed any orders yet. Start shopping for quality ingredients!"
                : `You don't have any ${filters.status} orders at the moment.`
            ) : (
              filters.status === 'all'
                ? "You haven't received any orders yet. Make sure your products are listed and visible to vendors!"
                : `You don't have any ${filters.status} orders at the moment.`
            )}
          </p>
          {user.role === 'vendor' && filters.status === 'all' && (
            <a href="/products" className="btn btn-primary">
              Browse Products
            </a>
          )}
        </div>
      )}

      {/* Order Statistics for Suppliers */}
      {user.role === 'supplier' && orders.length > 0 && (
        <div className="card bg-gray-50">
          <div className="card-content">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.all}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.dispatched}</div>
                <div className="text-sm text-gray-600">In Transit</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="card bg-blue-50">
        <div className="card-content">
          <h3 className="font-semibold text-blue-900 mb-2">
            {user.role === 'vendor' ? '📋 Order Status Guide' : '📋 Order Management Guide'}
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            {user.role === 'vendor' ? (
              <>
                <p>• <span className="font-medium">Pending:</span> Your order is awaiting supplier confirmation</p>
                <p>• <span className="font-medium">Confirmed:</span> Supplier has accepted your order</p>
                <p>• <span className="font-medium">Dispatched:</span> Your order is on the way</p>
                <p>• <span className="font-medium">Delivered:</span> Order completed - you can rate the supplier</p>
              </>
            ) : (
              <>
                <p>• <span className="font-medium">Pending:</span> New orders awaiting your confirmation</p>
                <p>• <span className="font-medium">Confirmed:</span> Orders ready for dispatch</p>
                <p>• <span className="font-medium">Dispatched:</span> Orders currently being delivered</p>
                <p>• <span className="font-medium">Delivered:</span> Successfully completed orders</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;