import { NavLink, Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../../contexts/AuthContext';
import '../../styles/Navbar.css';

function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    window.location.href = '/';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // ADMIN VIEW - Only show admin info and logout
  if (isAdmin) {
    return (
      <nav className="navbar admin-navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link to="/admin/dashboard">VIARA ADMIN</Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          <ul className={`navbar-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <li>
              <span className="user-greeting">Hi, Admin {user?.username}!</span>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </li>
          </ul>

          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div className="mobile-overlay" onClick={closeMobileMenu}></div>
          )}
        </div>
      </nav>
    );
  }

  // REGULAR USER VIEW - Show all navigation
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" onClick={closeMobileMenu}>VIARA</Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <ul className={`navbar-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Close button inside mobile menu */}
          <li className="mobile-close">
            <button onClick={closeMobileMenu} className="close-btn">✕</button>
          </li>

          <li>
            <NavLink 
              to="/" 
              onClick={closeMobileMenu}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              🏠 Home
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/products" 
              onClick={closeMobileMenu}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              📦 Products
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/about" 
              onClick={closeMobileMenu}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              ℹ️ About
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/contact" 
              onClick={closeMobileMenu}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              📧 Contact
            </NavLink>
          </li>

          
          {isLoggedIn ? (
            <>
              <li className="menu-divider"></li>
              <li>
                <NavLink
                  to="/cart"
                  onClick={closeMobileMenu}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  🛒 Cart
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/orders"
                  onClick={closeMobileMenu}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  🛒 Orders
                </NavLink>

              </li>
              
              <li className="menu-divider"></li>
              <li>
                <span className="user-greeting">Hi, {user?.username}!</span>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  🚪 Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="menu-divider"></li>
              <li><Link to="/login" className="login-btn" onClick={closeMobileMenu}>🔐 Login</Link></li>
            </>
          )}
        </ul>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={closeMobileMenu}></div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;