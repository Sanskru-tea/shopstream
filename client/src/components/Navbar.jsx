import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-mark">Shop</span>
          <span className="brand-mark brand-mark-alt">Stream</span>
        </Link>

        <button
          className={`navbar-toggle ${menuOpen ? 'is-open' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar-links ${menuOpen ? 'is-open' : ''}`}>
          <NavLink to="/" end onClick={closeMenu} className="nav-link">
            Home
          </NavLink>
          <NavLink to="/products" onClick={closeMenu} className="nav-link">
            Shop
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" onClick={closeMenu} className="nav-link">
              Admin
            </NavLink>
          )}

          <NavLink to="/cart" onClick={closeMenu} className="nav-link nav-cart">
            Cart
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </NavLink>

          {isAuthenticated ? (
            <div className="nav-user">
              <span className="nav-avatar" aria-hidden="true">
                {(user?.name || '?').charAt(0).toUpperCase()}
              </span>
              <span className="nav-username">{user?.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="nav-auth-links">
              <NavLink to="/login" onClick={closeMenu} className="nav-link">
                Log in
              </NavLink>
              <NavLink to="/register" onClick={closeMenu} className="btn btn-primary btn-sm">
                Sign up
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
