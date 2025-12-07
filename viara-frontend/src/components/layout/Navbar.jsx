import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import '../../styles/Navbar.css';

function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // ADMIN VIEW - Only show admin info and logout
  if (isAdmin) {
    return (
      <nav className="navbar admin-navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link to="/admin/dashboard">VIARA ADMIN</Link>
          </div>

          <ul className="navbar-menu">
            <li>
              <span className="user-greeting">Hi, Admin {user?.username}!</span>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>
    );
  }

  // REGULAR USER VIEW - Show all navigation
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">VIARA</Link>
        </div>

        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          
          {isLoggedIn ? (
            <>
              <li><Link to="/cart">🛒 Cart</Link></li>
              <li><Link to="/orders">📦 Orders</Link></li>
              
              <li>
                <span className="user-greeting">Hi, {user?.username}!</span>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li><Link to="/login" className="login-btn">Login</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;