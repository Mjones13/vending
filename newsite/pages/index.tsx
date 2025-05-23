import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "../components/Layout";
import { useScrollAnimation, useStaggeredAnimation } from "../hooks/useScrollAnimation";

export default function Home() {
  const router = useRouter();
  const [heroRef, heroVisible] = useScrollAnimation(0.3);
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
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className={`hero-section ${heroVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="hero-content">
            <h1 className="hero-title gradient-text">
              <span className="text-slide-up">
                <span>SMARTER VENDING</span>
              </span>
            </h1>
            <h2 className="hero-subtitle">
              <span className="text-slide-up">
                <span>Traditional & healthy</span>
              </span>
            </h2>
            <button 
              className="btn-animated cta-button"
              onClick={handleRequestDemo}
            >
              Request a Demo
            </button>
            <p className="hero-phone">
              CALL US TODAY <span className="phone-highlight">909.258.9848</span>
            </p>
          </div>
          <div className="hero-bg-animation"></div>
        </section>

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
        .hero-section {
          position: relative;
          background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
          color: white;
          padding: 6rem 2rem 4rem;
          text-align: center;
          overflow: hidden;
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
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
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: bold;
          margin: 0 0 1rem 0;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: clamp(1.2rem, 3vw, 2rem);
          margin: 0 0 3rem 0;
          opacity: 0.9;
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
          margin-bottom: 2rem;
          box-shadow: 0 8px 20px rgba(255, 102, 0, 0.3);
        }

        .hero-phone {
          margin-top: 2rem;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .phone-highlight {
          color: #ffff00;
          font-weight: bold;
          font-size: 1.2em;
        }

        .company-logos {
          padding: 4rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          margin-bottom: 3rem;
          color: #333;
          font-weight: 700;
        }

        .logos-container {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          max-width: 1000px;
          margin: 0 auto;
        }

        .logo-item {
          opacity: 0;
          transform: translateY(20px) scale(0.8);
          transition: all 0.6s ease;
        }

        .logo-item.animated {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .pros-section {
          padding: 5rem 2rem;
          text-align: center;
          background: white;
        }

        .pros-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .section-subtitle {
          color: #666;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .section-description {
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          color: #666;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .section-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
          margin: 0 auto;
        }

        .services-section {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .service-card {
          text-align: center;
          padding: 3rem 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .service-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin: 0 auto 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          position: relative;
        }

        .mini-markets-icon {
          background: linear-gradient(135deg, #0066cc, #004499);
        }

        .coffee-icon {
          background: linear-gradient(135deg, #8B4513, #A0522D);
        }

        .vending-icon {
          background: linear-gradient(135deg, #ff6600, #e55a00);
        }

        .service-card h3 {
          color: #333;
          margin-bottom: 1.5rem;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .service-card p {
          color: #666;
          line-height: 1.7;
          margin-bottom: 2rem;
        }

        .service-btn {
          border: none;
          padding: 1rem 2rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .mini-markets-btn {
          background: #0066cc;
          color: white;
        }

        .coffee-btn {
          background: #8B4513;
          color: white;
        }

        .vending-btn {
          background: #ff6600;
          color: white;
        }

        .about-section {
          padding: 5rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
          color: white;
        }

        .about-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .about-text {
          margin-top: 2rem;
        }

        .about-text p {
          font-size: 1.1rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          opacity: 0.95;
        }

        .about-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 3rem;
          flex-wrap: wrap;
        }

        .about-btn {
          background: white;
          color: #0066cc;
          padding: 1rem 2rem;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
        }

        .appointment-btn {
          background: #ff6600;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
        }

        .work-section {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .work-section .section-title {
          text-align: center;
          margin-bottom: 4rem;
        }

        .work-steps {
          max-width: 800px;
          margin: 0 auto;
          padding-left: 0;
          list-style: none;
          counter-reset: step-counter;
        }

        .work-step {
          counter-increment: step-counter;
          margin-bottom: 2rem;
          padding: 1.5rem 2rem;
          background: white;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          position: relative;
          padding-left: 4rem;
          font-size: 1.1rem;
          line-height: 1.7;
          color: #555;
        }

        .work-step::before {
          content: counter(step-counter);
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: #0066cc;
          color: white;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .work-step strong {
          color: #0066cc;
          font-weight: 700;
        }

        .coffee-section {
          padding: 5rem 2rem;
          text-align: center;
          background: white;
        }

        .coffee-products {
          display: flex;
          gap: 2rem;
          justify-content: center;
          flex-wrap: wrap;
          margin: 3rem 0;
        }

        .coffee-product {
          width: 150px;
          height: 150px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          cursor: pointer;
          transition: all 0.3s ease;
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
          transform: scale(1.1) rotate(5deg);
        }

        .login-btn {
          background: #0066cc;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .cta-section {
          padding: 5rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
          color: white;
        }

        .cta-content {
          max-width: 1000px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          margin-bottom: 2rem;
          line-height: 1.4;
          font-weight: 700;
        }

        .cta-highlight {
          font-weight: bold;
        }

        .cta-highlight.mini-markets {
          color: #0066cc;
        }

        .cta-highlight.coffee {
          color: #8B4513;
        }

        .cta-highlight.vending {
          color: #ff6600;
        }

        .cta-phone {
          font-size: 1.5rem;
          margin: 2rem 0;
          font-weight: 600;
        }

        .cta-button-final {
          background: #ff6600;
          color: white;
          border: none;
          padding: 1.2rem 2.5rem;
          font-size: 1.3rem;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 8px 20px rgba(255, 102, 0, 0.3);
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 4rem 1rem 3rem;
            min-height: 60vh;
          }

          .services-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .service-card {
            padding: 2rem 1.5rem;
          }

          .about-buttons {
            flex-direction: column;
            align-items: center;
          }

          .logos-container {
            gap: 1rem;
          }

          .work-step {
            padding-left: 3rem;
            font-size: 1rem;
          }

          .coffee-products {
            gap: 1rem;
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
