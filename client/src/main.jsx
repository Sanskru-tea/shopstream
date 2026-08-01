import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/navbar.css';
import './styles/home.css';
import './styles/products.css';
import './styles/product-details.css';
import './styles/auth.css';
import './styles/cart.css';
import './styles/admin.css';
import './styles/footer.css';
import './styles/toast.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
