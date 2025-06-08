import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import HeroSection from "../components/HeroSection";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function VendingMachines() {
  const router = useRouter();
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
        <meta name="description" content="Advanced smart vending machines with real-time inventory tracking, contactless payments, and remote monitoring. Perfect for modern workplaces in California." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        {/* Hero Section with Smart Vending Background */}
        <HeroSection
          backgroundImage="/images/hero-backgrounds/vending-machines/smart-vending-hero.jpg"
          title="Smart Vending Machines"
          subtitle="Advanced Technology for Modern Workplaces"
          description="Refresh, snack, and indulge with our smart vending machines – offering a wide range of selections from healthy snacks to guilty pleasures, cold drinks to energizing beverages. Tailored for convenience, ready for your choice."
          ctaButton={{
            text: "Schedule Consultation",
            onClick: handleMakeAppointment
          }}
          phoneNumber={{
            text: "CALL US TODAY",
            number: "909.258.9848"
          }}
          minHeight="75vh"
          overlayOpacity={0.4}
        />

        {/* Why Choose Our Smart Vending Machines */}
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