import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark">Shop</span>
          <span className="brand-mark brand-mark-alt">Stream</span>
          <p className="footer-tagline">Products worth showcasing, carts worth checking out.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/products">All products</Link>
            <Link to="/cart">Your cart</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Log in</Link>
            <Link to="/register">Sign up</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {year} ShopStream. Built for the Main Flow Full-Stack Internship.</p>
      </div>
    </footer>
  );
}
