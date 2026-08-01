import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <span className="not-found-code">404</span>
      <h1>This page isn't in stock.</h1>
      <p>The page you're looking for doesn't exist, or it may have moved.</p>
      <Link to="/" className="btn btn-primary">
        Back to ShopStream
      </Link>
    </div>
  );
}
