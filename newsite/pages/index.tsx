import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "../components/Layout";
import HeroSection from "../components/HeroSection";
import { useScrollAnimation, useStaggeredAnimation } from "../hooks/useScrollAnimation";

export default function Home() {
  const router = useRouter();
  const [logosRef, logosVisible] = useScrollAnimation(0.2);
  const [servicesRef, servicesVisible] = useScrollAnimation(0.2);
  const [aboutRef, aboutVisible] = useScrollAnimation(0.2);
  const [workRef, workVisible] = useScrollAnimation(0.2);
  const [logoAnimations, triggerLogoAnimations] = useStaggeredAnimation(9, 150);

  useEffect(() => {
    if (logosVisible) {
      triggerLogoAnimations();
    }
  }, [logosVisible, triggerLogoAnimations]);

  const handleRequestDemo = () => {
    router.push('/request-a-demo');
  };

  const handleMakeAppointment = () => {
    router.push('/contact');
  };

  const handleLoginToOrder = () => {
    router.push('/login');
  };

  const handleServiceClick = (service: string) => {
    switch(service) {
      case 'mini-markets':
        router.push('/mini-markets');
        break;
      case 'coffee-services':
        router.push('/coffee-services');
        break;
      case 'vending-machines':
        router.push('/vending-machines');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Head>
        <title>SMARTER VENDING</title>
        <meta name="description" content="Traditional & healthy vending, coffee, and mini-market services for workplaces. Request a demo today!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        {/* Hero Section with Background Image */}
        <HeroSection
          backgroundImage="/images/hero-backgrounds/home/office-breakroom-hero.jpg"
          title="SMARTER VENDING"
          subtitle="Traditional & Healthy Vending Solutions"
          description="Keep your employees onsite during breaks with our comprehensive vending, coffee, and mini-market services for workplaces of 150 - 25,000 employees."
          ctaButton={{
            text: "Request a Demo",
            onClick: handleRequestDemo
          }}
          phoneNumber={{
            text: "CALL US TODAY",
            number: "909.258.9848"
          }}
          minHeight="80vh"
          overlayOpacity={0.5}
        />

        {/* Company Logos */}
        <section 
          ref={logosRef}
          className={`company-logos ${logosVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <h3 className="section-title">Trusted by Leading Companies</h3>
          <div className="logos-container">
            {[
              { src: "/images/logos/disney-logo.svg", alt: "Disney" },
              { src: "/images/logos/sheraton-logo.svg", alt: "Sheraton" },
              { src: "/images/logos/marriott-logo.svg", alt: "Marriott" },
              { src: "/images/logos/toyota-logo.svg", alt: "Toyota" },
              { src: "/images/logos/audacy-logo.svg", alt: "Audacy" },
              { src: "/images/logos/romeo-power-logo.svg", alt: "Romeo Power" },
              { src: "/images/logos/splitsville-logo.svg", alt: "Splitsville" },
              { src: "/images/logos/fresh-n-lean-logo.svg", alt: "Fresh N Lean" },
              { src: "/images/logos/din-tai-fung-logo.svg", alt: "Din Tai Fung" }
            ].map((logo, index) => (
              <div 
                key={logo.alt}
                className={`logo-item ${logoAnimations[index] ? 'animated' : ''}`}
              >
                <Image 
                  src={logo.src} 
                  alt={logo.alt} 
                  width={120}
                  height={60}
                  className="logo-hover"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Leave it to the Pros Section */}
        <section className="pros-section">
          <div className="pros-content animate-on-scroll">
            <h6 className="section-subtitle">Leave it to the Pros!</h6>
            <h2 className="section-title">We handle Restocking, Cleaning and Maintenance.</h2>
            <h4 className="section-description">Keep your employees onsite during breaks</h4>
            <p className="section-text">
              We cater to large companies of 150 – 25,000 employees and prestigious locations, including Downtown Disney, 
              providing top-tier Vending, Coffee, and Mini-Market services to enhance the workplace experience.
            </p>
          </div>
        </section>

        {/* Service Highlights */}
        <section 
          ref={servicesRef}
          className={`services-section ${servicesVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="services-grid">
            <div className="service-card card-hover">
              <div className="service-icon mini-markets-icon">
                <span>🏪</span>
              </div>
              <h3>Mini Markets</h3>
              <p>
                Have your own store in your break room! Stocked with fresh, frozen, and a variety of drinks – all chosen by your staff through our online suggestion box. LET US HANDLE RESTOCKING. Custom-designed to fit any space.
              </p>
              <button 
                className="btn-animated service-btn mini-markets-btn"
                onClick={() => handleServiceClick('mini-markets')}
              >
                Read more
              </button>
            </div>
            
            <div className="service-card card-hover">
              <div className="service-icon coffee-icon">
                <span>☕</span>
              </div>
              <h3>Coffee Services</h3>
              <p>
                State of the art freshly ground coffee machines, including teas, hot chocolate, cappuccinos, and more at your fingertips. Enjoy a barista experience with our Coffee Services in California, which include a diverse selection of freshly served coffees. We take care of maintenance and restocking. We offer Bean to Cup machines and a wide range of coffee vending machines in California. Leave it to us.
              </p>
              <button 
                className="btn-animated service-btn coffee-btn"
                onClick={() => handleServiceClick('coffee-services')}
              >
                Read more
              </button>
            </div>
            
            <div className="service-card card-hover">
              <div className="service-icon vending-icon">
                <span>🥤</span>
              </div>
              <h3>Vending Machines</h3>
              <p>
                Refresh, snack, and indulge with our smart vending machines – offering a wide range of selections from healthy snacks to guilty pleasures, cold drinks to energizing beverages. Tailored for convenience, ready for your choice.
              </p>
              <button 
                className="btn-animated service-btn vending-btn"
                onClick={() => handleServiceClick('vending-machines')}
              >
                Read more
              </button>
            </div>
          </div>
        </section>

        {/* About/Empowering Section */}
        <section 
          ref={aboutRef}
          className={`about-section ${aboutVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="about-content">
            <h6 className="section-subtitle">We are</h6>
            <h2 className="section-title gradient-text">SMARTER VENDING</h2>
            <h4 className="section-description">EMPOWERING EMPLOYEES, ENRICHING LIVES.</h4>
            <div className="about-text">
              <p>
                We are passionate about offering nutritious options that keep employees energized and healthy, contributing to a vibrant and productive environment. Our mini-markets are fully customizable, allowing your employees to voice their preferences and see their favorite items stocked. Our Vending Machines in California are equipped with cutting-edge technology for inventory tracking, ensuring we&apos;re always stocked and ready.
              </p>
              <p>
                For coffee lovers, we are one of the top Coffee Suppliers in California, offering multiple stations, including fresh-brewed, bean-to-cup machines for any facility size. We manage everything – cleaning, restocking, and maintenance, so there&apos;s no need for you to lift a finger. Additionally, we can tailor Workplace Wellness programs, offering perks that boost employee well-being and satisfaction.
              </p>
              <div className="about-buttons">
                <Link href="/about" className="btn-animated about-btn">
                  Read more about us
                </Link>
                <button 
                  className="btn-animated appointment-btn"
                  onClick={handleMakeAppointment}
                >
                  Make an appointment
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How Does It Work */}
        <section 
          ref={workRef}
          className={`work-section ${workVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <h2 className="section-title">How does it work?</h2>
          <ol className="work-steps">
            <li className="work-step">
              <strong>Choose Your Services:</strong> Select the Vending, Coffee, or Mini-Market services your company desires.
            </li>
            <li className="work-step">
              <strong>Site Inspection:</strong> We&apos;ll visit your company for a thorough site inspection to tailor our setup to your space.
            </li>
            <li className="work-step">
              <strong>Delivery and Installation:</strong> Our team delivers and installs all necessary equipment, ensuring everything is ready for use.
            </li>
            <li className="work-step">
              <strong>On-Site Assistance:</strong> We will be on-site for training/support to assist your employees and ensure a smooth transition for the first few days.
            </li>
            <li className="work-step">
              <strong>Seamless Restocking:</strong> After going live, we take care of all restocking needs. We become like ghosts - present but unobtrusive, ensuring you never have to worry.
            </li>
          </ol>
        </section>

        {/* Featured Coffee Products */}
        <section className="coffee-section">
          <h6 className="section-subtitle">Order online</h6>
          <h2 className="section-title">Our featured coffee products</h2>
          <p className="section-text">
            Tailor your coffee experience with customizable options, ensuring your selections are perfectly aligned with your tastes and preferences. Simply place your orders, and leave the rest to us – we deliver and do the restocking for you.
          </p>
          <div className="coffee-products">
            <div className="coffee-product float">
              <span>☕</span>
            </div>
            <div className="coffee-product float-delayed">
              <span>🫖</span>
            </div>
            <div className="coffee-product float">
              <span>🥤</span>
            </div>
          </div>
          <button 
            className="btn-animated login-btn"
            onClick={handleLoginToOrder}
          >
            Login to order online
          </button>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <div className="cta-content">
            <h3 className="cta-title">
              TAKE THE NEXT STEP AND REACH OUT TODAY FOR OUR<br />
              <span className="cta-highlight mini-markets">MINI MARKETS</span>, <span className="cta-highlight coffee">COFFEE SERVICES</span> AND <span className="cta-highlight vending">VENDING MACHINES</span>!
            </h3>
            <h4 className="cta-phone">Call us today <span className="phone-highlight">909.258.9848</span></h4>
            <button 
              className="btn-animated cta-button-final"
              onClick={handleMakeAppointment}
            >
              Make an appointment
            </button>
          </div>
        </section>
      </Layout>

      <style jsx>{`
        /* Global Improvements */
        * {
          box-sizing: border-box;
        }

        .hero-section {
          position: relative;
          background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
          color: white;
          padding: 8rem 2rem 6rem;
          text-align: center;
          overflow: hidden;
          min-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
        }

        .hero-bg-animation {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255, 102, 0, 0.1), rgba(0, 102, 204, 0.1));
          animation: gradientShift 8s ease-in-out infinite;
        }

        .hero-title {
          font-size: clamp(2.8rem, 7vw, 4.5rem);
          font-weight: 800;
          margin: 0 0 1.5rem 0;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: clamp(1.3rem, 3.5vw, 2.2rem);
          margin: 0 0 3.5rem 0;
          opacity: 0.95;
          font-weight: 300;
          letter-spacing: 0.5px;
        }

        .cta-button {
          background: linear-gradient(135deg, #ff6600 0%, #ff4400 100%);
          color: white;
          border: none;
          padding: 1.4rem 3rem;
          font-size: 1.1rem;
          border-radius: 60px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 2.5rem;
          box-shadow: 
            0 12px 24px rgba(255, 102, 0, 0.3),
            0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .cta-button:hover::before {
          left: 100%;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 
            0 20px 40px rgba(255, 102, 0, 0.4),
            0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .hero-phone {
          margin-top: 2.5rem;
          font-weight: 500;
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .phone-highlight {
          color: #ffff00;
          font-weight: 700;
          font-size: 1.3em;
          text-shadow: 0 0 10px rgba(255, 255, 0, 0.3);
        }

        .company-logos {
          padding: 6rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          position: relative;
        }

        .company-logos::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 102, 204, 0.3), transparent);
        }

        .section-title {
          font-size: clamp(2rem, 5vw, 3rem);
          margin-bottom: 4rem;
          color: #1a1a1a;
          font-weight: 700;
          letter-spacing: -0.02em;
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(135deg, #0066cc, #ff6600);
          border-radius: 2px;
        }

        .logos-container {
          display: flex;
          gap: 3rem;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
        }

        .logo-item {
          opacity: 0;
          transform: translateY(30px) scale(0.8);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 1rem;
          border-radius: 12px;
          background: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .logo-item.animated {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .logo-item:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .pros-section {
          padding: 8rem 2rem;
          text-align: center;
          background: white;
          position: relative;
        }

        .pros-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .section-subtitle {
          color: #0066cc;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-bottom: 1.5rem;
          font-weight: 700;
          position: relative;
        }

        .section-subtitle::before,
        .section-subtitle::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 30px;
          height: 1px;
          background: #0066cc;
        }

        .section-subtitle::before {
          left: -40px;
        }

        .section-subtitle::after {
          right: -40px;
        }

        .section-description {
          font-size: clamp(1.2rem, 3vw, 1.6rem);
          color: #2a2a2a;
          margin-bottom: 2.5rem;
          font-weight: 400;
          line-height: 1.5;
        }

        .section-text {
          font-size: 1.15rem;
          line-height: 1.8;
          color: #555;
          margin: 0 auto;
          max-width: 800px;
        }

        .services-section {
          padding: 8rem 2rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          position: relative;
        }

        .services-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 102, 204, 0.3), transparent);
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 3rem;
          max-width: 1300px;
          margin: 0 auto;
        }

        .service-card {
          text-align: center;
          padding: 3.5rem 2.5rem;
          background: white;
          border-radius: 24px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.08),
            0 4px 12px rgba(0, 0, 0, 0.03);
          position: relative;
          overflow: visible;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 102, 204, 0.02), rgba(255, 102, 0, 0.02));
          border-radius: 24px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .service-card:hover::before {
          opacity: 1;
        }

        .service-card:hover {
          transform: translateY(-8px);
          box-shadow: 
            0 30px 60px rgba(0, 0, 0, 0.12),
            0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .service-icon {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          margin: 0 auto 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3.5rem;
          position: relative;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .service-card:hover .service-icon {
          transform: scale(1.1);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        }

        .mini-markets-icon {
          background: linear-gradient(135deg, #0066cc, #004499);
        }

        .coffee-icon {
          background: linear-gradient(135deg, #8B4513, #A0522D);
          position: relative;
          overflow: visible;
        }

        .coffee-icon::before,
        .coffee-icon::after {
          content: '◜◝◜◝';
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%) rotate(90deg);
          font-size: 10px;
          color: rgba(255, 255, 255, 0.8);
          opacity: 0;
          transition: opacity 0.3s ease;
          text-shadow: 0 0 4px rgba(255, 255, 255, 0.6);
          letter-spacing: -1px;
        }

        .coffee-icon::before {
          left: 45%;
          animation-delay: 0s;
        }

        .coffee-icon::after {
          left: 55%;
          animation-delay: 0.6s;
          content: '◝◜◝◜';
        }

        .service-card:hover .coffee-icon::before,
        .service-card:hover .coffee-icon::after {
          opacity: 1;
          animation: steamRise 2.5s ease-in-out infinite;
        }

        @keyframes steamRise {
          0% {
            transform: translateX(-50%) translateY(0) rotate(90deg) scale(0.8);
            opacity: 0.8;
          }
          50% {
            transform: translateX(-50%) translateY(-20px) rotate(90deg) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translateX(-50%) translateY(-40px) rotate(90deg) scale(1.2);
            opacity: 0;
          }
        }

        .vending-icon {
          background: linear-gradient(135deg, #ff6600, #e55a00);
        }

        .service-card h3 {
          color: #1a1a1a;
          margin-bottom: 1.8rem;
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .service-card p {
          color: #555;
          line-height: 1.8;
          margin-bottom: 2.5rem;
          font-size: 1.05rem;
        }

        .service-btn {
          border: none;
          padding: 1rem 2.5rem;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .service-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .service-btn:hover::before {
          left: 100%;
        }

        .service-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .mini-markets-btn {
          background: linear-gradient(135deg, #0066cc, #004499);
          color: white;
        }

        .coffee-btn {
          background: linear-gradient(135deg, #8B4513, #6B3410);
          color: white;
        }

        .vending-btn {
          background: linear-gradient(135deg, #ff6600, #e55a00);
          color: white;
        }

        .about-section {
          padding: 8rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
          color: white;
          position: relative;
        }

        .about-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.03"><circle cx="30" cy="30" r="1"/></g></svg>');
        }

        .about-content {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .about-text {
          margin-top: 3rem;
        }

        .about-text p {
          font-size: 1.15rem;
          line-height: 1.9;
          margin-bottom: 2rem;
          opacity: 0.95;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
        }

        .about-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          margin-top: 4rem;
          flex-wrap: wrap;
        }

        .about-btn {
          background: white;
          color: #0066cc;
          padding: 1.2rem 2.5rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.95rem;
        }

        .about-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
          background: #f8f9fa;
        }

        .appointment-btn {
          background: linear-gradient(135deg, #ff6600, #e55a00);
          color: white;
          border: none;
          padding: 1.2rem 2.5rem;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.95rem;
        }

        .appointment-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(255, 102, 0, 0.4);
        }

        .work-section {
          padding: 8rem 2rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          position: relative;
        }

        .work-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 102, 204, 0.3), transparent);
        }

        .work-section .section-title {
          text-align: center;
          margin-bottom: 5rem;
        }

        .work-steps {
          max-width: 900px;
          margin: 0 auto;
          padding-left: 0;
          list-style: none;
          counter-reset: step-counter;
        }

        .work-step {
          counter-increment: step-counter;
          margin-bottom: 2.5rem;
          padding: 2rem 2.5rem 2rem 5rem;
          background: white;
          border-radius: 20px;
          box-shadow: 
            0 8px 25px rgba(0, 0, 0, 0.06),
            0 2px 8px rgba(0, 0, 0, 0.04);
          position: relative;
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 102, 204, 0.08);
        }

        .work-step:hover {
          transform: translateX(8px);
          box-shadow: 
            0 12px 35px rgba(0, 0, 0, 0.1),
            0 4px 15px rgba(0, 0, 0, 0.08);
          border-color: rgba(0, 102, 204, 0.15);
        }

        .work-step::before {
          content: counter(step-counter);
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, #0066cc, #004499);
          color: white;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
        }

        .work-step strong {
          color: #0066cc;
          font-weight: 700;
          font-size: 1.05em;
        }

        .coffee-section {
          padding: 8rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          position: relative;
        }

        .coffee-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 102, 204, 0.3), transparent);
        }

        .coffee-products {
          display: flex;
          gap: 3rem;
          justify-content: center;
          flex-wrap: wrap;
          margin: 4rem 0;
        }

        .coffee-product {
          width: 180px;
          height: 180px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4.5rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.1),
            0 4px 12px rgba(0, 0, 0, 0.05);
          position: relative;
          overflow: hidden;
        }

        .coffee-product::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .coffee-product:hover::before {
          opacity: 1;
        }

        .coffee-product:nth-child(1) {
          background: linear-gradient(135deg, #8B4513, #A0522D);
        }

        .coffee-product:nth-child(2) {
          background: linear-gradient(135deg, #D2691E, #CD853F);
        }

        .coffee-product:nth-child(3) {
          background: linear-gradient(135deg, #A0522D, #8B4513);
        }

        .coffee-product:hover {
          transform: scale(1.08) rotate(2deg);
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.15),
            0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .float {
          animation: float 6s ease-in-out infinite;
        }

        .float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .login-btn {
          background: linear-gradient(135deg, #0066cc, #004499);
          color: white;
          border: none;
          padding: 1.2rem 2.5rem;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
        }

        .login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .login-btn:hover::before {
          left: 100%;
        }

        .login-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 102, 204, 0.4);
        }

        .cta-section {
          padding: 8rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23ffffff" stroke-width="0.5" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
        }

        .cta-content {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .cta-title {
          font-size: clamp(1.6rem, 4.5vw, 2.4rem);
          margin-bottom: 3rem;
          line-height: 1.4;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .cta-highlight {
          font-weight: 800;
          position: relative;
          padding: 0 8px;
          border-radius: 8px;
        }

        .cta-highlight.mini-markets {
          background: linear-gradient(135deg, rgba(0, 102, 204, 0.2), rgba(0, 102, 204, 0.1));
          color: #66b3ff;
          border: 1px solid rgba(0, 102, 204, 0.3);
        }

        .cta-highlight.coffee {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.2), rgba(139, 69, 19, 0.1));
          color: #cd853f;
          border: 1px solid rgba(139, 69, 19, 0.3);
        }

        .cta-highlight.vending {
          background: linear-gradient(135deg, rgba(255, 102, 0, 0.2), rgba(255, 102, 0, 0.1));
          color: #ff9966;
          border: 1px solid rgba(255, 102, 0, 0.3);
        }

        .cta-phone {
          font-size: 1.6rem;
          margin: 3rem 0;
          font-weight: 600;
        }

        .cta-button-final {
          background: linear-gradient(135deg, #ff6600, #e55a00);
          color: white;
          border: none;
          padding: 1.4rem 3rem;
          font-size: 1.1rem;
          border-radius: 60px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 
            0 12px 24px rgba(255, 102, 0, 0.3),
            0 4px 12px rgba(0, 0, 0, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
        }

        .cta-button-final::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .cta-button-final:hover::before {
          left: 100%;
        }

        .cta-button-final:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 20px 40px rgba(255, 102, 0, 0.4),
            0 8px 20px rgba(0, 0, 0, 0.25);
        }

        /* Animation Improvements */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-on-scroll.animated {
          opacity: 1;
          transform: translateY(0);
        }

        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-animated {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .btn-animated::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .btn-animated:hover::before {
          left: 100%;
        }

        .gradient-text {
          background: linear-gradient(135deg, #ffffff, #e6f3ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          filter: grayscale(100%) opacity(0.7);
        }

        .logo-hover:hover {
          filter: grayscale(0%) opacity(1);
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 6rem 1rem 4rem;
            min-height: 70vh;
          }

          .services-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .service-card {
            padding: 2.5rem 2rem;
          }

          .service-icon {
            width: 100px;
            height: 100px;
            font-size: 3rem;
          }

          .about-buttons {
            flex-direction: column;
            align-items: center;
          }

          .logos-container {
            gap: 2rem;
          }

          .work-step {
            padding: 1.5rem 2rem 1.5rem 4rem;
            font-size: 1rem;
          }

          .work-step::before {
            width: 2rem;
            height: 2rem;
            left: 1rem;
            font-size: 0.9rem;
          }

          .coffee-products {
            gap: 2rem;
          }

          .coffee-product {
            width: 140px;
            height: 140px;
            font-size: 3.5rem;
          }

          .section-subtitle::before,
          .section-subtitle::after {
            display: none;
          }

          .cta-highlight {
            display: inline-block;
            margin: 0.2rem 0;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2.2rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .section-title {
            font-size: 1.8rem;
          }

          .service-card {
            padding: 2rem 1.5rem;
          }

          .coffee-product {
            width: 120px;
            height: 120px;
            font-size: 3rem;
          }
        }
      `}</style>
    </>
  );
}
