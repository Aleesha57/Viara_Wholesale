import '../../styles/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>VIARA Wholesale</h3>
          <p>Your trusted partner in quality wholesale products</p>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: info@viara.com</p>
          <p>Phone: +1 234 567 8900</p>
          <p>Address: 123 Business St, City, Country</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} VIARA Wholesale. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;