import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=60';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    getProductById(id)
      .then((res) => {
        if (!ignore) setProduct(res.data);
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err.response?.status === 404
              ? 'This product does not exist or was removed.'
              : 'Something went wrong while loading this product.'
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showToast('Please log in to add items to your cart', 'info');
      navigate('/login');
      return;
    }
    addItem(product._id, quantity);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner label="Loading product…" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="empty-state">
        <h3>{error || 'Product not found'}</h3>
        <Link to="/products" className="btn btn-primary">
          Back to products
        </Link>
      </div>
    );
  }

  const outOfStock = !product.stock || product.stock <= 0;

  return (
    <div className="product-details-page">
      <div className="product-details-grid">
        <div className="product-details-image">
          <img
            src={product.image || FALLBACK_IMAGE}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>

        <div className="product-details-info">
          {product.category && <span className="badge badge-category">{product.category}</span>}
          <h1>{product.name}</h1>
          <p className="product-details-price">₹{Number(product.price).toFixed(2)}</p>

          <p className="product-details-desc">
            {product.description || 'No description provided for this product.'}
          </p>

          <p className={`stock-status ${outOfStock ? 'stock-out' : 'stock-in'}`}>
            {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
          </p>

          {!outOfStock && (
            <div className="quantity-row">
              <span className="field-label">Quantity</span>
              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            className="btn btn-primary btn-lg btn-block"
            disabled={outOfStock}
            onClick={handleAddToCart}
          >
            {outOfStock ? 'Unavailable' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
