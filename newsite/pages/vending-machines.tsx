import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function VendingMachines() {
  const router = useRouter();
  const [heroRef, heroVisible] = useScrollAnimation(0.3);
  const [featuresRef, featuresVisible] = useScrollAnimation(0.2);

  const handleMakeAppointment = () => {
    router.push('/contact');
  };

  const handleRequestDemo = () => {
    router.push('/request-a-demo');
  };

  return (
    <>
      <Head>
        <title>Smart Vending Machines California | SMARTER VENDING</title>
        <meta name="description" content="Advanced smart vending machines with real-time inventory tracking, contactless payments, and remote monitoring. Perfect for offices, schools, and workplaces in California." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className={`vending-hero ${heroVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="hero-content">
            <h6 className="section-subtitle">Vending Machines</h6>
            <h1 className="hero-title gradient-text">Smart Vending Solutions for Modern Workplaces</h1>
            <p className="hero-description">
              Advanced smart vending machines with real-time inventory tracking, contactless payments, and remote monitoring. Perfect for offices, schools, and workplaces throughout California.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn-animated primary-btn"
                onClick={handleRequestDemo}
              >
                Request Demo
              </button>
              <button 
                className="btn-animated secondary-btn"
                onClick={handleMakeAppointment}
              >
                Make Appointment
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          ref={featuresRef}
          className={`features-section ${featuresVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="features-container">
            <h2 className="section-title">Why Choose Our Smart Vending Machines?</h2>
            <div className="features-grid">
              <div className="feature-card card-hover">
                <div className="feature-icon">📱</div>
                <h4>Contactless Payments</h4>
                <p>Accept credit cards, mobile payments, and employee badges for seamless transactions.</p>
              </div>
              <div className="feature-card card-hover">
                <div className="feature-icon">📊</div>
                <h4>Real-Time Inventory</h4>
                <p>Smart sensors track product levels and automatically trigger restocking alerts.</p>
              </div>
              <div className="feature-card card-hover">
                <div className="feature-icon">🔧</div>
                <h4>Remote Monitoring</h4>
                <p>24/7 monitoring ensures optimal performance and immediate issue resolution.</p>
              </div>
              <div className="feature-card card-hover">
                <div className="feature-icon">🥤</div>
                <h4>Diverse Selection</h4>
                <p>From healthy snacks to indulgent treats, cold drinks to energy beverages.</p>
              </div>
              <div className="feature-card card-hover">
                <div className="feature-icon">⚡</div>
                <h4>Energy Efficient</h4>
                <p>LED lighting and smart cooling systems reduce energy consumption.</p>
              </div>
              <div className="feature-card card-hover">
                <div className="feature-icon">🛡️</div>
                <h4>Secure & Reliable</h4>
                <p>Anti-theft design with secure payment processing and tamper alerts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section className="categories-section">
          <div className="categories-container">
            <h2 className="section-title">Product Categories</h2>
            <div className="categories-grid">
              <div className="category-card card-hover">
                <h4>🍿 Snacks</h4>
                <p>Chips, nuts, granola bars, and healthy alternatives</p>
              </div>
              <div className="category-card card-hover">
                <h4>🥤 Beverages</h4>
                <p>Sodas, juices, water, energy drinks, and sports drinks</p>
              </div>
              <div className="category-card card-hover">
                <h4>🍫 Treats</h4>
                <p>Candy, chocolate, cookies, and sweet indulgences</p>
              </div>
              <div className="category-card card-hover">
                <h4>🥗 Healthy Options</h4>
                <p>Organic snacks, protein bars, and nutritious choices</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <div className="cta-content">
            <h3 className="cta-title">Ready to upgrade your workplace with smart vending?</h3>
            <h4 className="cta-phone">Call us today <span className="phone-highlight">909.258.9848</span></h4>
            <button 
              className="btn-animated cta-button"
              onClick={handleMakeAppointment}
            >
              Schedule Consultation
            </button>
          </div>
        </section>
      </Layout>

      <style jsx>{`
        .vending-hero {
          background: linear-gradient(135deg, #ff6600 0%, #e55a00 100%);
          color: white;
          padding: 6rem 2rem 4rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-content {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .section-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: bold;
          margin: 0 0 2rem 0;
          line-height: 1.2;
        }

        .hero-description {
          font-size: 1.2rem;
          line-height: 1.6;
          opacity: 0.95;
          margin-bottom: 3rem;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .primary-btn {
          background: white;
          color: #ff6600;
          border: none;
          padding: 1.2rem 2.5rem;
          font-size: 1.3rem;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(255, 255, 255, 0.4);
        }

        .secondary-btn {
          background: transparent;
          color: white;
          border: 2px solid white;
          padding: 1.2rem 2.5rem;
          font-size: 1.3rem;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .secondary-btn:hover {
          background: white;
          color: #ff6600;
          transform: translateY(-2px);
        }

        .features-section {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          margin-bottom: 3rem;
          color: #333;
          font-weight: 700;
          text-align: center;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          padding: 2rem;
          background: white;
          border-radius: 15px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-card h4 {
          color: #ff6600;
          margin-bottom: 1rem;
          font-size: 1.3rem;
          font-weight: 700;
        }

        .feature-card p {
          color: #666;
          line-height: 1.6;
        }

        .categories-section {
          padding: 5rem 2rem;
          background: white;
        }

        .categories-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .category-card {
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 15px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .category-card h4 {
          color: #ff6600;
          margin-bottom: 1rem;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .category-card p {
          color: #666;
          line-height: 1.6;
        }

        .cta-section {
          padding: 5rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
          color: white;
        }

        .cta-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          margin-bottom: 2rem;
          font-weight: 700;
        }

        .cta-phone {
          font-size: 1.5rem;
          margin: 2rem 0;
          font-weight: 600;
        }

        .phone-highlight {
          color: #ffff00;
          font-weight: bold;
        }

        .cta-button {
          background: #ff6600;
          color: white;
          border: none;
          padding: 1.2rem 2.5rem;
          font-size: 1.3rem;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 8px 20px rgba(255, 102, 0, 0.3);
          transition: all 0.3s ease;
        }

        .cta-button:hover {
          background: #e55a00;
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(255, 102, 0, 0.4);
        }

        @media (max-width: 768px) {
          .vending-hero {
            padding: 4rem 1rem 3rem;
            min-height: 60vh;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .categories-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      `}</style>
    </>
  );
} 