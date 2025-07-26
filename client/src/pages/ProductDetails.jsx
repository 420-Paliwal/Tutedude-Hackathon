import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { success, error } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const [productResponse, relatedResponse] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/products?limit=4&category=${product?.category || 'vegetables'}`)
      ]);

      const productData = productResponse.data.product;
      setProduct(productData);
      setQuantity(productData.minOrderQuantity || 1);

      // Fetch related products based on category
      const relatedRes = await api.get(`/products?limit=4&category=${productData.category}`);
      setRelatedProducts(relatedRes.data.products.filter(p => p._id !== productData._id));
      
    } catch (err) {
      console.error('Failed to fetch product details:', err);
      error('Failed to load product details');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    try {
      addToCart(product, quantity);
      success(`Added ${quantity} ${product.unit} of ${product.name} to cart`);
    } catch (err) {
      error('Failed to add item to cart');
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

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { text: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  if (loading) {
    return <LoadingSpinner text="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span>›</span>
        <span className="capitalize">{product.category}</span>
        <span>›</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative">
            {product.imageURL ? (
              <img
                src={product.imageURL}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-8xl">{getCategoryIcon(product.category)}</span>
              </div>
            )}
            
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">Out of Stock</span>
              </div>
            )}
          </div>
          
          {/* Product Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <div className="card-content text-center py-4">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-sm font-medium">Verified Quality</div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content text-center py-4">
                <div className="text-2xl mb-1">🚚</div>
                <div className="text-sm font-medium">Fast Delivery</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                {getCategoryIcon(product.category)} {product.category}
              </span>
              <span className={`text-sm px-2 py-1 rounded-full ${stockStatus.bgColor} ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500 text-lg">⭐</span>
                <span className="font-medium">
                  {product.rating > 0 ? product.rating.toFixed(1) : 'New'}
                </span>
                {product.totalRatings > 0 && (
                  <span className="text-gray-600 text-sm">({product.totalRatings} reviews)</span>
                )}
              </div>
            </div>
            
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {formatPrice(product.price)}
              <span className="text-lg font-normal text-gray-500">/{product.unit}</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Product Details */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium capitalize">{product.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Unit:</span>
                <span className="ml-2 font-medium">{product.unit}</span>
              </div>
              <div>
                <span className="text-gray-600">Available Stock:</span>
                <span className="ml-2 font-medium">{product.stock} {product.unit}</span>
              </div>
              <div>
                <span className="text-gray-600">Min. Order:</span>
                <span className="ml-2 font-medium">{product.minOrderQuantity} {product.unit}</span>
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Supplier Information</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🏪</span>
              </div>
              <div>
                <h4 className="font-semibold">{product.supplierId.name}</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm">
                      {product.supplierId.rating > 0 ? product.supplierId.rating.toFixed(1) : 'New Supplier'}
                    </span>
                  </div>
                  {product.supplierId.totalRatings > 0 && (
                    <span className="text-gray-600 text-xs">({product.supplierId.totalRatings} ratings)</span>
                  )}
                </div>
                {product.supplierId.address && (
                  <p className="text-sm text-gray-600 mt-1">{product.supplierId.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          {product.stock > 0 ? (
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Order This Product</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Quantity ({product.unit})</label>
                  <div className="flex items-center space-x-4 mt-2">
                    <button
                      onClick={() => setQuantity(Math.max(product.minOrderQuantity, quantity - 1))}
                      disabled={quantity <= product.minOrderQuantity}
                      className="btn btn-outline btn-sm w-10 h-10 p-0 flex items-center justify-center disabled:opacity-50"
                    >
                      −
                    </button>
                    
                    <input
                      type="number"
                      min={product.minOrderQuantity}
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(product.minOrderQuantity, parseInt(e.target.value) || product.minOrderQuantity))}
                      className="w-20 text-center input"
                    />
                    
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="btn btn-outline btn-sm w-10 h-10 p-0 flex items-center justify-center disabled:opacity-50"
                    >
                      +
                    </button>
                    
                    <span className="text-sm text-gray-600">
                      Max: {product.stock} {product.unit}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">Total Price:</span>
                    <span className="font-bold text-primary-600">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="btn btn-primary btn-lg flex-1"
                  >
                    Add to Cart
                  </button>
                  
                  <Link to="/cart" className="btn btn-outline btn-lg">
                    View Cart
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-red-200 rounded-lg p-6 bg-red-50">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Out of Stock</h3>
              <p className="text-red-700">This product is currently out of stock. Please check back later or contact the supplier.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct._id} className="card hover:shadow-md transition-shadow">
                <Link to={`/products/${relatedProduct._id}`}>
                  <div className="relative">
                    {relatedProduct.imageURL ? (
                      <img
                        src={relatedProduct.imageURL}
                        alt={relatedProduct.name}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center">
                        <span className="text-4xl">{getCategoryIcon(relatedProduct.category)}</span>
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="card-content">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{relatedProduct.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {relatedProduct.supplierName}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      {formatPrice(relatedProduct.price)}<span className="text-sm text-gray-500">/{relatedProduct.unit}</span>
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm text-gray-600">
                        {relatedProduct.rating > 0 ? relatedProduct.rating.toFixed(1) : 'New'}
                      </span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/products/${relatedProduct._id}`}
                    className="btn btn-outline btn-sm w-full mt-3"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;