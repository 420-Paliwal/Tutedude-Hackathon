import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product._id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, {
          productId: product._id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          imageURL: product.imageURL,
          supplierName: product.supplierName,
          supplierId: product.supplierId,
          stock: product.stock,
          minOrderQuantity: product.minOrderQuantity,
          quantity: quantity
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const validateCart = () => {
    // Check if all items are from the same supplier
    if (cartItems.length === 0) return { valid: true };
    
    const firstSupplierId = cartItems[0].supplierId;
    const allSameSupplier = cartItems.every(item => item.supplierId === firstSupplierId);
    
    if (!allSameSupplier) {
      return { 
        valid: false, 
        error: 'All items in cart must be from the same supplier' 
      };
    }

    // Check minimum order quantities
    for (const item of cartItems) {
      if (item.quantity < item.minOrderQuantity) {
        return {
          valid: false,
          error: `Minimum order quantity for ${item.name} is ${item.minOrderQuantity}`
        };
      }
    }

    return { valid: true };
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    validateCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};