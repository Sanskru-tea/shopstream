import { Link } from 'react-router-dom';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=60';

export default function ProductCard({ product, onAddToCart }) {
  const outOfStock = !product.stock || product.stock <= 0;

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-image-link">
        <img
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        {product.category && <span className="badge badge-category">{product.category}</span>}
        {outOfStock && <span className="badge badge-outofstock">Out of stock</span>}
      </Link>

      <div className="product-card-body">
        <h3 className="product-card-title">
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h3>
        {product.description && (
          <p className="product-card-desc">{product.description.slice(0, 80)}</p>
        )}

        <div className="product-card-footer">
          <span className="product-price">₹{Number(product.price).toFixed(2)}</span>
          <button
            className="btn btn-primary btn-sm"
            disabled={outOfStock}
            onClick={() => onAddToCart?.(product)}
          >
            {outOfStock ? 'Unavailable' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
