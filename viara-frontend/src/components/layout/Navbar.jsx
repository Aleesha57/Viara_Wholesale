import { Link } from 'react-router-dom';
import { useContext } from 'react';
import '../../styles/Navbar.css';
import AuthContext from '../../contexts/AuthContext';

function Navbar() {
  const { user, isLoggedIn, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

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
              <li><Link to="/admin/dashboard">👨‍💼 Admin</Link></li> {/* NEW */}
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