import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function VendingMachines() {
  const router = useRouter();

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
        <section className="hero">
          <div className="hero-background">
            {/* Using CSS background image for now since this page needs custom buttons */}
          </div>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h6 className="section-subtitle">Vending Machines</h6>
            <h1 className="hero-title">Smart Vending Solutions for Modern Workplaces</h1>
            <p className="hero-description">
              Advanced smart vending machines with real-time inventory tracking, contactless payments, and remote monitoring. Perfect for offices, schools, and workplaces throughout California.
            </p>
            <div className="flex justify-center gap-4 flex-wrap mt-8">
              <button 
                className="btn btn-accent btn-lg btn-shimmer"
                onClick={handleRequestDemo}
              >
                Request Demo
              </button>
              <button 
                className="btn btn-outline text-white border-white hover:bg-white hover:text-primary-600"
                onClick={handleMakeAppointment}
              >
                Make Appointment
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section section-neutral">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Why Choose Our Smart Vending Machines?</h2>
            </div>
            <div className="grid grid-auto gap-8">
              <div className="service-card">
                <div className="service-icon service-icon-accent">
                  <span>📱</span>
                </div>
                <h4>Contactless Payments</h4>
                <p>Accept credit cards, mobile payments, and employee badges for seamless transactions.</p>
              </div>
              <div className="service-card">
                <div className="service-icon service-icon-primary">
                  <span>📊</span>
                </div>
                <h4>Real-Time Inventory</h4>
                <p>Smart sensors track product levels and automatically trigger restocking alerts.</p>
              </div>
              <div className="service-card">
                <div className="service-icon service-icon-coffee">
                  <span>🔧</span>
                </div>
                <h4>Remote Monitoring</h4>
                <p>24/7 monitoring ensures optimal performance and immediate issue resolution.</p>
              </div>
              <div className="service-card">
                <div className="service-icon service-icon-accent">
                  <span>🥤</span>
                </div>
                <h4>Diverse Selection</h4>
                <p>From healthy snacks to indulgent treats, cold drinks to energy beverages.</p>
              </div>
              <div className="service-card">
                <div className="service-icon service-icon-primary">
                  <span>⚡</span>
                </div>
                <h4>Energy Efficient</h4>
                <p>LED lighting and smart cooling systems reduce energy consumption.</p>
              </div>
              <div className="service-card">
                <div className="service-icon service-icon-coffee">
                  <span>🛡️</span>
                </div>
                <h4>Secure & Reliable</h4>
                <p>Anti-theft design with secure payment processing and tamper alerts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section className="section section-white">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Product Categories</h2>
            </div>
            <div className="grid grid-auto-sm gap-6">
              <div className="service-card">
                <h4 style={{color: 'var(--color-accent-600)', marginBottom: 'var(--space-4)'}}>🍿 Snacks</h4>
                <p>Chips, nuts, granola bars, and healthy alternatives</p>
              </div>
              <div className="service-card">
                <h4 style={{color: 'var(--color-accent-600)', marginBottom: 'var(--space-4)'}}>🥤 Beverages</h4>
                <p>Sodas, juices, water, energy drinks, and sports drinks</p>
              </div>
              <div className="service-card">
                <h4 style={{color: 'var(--color-accent-600)', marginBottom: 'var(--space-4)'}}>🍫 Treats</h4>
                <p>Candy, chocolate, cookies, and sweet indulgences</p>
              </div>
              <div className="service-card">
                <h4 style={{color: 'var(--color-accent-600)', marginBottom: 'var(--space-4)'}}>🥗 Healthy Options</h4>
                <p>Organic snacks, protein bars, and nutritious choices</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="section section-cta">
          <div className="container">
            <div className="text-center">
              <h3 className="cta-title">Ready to upgrade your workplace with smart vending?</h3>
              <h4 className="cta-phone">Call us today <span style={{color: '#ffff00', fontWeight: 'bold'}}>909.258.9848</span></h4>
              <button 
                className="btn btn-accent btn-xl btn-shimmer"
                onClick={handleMakeAppointment}
              >
                Schedule Consultation
              </button>
            </div>
          </div>
        </section>
      </Layout>

      <style jsx>{`
        .hero-background {
          background-image: url('/images/hero-backgrounds/vending-machines/smart-vending-hero.jpg');
          background-size: cover;
          background-position: center;
        }

        .hero-overlay {
          background: linear-gradient(135deg, rgba(255, 102, 0, 0.4) 0%, rgba(229, 90, 0, 0.4) 100%);
        }
      `}</style>
    </>
  );
} 