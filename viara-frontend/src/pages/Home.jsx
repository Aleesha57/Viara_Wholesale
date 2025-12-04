import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-page">
      {/* Hero/Banner Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to VIARA Wholesale</h1>
          <p>Your trusted partner for quality products at wholesale prices</p>
          <Link to="/products" className="cta-button">
            Browse Products
          </Link>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="intro-section">
        <h2>Why Choose VIARA?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🎯 Quality Products</h3>
            <p>We source only the best products for our customers</p>
          </div>
          <div className="feature-card">
            <h3>💰 Wholesale Prices</h3>
            <p>Competitive pricing for bulk orders</p>
          </div>
          <div className="feature-card">
            <h3>🚚 Fast Delivery</h3>
            <p>Quick and reliable shipping worldwide</p>
          </div>
          <div className="feature-card">
            <h3>🤝 Trusted Service</h3>
            <p>Years of experience in wholesale business</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Ready to Start?</h2>
        <p>Join hundreds of satisfied wholesale customers</p>
        <Link to="/contact" className="cta-button">
          Contact Us Today
        </Link>
      </section>
    </div>
  );
}

export default Home;