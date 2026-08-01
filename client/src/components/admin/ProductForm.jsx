import { useState } from 'react';

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Other'];

export default function ProductForm({ mode, initialProduct, onSubmit, onCancel, submitting }) {
  const isEdit = mode === 'edit';

  const [name, setName] = useState(initialProduct?.name || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [price, setPrice] = useState(initialProduct?.price ?? '');
  const [category, setCategory] = useState(initialProduct?.category || CATEGORIES[0]);
  const [stock, setStock] = useState(initialProduct?.stock ?? 0);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initialProduct?.image || '');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !price) {
      setError('Name and price are required.');
      return;
    }

    if (isEdit) {
      // Backend PUT route only persists name & price (per the given API contract),
      // but we send the full object in case the schema is extended later.
      onSubmit({ name, description, price, category, stock });
    } else {
      if (!imageFile) {
        setError('Please choose a product image — the backend requires one.');
        return;
      }
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('stock', stock);
      formData.append('image', imageFile);
      onSubmit(formData);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card modal-card-lg">
        <h3>{isEdit ? 'Edit product' : 'Add new product'}</h3>

        {error && <p className="error-msg">{error}</p>}

        <form className="product-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Product name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Price (₹)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Stock</span>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          {!isEdit && (
            <label className="field">
              <span className="field-label">Product image</span>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>
          )}

          {isEdit && (
            <p className="field-hint">
              Image and other fields can't be changed here — the backend's update route
              only saves name and price.
            </p>
          )}

          {preview && (
            <div className="cover-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
