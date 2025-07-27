import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorDashboard from './pages/VendorDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import LoadingSpinner from './components/LoadingSpinner';
import CreateGroupOrder from './pages/CreateGroupOrder';
import JoinGroupOrder from './pages/JoinGroupOrder';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Dashboard Route Component
const DashboardRoute = () => {
  const { user } = useAuth();
  
  if (user?.role === 'vendor') {
    return <VendorDashboard />;
  } else if (user?.role === 'supplier') {
    return <SupplierDashboard />;
  }
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />

                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardRoute />
                  </ProtectedRoute>
                } />

                {/* Vendor Routes */}
                <Route path="/products" element={
                  <ProtectedRoute requiredRole="vendor">
                    <ProductList />
                  </ProtectedRoute>
                } />
                <Route path="/products/:id" element={
                  <ProtectedRoute requiredRole="vendor">
                    <ProductDetails />
                  </ProtectedRoute>
                } />
                <Route path="/cart" element={
                  <ProtectedRoute requiredRole="vendor">
                    <Cart />
                  </ProtectedRoute>
                } />

                {/* Common Routes */}
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/group/create" element={<CreateGroupOrder/>} />
        <Route path="/group/join" element={<JoinGroupOrder/>} />
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;