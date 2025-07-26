import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.order);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      success(`Order status updated to ${newStatus}`);
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    
    try {
      setSubmittingRating(true);
      await api.post(`/orders/${id}/rate`, { rating, review });
      success('Rating submitted successfully!');
      setOrder(prev => ({ ...prev, rating, review, isRated: true }));
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      dispatched: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      dispatched: '🚚',
      delivered: '📦',
      cancelled: '❌'
    };
    return icons[status] || '📋';
  };

  if (loading) {
    return <LoadingSpinner text="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-8">The order you're looking for doesn't exist or you don't have access to it.</p>
        <button onClick={() => navigate('/orders')} className="btn btn-primary">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order #{order.orderNumber}
          </h1>
          <p className="text-gray-600">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        
        <div className="text-right">
          <span className={`badge text-lg px-4 py-2 ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <div className="text-2xl font-bold text-primary-600 mt-2">
            {formatPrice(order.totalAmount)}
          </div>
        </div>
      </div>

      {/* Order Progress */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Order Progress</h2>
        </div>
        <div className="card-content">
          <div className="flex items-center justify-between">
            {['pending', 'confirmed', 'dispatched', 'delivered'].map((status, index) => (
              <div key={status} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  ['pending', 'confirmed', 'dispatched', 'delivered'].indexOf(order.status) >= index
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-2 text-sm font-medium capitalize">{status}</div>
                {index < 3 && (
                  <div className={`w-16 h-1 mx-4 ${
                    ['pending', 'confirmed', 'dispatched', 'delivered'].indexOf(order.status) > index
                      ? 'bg-primary-600'
                      : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Parties Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vendor Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">
              {user.role === 'vendor' ? 'Your Information' : 'Vendor Information'}
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{order.vendorName}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{order.vendorEmail}</span>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 font-medium">{order.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">
              {user.role === 'supplier' ? 'Your Information' : 'Supplier Information'}
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{order.supplierName}</span>
              </div>
              {order.supplierId.email && (
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{order.supplierId.email}</span>
                </div>
              )}
              {order.supplierId.phone && (
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">{order.supplierId.phone}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="text-gray-600">Rating:</span>
                <div className="ml-2 flex items-center space-x-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-medium">
                    {order.supplierId.rating > 0 ? order.supplierId.rating.toFixed(1) : 'New'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Order Items ({order.items.length})</h3>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                {item.productId?.imageURL ? (
                  <img
                    src={item.productId.imageURL}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                  <p className="text-sm text-gray-600">
                    {formatPrice(item.price)} per {item.unit}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} {item.unit}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-600">
                    {formatPrice(item.subtotal)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total Amount:</span>
              <span className="text-primary-600">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Delivery Information</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
              <p className="text-gray-700">{order.deliveryAddress}</p>
            </div>
            
            <div className="space-y-3">
              {order.expectedDeliveryDate && (
                <div>
                  <span className="text-gray-600">Expected Delivery:</span>
                  <span className="ml-2 font-medium">
                    {formatDate(order.expectedDeliveryDate)}
                  </span>
                </div>
              )}
              
              {order.actualDeliveryDate && (
                <div>
                  <span className="text-gray-600">Delivered On:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {formatDate(order.actualDeliveryDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {order.notes && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
              <p className="text-gray-700 italic">"{order.notes}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Supplier Actions */}
      {user.role === 'supplier' && order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Update Order Status</h3>
          </div>
          <div className="card-content">
            <div className="flex space-x-4">
              {order.status === 'pending' && (
                <button
                  onClick={() => handleUpdateStatus('confirmed')}
                  className="btn btn-primary"
                >
                  Confirm Order
                </button>
              )}
              {order.status === 'confirmed' && (
                <button
                  onClick={() => handleUpdateStatus('dispatched')}
                  className="btn btn-primary"
                >
                  Mark as Dispatched
                </button>
              )}
              {order.status === 'dispatched' && (
                <button
                  onClick={() => handleUpdateStatus('delivered')}
                  className="btn btn-primary"
                >
                  Mark as Delivered
                </button>
              )}
              
              {['pending', 'confirmed'].includes(order.status) && (
                <button
                  onClick={() => handleUpdateStatus('cancelled')}
                  className="btn btn-outline"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Section */}
      {user.role === 'vendor' && order.status === 'delivered' && !order.isRated && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Rate This Order</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <label className="label">Rating</label>
                <div className="flex items-center space-x-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400`}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="ml-4 text-gray-600">
                    {rating} star{rating !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="label">Review (Optional)</label>
                <textarea
                  rows={3}
                  className="input mt-1"
                  placeholder="Share your experience with this supplier..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              </div>
              
              <button
                type="submit"
                disabled={submittingRating}
                className="btn btn-primary"
              >
                {submittingRating ? (
                  <div className="flex items-center space-x-2">
                    <div className="spinner"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Existing Rating Display */}
      {order.isRated && order.rating && (
        <div className="card bg-yellow-50">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-yellow-800">Your Rating</h3>
          </div>
          <div className="card-content">
            <div className="flex items-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`text-xl ${star <= order.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                  ⭐
                </span>
              ))}
              <span className="ml-2 font-medium text-yellow-800">
                {order.rating} out of 5 stars
              </span>
            </div>
            {order.review && (
              <p className="text-yellow-700 italic">"{order.review}"</p>
            )}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="text-center">
        <button
          onClick={() => navigate('/orders')}
          className="btn btn-outline btn-lg"
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;