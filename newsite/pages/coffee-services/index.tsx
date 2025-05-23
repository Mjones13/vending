import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

export default function CoffeeServicesOverview() {
  const router = useRouter();
  const [heroRef, heroVisible] = useScrollAnimation(0.3);
  const [equipmentRef, equipmentVisible] = useScrollAnimation(0.2);
  const [benefitsRef, benefitsVisible] = useScrollAnimation(0.2);

  const handleLoginToOrder = () => {
    router.push('/login');
  };

  const handleMakeAppointment = () => {
    router.push('/contact');
  };

  return (
    <>
      <Head>
        <title>Coffee Services - SMARTER VENDING</title>
        <meta name="description" content="Professional coffee services for offices in California. Bean-to-cup machines, vending machines, and airpot services. Fresh, quality coffee solutions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className={`coffee-hero ${heroVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="hero-content">
            <h1 className="hero-title gradient-text">Coffee Services</h1>
            <h2 className="hero-subtitle">Professional Office Coffee Solutions in California</h2>
            <p className="hero-description">
              Transform your workplace with our comprehensive coffee services. From bean-to-cup machines to traditional vending solutions, 
              we provide everything you need to keep your team energized and productive.
            </p>
          </div>
        </section>

        {/* Overview Section */}
        <section className="overview-section">
          <div className="container">
            <h2 className="section-title">Complete Coffee Solutions for Your Workplace</h2>
            <p className="section-description">
              We specialize in providing top-tier coffee services to businesses throughout California. Our comprehensive solutions include 
              state-of-the-art equipment, premium coffee selections, and full-service support to ensure your employees always have access 
              to exceptional coffee experiences.
            </p>
            
            <div className="benefits-grid">
              <div className="benefit-card card-hover">
                <div className="benefit-icon">☕</div>
                <h3>Premium Quality</h3>
                <p>Sourced from the finest coffee beans worldwide, delivering exceptional taste in every cup.</p>
              </div>
              <div className="benefit-card card-hover">
                <div className="benefit-icon">🔧</div>
                <h3>Full Service</h3>
                <p>Complete installation, maintenance, and restocking services - we handle everything for you.</p>
              </div>
              <div className="benefit-card card-hover">
                <div className="benefit-icon">🎯</div>
                <h3>Customizable</h3>
                <p>Tailored solutions to match your workplace needs and employee preferences.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Coffee Equipment Section */}
        <section 
          ref={equipmentRef}
          className={`equipment-section ${equipmentVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <h2 className="section-title">Our Coffee Equipment</h2>
          <h4 className="section-subtitle">Select on the screen, place your cup, and enjoy</h4>
          <p className="section-text">Our Coffee machines for Offices California make it that easy.</p>

          {/* Bean-to-Cup Section */}
          <div className="equipment-card">
            <div className="equipment-images">
              <div className="image-container">
                <Image 
                  src="/images/equipment/bean-to-cup-1.svg" 
                  alt="Bean-to-Cup Machine 1" 
                  width={200}
                  height={250}
                  className="equipment-image"
                />
              </div>
              <div className="equipment-icon coffee-icon">
                <span>☕</span>
              </div>
              <div className="equipment-icon beans-icon">
                <span>🫘</span>
              </div>
            </div>
            <h4 className="equipment-title">Bean to Cup Freshly Ground</h4>
            <ul className="features-list">
              <li><strong>Freshness & Quality:</strong> Bean to Cup Ground on the spot</li>
              <li><strong>900 cup capacity</strong></li>
              <li><strong>Touchscreen Interface:</strong> Sleek, intuitive touch screen makes selecting your coffee type, strength, and customization options incredibly user-friendly.</li>
              <li><strong>8-12 Selection including cappuccinos, teas, hot chocolate</strong></li>
              <li><strong>Silent Operation:</strong> Advanced technology reduces the noise of grinding and brewing, making these machines unobtrusive in any office environment.</li>
              <li><strong>Water Filtration System:</strong> Built-in water filtration ensures every cup is brewed with the purest water, enhancing the taste and quality of the coffee.</li>
            </ul>
          </div>

          {/* Coffee & Tea Vending Machine */}
          <div className="equipment-card">
            <h4 className="equipment-title">Coffee & Tea Vending Machine</h4>
            <div className="equipment-images">
              <div className="equipment-icon tea-icon">
                <span>🫖</span>
              </div>
              <div className="equipment-icon coffee-icon">
                <span>☕</span>
              </div>
              <div className="equipment-icon drink-icon">
                <span>🥤</span>
              </div>
            </div>
            <ul className="features-list">
              <li><strong>All Internal Components:</strong> All essentials, including cups, milk, and sugar, are neatly stored inside, leaving no accessories outside.</li>
              <li><strong>Sleek Design:</strong> Featuring a modern, space-efficient design that enhances any setting.</li>
              <li><strong>Intuitive Touchscreen:</strong> Navigate easily with a user-friendly interface for all your coffee choices.</li>
              <li><strong>Large Capacity:</strong> Enjoy more coffee with less frequent refills, thanks to our generous capacity.</li>
              <li><strong>Low Maintenance:</strong> Experience hassle-free operation with minimal upkeep required.</li>
              <li><strong>Remote Monitoring:</strong> Benefit from prompt customer support and service, all remotely managed for convenience.</li>
            </ul>
          </div>

          {/* Coffee Airpots */}
          <div className="equipment-card">
            <h4 className="equipment-title">Coffee Airpots</h4>
            <div className="equipment-images">
              <div className="equipment-icon airpot-icon">
                <span>🫗</span>
              </div>
              <div className="equipment-icon coffee-icon">
                <span>☕</span>
              </div>
              <div className="equipment-icon hotel-icon">
                <span>🏨</span>
              </div>
            </div>
            <ul className="features-list">
              <li><strong>Traditional choice typical for hotels or smaller companies</strong></li>
              <li><strong>Temperature Retention:</strong> Airpots are designed to keep coffee hot for extended periods without the need for external heating sources, ensuring the last cup is as warm as the first.</li>
              <li><strong>Convenience and Mobility:</strong> Lightweight and portable, airpots can be easily moved and placed wherever needed, from meeting rooms to event spaces, making them ideal for varied settings.</li>
              <li><strong>Easy Dispensing:</strong> The pump-action dispensing mechanism allows for easy, self-serve access, reducing waiting times and enhancing user experience.</li>
              <li><strong>Variety and Flexibility:</strong> Having multiple Airpots allows for offering different types of coffee (e.g., regular, decaf, flavored) simultaneously, catering to diverse preferences.</li>
            </ul>
          </div>
        </section>

        {/* Why Your Workplace Needs Coffee */}
        <section 
          ref={benefitsRef}
          className={`benefits-section ${benefitsVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <h3 className="section-title">Why Your Workplace Needs Onsite Coffee</h3>
          <div className="benefits-grid-large">
            <div className="benefit-card card-hover">
              <h4>Boosts Productivity</h4>
              <p>Keeps employees energized, enhancing focus.</p>
            </div>
            <div className="benefit-card card-hover">
              <h4>Increases Satisfaction</h4>
              <p>Demonstrates value, improving morale.</p>
            </div>
            <div className="benefit-card card-hover">
              <h4>Offers Convenience</h4>
              <p>Saves time, reducing off-site coffee runs.</p>
            </div>
            <div className="benefit-card card-hover">
              <h4>Builds Community</h4>
              <p>Encourages informal connections among staff.</p>
            </div>
            <div className="benefit-card card-hover">
              <h4>Saves Money</h4>
              <p>Reduces employees&apos; daily beverage expenses.</p>
            </div>
            <div className="benefit-card card-hover">
              <h4>Customizable</h4>
              <p>Tailors coffee choices to employee preferences.</p>
            </div>
            <div className="benefit-card card-hover">
              <h4>Eco-Friendly</h4>
              <p>Minimizes disposable cup use.</p>
            </div>
            <div className="benefit-card card-hover">
              <h4>Enriches Culture</h4>
              <p>Contributes to a dynamic, positive work environment.</p>
            </div>
          </div>
        </section>

        {/* Featured Coffee Products */}
        <section className="featured-section">
          <h6 className="section-subtitle">Order online</h6>
          <h2 className="section-title">Our featured coffee products</h2>
          <p className="section-description">
            Tailor your coffee experience with customizable options, ensuring your selections are perfectly aligned with your tastes and preferences. Simply place your orders, and leave the rest to us – we deliver and do the restocking for you.
          </p>
          <button 
            className="btn-animated login-btn"
            onClick={handleLoginToOrder}
          >
            Login to order online
          </button>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <h3 className="cta-title">Ready to get started?!</h3>
          <h3 className="cta-subtitle">Elevate your office coffee experience today with our <strong>office coffee service in California</strong></h3>
          <h4 className="cta-phone">Call us today <span className="phone-highlight">909.258.9848</span></h4>
          <button 
            className="btn-animated cta-button"
            onClick={handleMakeAppointment}
          >
            Make an appointment
          </button>
        </section>

        {/* Navigation Links */}
        <section className="navigation-section">
          <h3 className="nav-title">Explore Our Coffee Services</h3>
          <div className="nav-links">
            <Link href="/coffee-services/ground-whole-bean" className="btn-animated nav-btn">
              Ground & Whole Bean
            </Link>
            <Link href="/coffee-services/airpot-portion-packets" className="btn-animated nav-btn">
              Airpot Portion Packets
            </Link>
            <Link href="/coffee-services/accessories" className="btn-animated nav-btn">
              Accessories
            </Link>
          </div>
        </section>
      </Layout>

      <style jsx>{`
        .coffee-hero {
          background: linear-gradient(135deg, #8B4513 0%, #654321 100%);
          color: white;
          padding: 6rem 2rem 4rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: bold;
          margin: 0 0 1rem 0;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: clamp(1.2rem, 3vw, 2rem);
          margin: 0 0 2rem 0;
          opacity: 0.9;
        }

        .hero-description {
          font-size: 1.2rem;
          line-height: 1.6;
          opacity: 0.95;
        }

        .overview-section {
          padding: 4rem 2rem;
          background: white;
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }

        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          margin-bottom: 2rem;
          color: #333;
          font-weight: 700;
          text-align: center;
        }

        .section-description {
          font-size: 1.2rem;
          line-height: 1.6;
          margin-bottom: 3rem;
          color: #666;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .section-subtitle {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          color: #666;
          text-align: center;
        }

        .section-text {
          font-size: 1.1rem;
          margin-bottom: 3rem;
          color: #666;
          text-align: center;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .benefits-grid-large {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .benefit-card {
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 15px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .benefit-card h3, .benefit-card h4 {
          color: #8B4513;
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .benefit-card p {
          color: #666;
          line-height: 1.6;
        }

        .benefit-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .equipment-section {
          padding: 4rem 2rem;
          background: #f8f9fa;
        }

        .equipment-card {
          margin-bottom: 4rem;
          padding: 2rem;
          background: white;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 3rem;
        }

        .equipment-images {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .image-container {
          border-radius: 10px;
          overflow: hidden;
        }

        .equipment-image {
          border-radius: 10px;
        }

        .equipment-icon {
          width: 200px;
          height: 250px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          color: white;
        }

        .coffee-icon {
          background: linear-gradient(135deg, #8B4513, #A0522D);
        }

        .beans-icon {
          background: linear-gradient(135deg, #A0522D, #8B4513);
        }

        .tea-icon {
          background: linear-gradient(135deg, #D2691E, #CD853F);
        }

        .drink-icon {
          background: linear-gradient(135deg, #CD853F, #D2691E);
        }

        .airpot-icon {
          background: linear-gradient(135deg, #B8860B, #DAA520);
        }

        .hotel-icon {
          background: linear-gradient(135deg, #CD853F, #B8860B);
        }

        .equipment-title {
          text-align: center;
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
          font-weight: 700;
        }

        .features-list {
          max-width: 600px;
          margin: 0 auto;
          font-size: 1rem;
          line-height: 1.6;
          color: #555;
        }

        .features-list li {
          margin-bottom: 0.5rem;
        }

        .features-list strong {
          color: #8B4513;
        }

        .benefits-section {
          padding: 4rem 2rem;
          background: white;
        }

        .featured-section {
          padding: 4rem 2rem;
          text-align: center;
          background: #f8f9fa;
        }

        .login-btn {
          background: #8B4513;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .cta-section {
          padding: 4rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, #8B4513, #654321);
          color: white;
        }

        .cta-title {
          font-size: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .cta-subtitle {
          font-size: 1.8rem;
          margin-bottom: 2rem;
          line-height: 1.4;
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
          padding: 1rem 2rem;
          font-size: 1.2rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
        }

        .navigation-section {
          padding: 2rem;
          background: #f8f9fa;
          text-align: center;
        }

        .nav-title {
          margin-bottom: 1rem;
          color: #333;
          font-size: 1.5rem;
        }

        .nav-links {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .nav-btn {
          background: #8B4513;
          color: white;
          padding: 1rem 2rem;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .nav-btn:hover {
          background: #654321;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .equipment-images {
            gap: 10px;
          }

          .equipment-icon {
            width: 150px;
            height: 180px;
            font-size: 3rem;
          }

          .benefits-grid {
            grid-template-columns: 1fr;
          }

          .benefits-grid-large {
            grid-template-columns: 1fr;
          }

          .nav-links {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
} 