import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
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
    return Array.from(set).slice(0, 6);
  }, [products]);

  const featured = products.slice(0, 6);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      showToast('Please log in to add items to your cart', 'info');
      navigate('/login');
      return;
    }
    addItem(product._id, 1);
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Live product showcase</span>
          <h1 className="hero-title">
            Discover products, <span className="hero-title-accent">curated</span>
            <br />and ready to ship.
          </h1>
          <p className="hero-subtitle">
            ShopStream brings together a hand-picked catalog with a cart that just
            works — browse, compare, and check out in seconds.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Start shopping
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg">
              Create an account
            </Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-card" />
        </div>
      </section>

      {categories.length > 0 && (
        <section className="categories-section">
          <h2>Shop by category</h2>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className="category-tile">
                <span>{cat}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="posts-section">
        <div className="posts-section-header">
          <h2>Featured products</h2>
          <Link to="/products" className="btn btn-outline btn-sm">
            View all
          </Link>
        </div>

        {loading && (
          <div className="page-loading">
            <Spinner label="Fetching products…" />
          </div>
        )}

        {!loading && error && <p className="error-msg">{error}</p>}

        {!loading && !error && featured.length === 0 && (
          <div className="empty-state">
            <h3>No products yet</h3>
            <p>Check back soon, or log in as an admin to add the first one.</p>
          </div>
        )}

        {!loading && !error && featured.length > 0 && (
          <div className="products-grid">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
