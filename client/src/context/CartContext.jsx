import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    getCart()
      .then((res) => setItems(res.data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId, quantity = 1) => {
    try {
      const res = await apiAddToCart(productId, quantity);
      setItems(res.data.items || []);
      showToast('Added to cart', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add to cart', 'error');
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await apiRemoveFromCart(productId);
      setItems(res.data.items || []);
      showToast('Removed from cart', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not remove item', 'error');
    }
  };

  // The backend only exposes "add (increments)" and "remove item entirely" —
  // there is no dedicated decrement endpoint. We recreate decrement on top of
  // those two existing endpoints, without touching the backend contract.
  const changeQuantity = async (productId, delta) => {
    const current = items.find((it) => (it.product?._id || it.product) === productId);
    if (!current) return;
    const newQty = current.quantity + delta;

    try {
      if (newQty <= 0) {
        const res = await apiRemoveFromCart(productId);
        setItems(res.data.items || []);
        showToast('Removed from cart', 'info');
        return;
      }

      if (delta > 0) {
        const res = await apiAddToCart(productId, delta);
        setItems(res.data.items || []);
      } else {
        // Rebuild the line at the new quantity using remove + add
        await apiRemoveFromCart(productId);
        const res = await apiAddToCart(productId, newQty);
        setItems(res.data.items || []);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update quantity', 'error');
    }
  };

  const totalItems = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, it) => sum + (it.product?.price || 0) * it.quantity, 0),
    [items]
  );

  const value = {
    items,
    loading,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    changeQuantity,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
