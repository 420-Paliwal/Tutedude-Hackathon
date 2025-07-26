import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, validateCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    deliveryAddress: user?.address || '',
    phone: user?.phone || '',
    notes: ''
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      error('Your cart is empty');
      return;
    }

    const validation = validateCart();
    if (!validation.valid) {
      error(validation.error);
      return;
    }

    if (!orderForm.deliveryAddress.trim() || !orderForm.phone.trim()) {
      error('Please provide delivery address and phone number');
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        deliveryAddress: orderForm.deliveryAddress.trim(),
        phone: orderForm.phone.trim(),
        notes: orderForm.notes.trim()
      };

      const response = await api.post('/orders', orderData);
      
      success('Order placed successfully!');
      clearCart();
      navigate(`/orders/${response.data.order._id}`);
      
    } catch (err) {
      error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-8">
          Start shopping for quality ingredients from verified suppliers
        </p>
        <Link to="/products" className="btn btn-primary btn-lg">
          Browse Products
        </Link>
      </div>
    );
  }

  const supplierName = cartItems[0]?.supplierName;
  const cartTotal = getCartTotal();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          Review your items and place your order with {supplierName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Items ({cartItems.length})</h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
            
            <div className="card-content space-y-4">
              {cartItems.map(item => (
                <div key={item.productId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.imageURL ? (
                      <img
                        src={item.imageURL}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-600">by {item.supplierName}</p>
                    <p className="text-lg font-bold text-primary-600">
                      {formatPrice(item.price)}<span className="text-sm text-gray-500">/{item.unit}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Min. order: {item.minOrderQuantity} {item.unit}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= item.minOrderQuantity}
                      className="btn btn-outline btn-sm w-8 h-8 p-0 flex items-center justify-center disabled:opacity-50"
                    >
                      −
                    </button>
                    
                    <input
                      type="number"
                      min={item.minOrderQuantity}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || item.minOrderQuantity)}
                      className="w-16 text-center input input-sm"
                    />
                    
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="btn btn-outline btn-sm w-8 h-8 p-0 flex items-center justify-center disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Checkout */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>
            
            <div className="card-content space-y-4">
              <div className="space-y-2">
                {cartItems.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(cartTotal)}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Supplier: {supplierName}</p>
                <p>Items: {cartItems.length}</p>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Delivery Information</h2>
            </div>
            
            <div className="card-content">
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="label">Delivery Address *</label>
                  <textarea
                    required
                    rows={3}
                    className="input mt-1"
                    placeholder="Enter your complete delivery address"
                    value={orderForm.deliveryAddress}
                    onChange={(e) => setOrderForm({...orderForm, deliveryAddress: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    className="input mt-1"
                    placeholder="Enter your phone number"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="label">Special Instructions</label>
                  <textarea
                    rows={2}
                    className="input mt-1"
                    placeholder="Any special delivery instructions..."
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="spinner"></div>
                      <span>Placing Order...</span>
                    </div>
                  ) : (
                    `Place Order - ${formatPrice(cartTotal)}`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Continue Shopping */}
          <Link
            to="/products"
            className="btn btn-outline btn-lg w-full"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Order Notes */}
      <div className="card bg-blue-50">
        <div className="card-content">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Order Information</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• All items in your cart are from the same supplier</p>
            <p>• Minimum order quantities are automatically applied</p>
            <p>• You will receive order confirmation once supplier accepts</p>
            <p>• Delivery typically takes 1-2 business days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;