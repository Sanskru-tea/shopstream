import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

export default function ProductListing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const sort = searchParams.get('sort') || 'default';

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getProducts()
      .then((res) => {
        if (!ignore) setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!ignore) setError('Could not reach the server. Is the backend running?');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'All' || value === 'default') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }

    if (category !== 'All') {
      list = list.filter((p) => p.category === category);
    }

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);

    return list;
  }, [products, search, category, sort]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      showToast('Please log in to add items to your cart', 'info');
      navigate('/login');
      return;
    }
    addItem(product._id, 1);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>All products</h1>
        <p className="auth-subtitle">{filtered.length} item{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="products-toolbar">
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => updateParam('search', e.target.value)}
          className="search-input"
        />

        <select value={category} onChange={(e) => updateParam('category', e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {loading && (
        <div className="page-loading">
          <Spinner label="Fetching products…" />
        </div>
      )}

      {!loading && error && <p className="error-msg">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <h3>No products match your filters</h3>
          <p>Try a different search term or category.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="products-grid">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
