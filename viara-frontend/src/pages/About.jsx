import Banner from '../components/ui/Banner';
import '../styles/About.css';

function About() {
  return (
    <div className="about-page">
      <Banner 
        title="About VIARA Wholesale" 
        subtitle="Your trusted wholesale partner since 2020"
      />

      <div className="about-content">
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            VIARA Wholesale was founded with a simple mission: to provide high-quality 
            products at competitive wholesale prices. Since our establishment in 2020, 
            we've grown to become one of the most trusted wholesale suppliers in the industry.
          </p>
          <p>
            Our commitment to quality, reliability, and customer satisfaction has helped us 
            build lasting relationships with businesses around the world.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <div className="offerings-grid">
            <div className="offering-card">
              <div className="offering-icon">📦</div>
              <h3>Wide Product Range</h3>
              <p>From electronics to furniture, we have everything your business needs.</p>
            </div>
            <div className="offering-card">
              <div className="offering-icon">💼</div>
              <h3>B2B Solutions</h3>
              <p>Tailored wholesale solutions for businesses of all sizes.</p>
            </div>
            <div className="offering-card">
              <div className="offering-icon">🚚</div>
              <h3>Global Shipping</h3>
              <p>Fast and reliable delivery to customers worldwide.</p>
            </div>
            <div className="offering-card">
              <div className="offering-icon">🤝</div>
              <h3>Dedicated Support</h3>
              <p>Our team is always here to help with your orders.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Values</h2>
          <ul className="values-list">
            <li><strong>Quality First:</strong> We never compromise on product quality</li>
            <li><strong>Customer Focused:</strong> Your success is our success</li>
            <li><strong>Integrity:</strong> Honest and transparent in all our dealings</li>
            <li><strong>Innovation:</strong> Always looking for better ways to serve you</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default About;