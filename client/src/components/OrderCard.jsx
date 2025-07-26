import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OrderCard = ({ order }) => {
  const { user } = useAuth();

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="card-content">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              Order #{order.orderNumber}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <span className={`badge ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              {user.role === 'vendor' ? 'Supplier:' : 'Vendor:'}
            </span>
            <span className="font-medium">
              {user.role === 'vendor' ? order.supplierName : order.vendorName}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Items:</span>
            <span className="font-medium">{order.items.length} item(s)</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold text-primary-600 text-lg">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="border-t pt-3 mb-4">
          <div className="space-y-1">
            {order.items.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-medium">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-sm text-gray-500 italic">
                +{order.items.length - 2} more item(s)
              </p>
            )}
          </div>
        </div>

        {/* Delivery Info */}
        {order.expectedDeliveryDate && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Expected Delivery:</span>
              <span className="font-medium">
                {formatDate(order.expectedDeliveryDate)}
              </span>
            </div>
            {order.actualDeliveryDate && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Delivered On:</span>
                <span className="font-medium text-green-600">
                  {formatDate(order.actualDeliveryDate)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Rating Display */}
        {order.isRated && order.rating && (
          <div className="bg-yellow-50 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Your Rating:</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-lg ${i < order.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                    ⭐
                  </span>
                ))}
              </div>
            </div>
            {order.review && (
              <p className="text-sm text-gray-600 mt-1 italic">"{order.review}"</p>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <Link 
            to={`/orders/${order._id}`}
            className="btn btn-outline btn-sm flex-1"
          >
            View Details
          </Link>
          
          {user.role === 'vendor' && order.status === 'delivered' && !order.isRated && (
            <Link
              to={`/orders/${order._id}`}
              className="btn btn-primary btn-sm flex-1"
            >
              Rate Order
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;