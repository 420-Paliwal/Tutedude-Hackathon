import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...filters
      });

      // Remove empty values
      Object.keys(filters).forEach(key => {
        if (!filters[key] || filters[key] === 'all') {
          params.delete(key);
        }
      });

      const response = await api.get(`/products?${params}`);
      
      if (page === 1) {
        setProducts(response.data.products);
      } else {
        setProducts(prev => [...prev, ...response.data.products]);
      }
      
      setPagination(response.data.pagination);
      
      // Update URL params
      const newParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          newParams.set(key, filters[key]);
        }
      });
      setSearchParams(newParams);
      
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      handleFilterChange('search', e.target.value);
    }
  };

  const loadMore = () => {
    if (pagination.hasNext) {
      fetchProducts(pagination.current + 1);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchParams({});
  };

  const getCategoryIcon = (categoryValue) => {
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
    return icons[categoryValue] || '📋';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Quality Ingredients
        </h1>
        <p className="text-lg text-gray-600">
          Find fresh raw materials from verified suppliers for your street food business
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="label">Search Products</label>
              <input
                type="text"
                className="input mt-1"
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onKeyDown={handleSearch}
              />
            </div>

            {/* Category */}
            <div>
              <label className="label">Category</label>
              <select
                className="input mt-1"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {getCategoryIcon(category.value)} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="label">Min Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input mt-1"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Max Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input mt-1"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Sort Options */}
            <div className="flex items-center space-x-4">
              <div>
                <label className="label">Sort By</label>
                <select
                  className="input mt-1"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="createdAt">Newest First</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <div>
                <label className="label">Order</label>
                <select
                  className="input mt-1"
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="btn btn-outline btn-sm mt-6"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Category Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange('category', 'all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filters.category === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.slice(0, 6).map(category => (
          <button
            key={category.value}
            onClick={() => handleFilterChange('category', category.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filters.category === category.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getCategoryIcon(category.value)} {category.label}
          </button>
        ))}
      </div>

      {/* Results Info */}
      {pagination.total !== undefined && (
        <div className="text-sm text-gray-600">
          Showing {products.length} of {pagination.total} products
          {filters.search && ` for "${filters.search}"`}
          {filters.category !== 'all' && ` in ${categories.find(c => c.value === filters.category)?.label}`}
        </div>
      )}

      {/* Products Grid */}
      {loading && products.length === 0 ? (
        <LoadingSpinner text="Loading products..." />
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
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
                  'Load More Products'
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
          <button
            onClick={clearFilters}
            className="btn btn-primary"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Featured Suppliers */}
      <div className="card bg-gray-50">
        <div className="card-content">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Choose Our Suppliers?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <h4 className="font-semibold text-gray-900 mb-1">Verified Quality</h4>
              <p className="text-sm text-gray-600">All suppliers are verified for quality and reliability</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🚚</div>
              <h4 className="font-semibold text-gray-900 mb-1">Fast Delivery</h4>
              <p className="text-sm text-gray-600">Quick delivery to keep your business running</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-semibold text-gray-900 mb-1">Best Prices</h4>
              <p className="text-sm text-gray-600">Competitive wholesale prices for street vendors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;