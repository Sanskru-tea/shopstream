import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=60';

export default function CartPage() {
  const { items, loading, totalPrice, changeQuantity, removeItem } = useCart();

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner label="Loading your cart…" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h3>Your cart is empty</h3>
        <p>Browse the catalog and add something you like.</p>
        <Link to="/products" className="btn btn-primary">
          Shop products
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your cart</h1>

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <li key={product._id} className="cart-item">
                <img
                  src={product.image || FALLBACK_IMAGE}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />

                <div className="cart-item-info">
                  <Link to={`/products/${product._id}`} className="cart-item-title">
                    {product.name}
                  </Link>
                  <p className="cart-item-price">₹{Number(product.price).toFixed(2)} each</p>
                </div>

                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={() => changeQuantity(product._id, -1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(product._id, 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <p className="cart-item-subtotal">
                  ₹{(product.price * item.quantity).toFixed(2)}
                </p>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(product._id)}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary btn-block btn-lg">Checkout</button>
          <Link to="/products" className="continue-shopping-link">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
