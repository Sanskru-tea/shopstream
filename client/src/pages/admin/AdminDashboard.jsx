import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ProductForm from '../../components/admin/ProductForm';
import Spinner from '../../components/Spinner';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=60';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState(null); // { mode: 'add' | 'edit', product? }
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { showToast } = useToast();

  const loadProducts = () => {
    setLoading(true);
    getProducts()
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdd = async (formData) => {
    setSubmitting(true);
    try {
      await createProduct(formData);
      showToast('Product added', 'success');
      setFormState(null);
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data) => {
    setSubmitting(true);
    try {
      await updateProduct(formState.product._id, data);
      showToast('Product updated', 'success');
      setFormState(null);
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product._id);
    try {
      await deleteProduct(product._id);
      showToast('Product deleted', 'info');
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete product', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Product dashboard</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setFormState({ mode: 'add' })}>
          + Add product
        </button>
      </div>

      {loading && (
        <div className="page-loading">
          <Spinner label="Loading products…" />
        </div>
      )}

      {!loading && error && <p className="error-msg">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <h3>No products yet</h3>
          <p>Add your first product to populate the catalog.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      className="admin-table-thumb"
                      src={product.image || FALLBACK_IMAGE}
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category || '—'}</td>
                  <td>₹{Number(product.price).toFixed(2)}</td>
                  <td>{product.stock ?? 0}</td>
                  <td className="admin-table-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setFormState({ mode: 'edit', product })}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product._id}
                    >
                      {deletingId === product._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formState && (
        <ProductForm
          mode={formState.mode}
          initialProduct={formState.product}
          submitting={submitting}
          onCancel={() => setFormState(null)}
          onSubmit={formState.mode === 'add' ? handleAdd : handleEdit}
        />
      )}
    </div>
  );
}
