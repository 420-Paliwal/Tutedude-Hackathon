import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { success, error } = useToast();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    try {
      addToCart(product, product.minOrderQuantity || 1);
      success(`Added ${product.name} to cart`);
    } catch (err) {
      error('Failed to add item to cart');
    }
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600' };
    if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-600' };
    return { text: 'In Stock', color: 'text-green-600' };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <Link to={`/products/${product._id}`}>
        <div className="relative">
          {product.imageURL ? (
            <img
              src={product.imageURL}
              alt={product.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
              <span className="text-6xl">{getCategoryIcon(product.category)}</span>
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-lg flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="card-content">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center space-x-1 text-yellow-500">
            <span>⭐</span>
            <span className="text-sm text-gray-600">
              {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
            </span>
          </div>
        </div>

        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary-600">
              {formatPrice(product.price)}<span className="text-sm font-normal text-gray-500">/{product.unit}</span>
            </span>
            <span className={`text-sm font-medium ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Min. Order: {product.minOrderQuantity || 1} {product.unit}</span>
            <span>Stock: {product.stock} {product.unit}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {getCategoryIcon(product.category)} {product.category}
            </span>
            <span className="ml-2">by {product.supplierName}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Link 
            to={`/products/${product._id}`}
            className="btn btn-outline btn-sm flex-1"
          >
            View Details
          </Link>
          
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-sm flex-1"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;