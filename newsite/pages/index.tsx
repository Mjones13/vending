import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useStaggeredAnimation } from "../hooks/useScrollAnimation";

export default function Home() {
  const router = useRouter();
  const [logoAnimations, triggerLogoAnimations] = useStaggeredAnimation(9, 150);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [animationState, setAnimationState] = useState<'visible' | 'exiting' | 'entering'>('visible');
  const rotatingWords = ['Workplaces', 'Apartments', 'Gyms', 'Businesses'];

  useEffect(() => {
    // Trigger logo animations on mount
    setTimeout(() => {
      triggerLogoAnimations();
    }, 500);
  }, [triggerLogoAnimations]);

  // Robust word cycling utility
  const getNextWordIndex = (currentIndex: number, wordsArray: string[]): number => {
    if (!wordsArray || wordsArray.length === 0) return 0;
    if (wordsArray.length === 1) return 0;
    
    const nextIndex = currentIndex + 1;
    // Explicit bounds checking instead of relying solely on modulo
    return nextIndex >= wordsArray.length ? 0 : nextIndex;
  };

  useEffect(() => {
    let animationId: number;
    let startTime = performance.now();
    let lastWordChangeTime = startTime;
    
    const CYCLE_DURATION = 3000;
    const TRANSITION_DURATION = 400;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const cycleProgress = (elapsed % CYCLE_DURATION) / CYCLE_DURATION;
      
      // Determine animation state based on cycle progress
      if (cycleProgress < 0.8) {
        // Visible state (80% of cycle)
        if (animationState !== 'visible') {
          setAnimationState('visible');
        }
      } else if (cycleProgress < 0.9) {
        // Exit state (10% of cycle)
        if (animationState !== 'exiting') {
          setAnimationState('exiting');
        }
      } else {
        // Enter state (10% of cycle)
        if (animationState !== 'entering') {
          // Robust word cycling with safety checks
          setCurrentWordIndex((prevIndex) => {
            const nextIndex = getNextWordIndex(prevIndex, rotatingWords);
            return nextIndex;
          });
          setAnimationState('entering');
          lastWordChangeTime = currentTime;
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [rotatingWords.length, animationState]);

  // Add safeguard effect for stuck states
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // If animation gets stuck, reset to visible state
      if (animationState !== 'visible') {
        setAnimationState('visible');
      }
    }, 2000); // Reset if stuck for more than 2 seconds
    
    return () => clearTimeout(timeoutId);
  }, [animationState]);

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
        {/* Modern Split-Screen Hero Section */}
        <section className="hero-split">
          <div className="hero-split-container">
            <div className="hero-content-side">
              <div className="hero-content-inner">
                <div className="hero-badge">
                  <span>California&apos;s #1 Choice</span>
                </div>
                <h1 className="hero-title">
                  <span data-testid="static-text">Premium Amenity for Modern</span>{' '}
                  <span className="rotating-text-container" data-testid="rotating-text-container">
                    <span 
                      key={currentWordIndex}
                      className={`rotating-text rotating-text-${animationState}`}
                      data-testid="rotating-text"
                    >
                      {rotatingWords[currentWordIndex]}
                    </span>
                  </span>
                </h1>
                <p className="hero-description">
                  Transform your workplace with comprehensive vending, coffee, and mini-market services. We serve businesses of 150-25,000 employees across California with premium solutions that keep teams energized and productive.
                </p>
                <div className="hero-stats">
                  <div className="stat-item">
                    <span className="stat-number">200+</span>
                    <span className="stat-label">Locations Served</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">50,000+</span>
                    <span className="stat-label">Happy Employees</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">15+</span>
                    <span className="stat-label">Years Experience</span>
                  </div>
                </div>
                <div className="hero-actions">
                  <button 
                    className="btn btn-primary btn-lg btn-shimmer"
                    onClick={handleRequestDemo}
                  >
                    Request a Demo
                  </button>
                  <div className="hero-contact">
                    <span className="contact-text">Or call us today</span>
                    <a href="tel:909.258.9848" className="contact-phone">909.258.9848</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-image-side">
              <div className="hero-image-container">
                <Image 
                  src="/images/hero-backgrounds/home/office-breakroom-hero.jpg"
                  alt="Modern office breakroom with vending solutions"
                  fill
                  className="hero-image"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="hero-image-overlay"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Logos */}
        <section className="section section-neutral">
          <div className="container">
            <div className="section-header">
              <h3 className="section-title">Trusted by Leading Companies</h3>
            </div>
            <div className="grid grid-auto-sm gap-8 items-center justify-center">
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
                  className={`logo-item transition hover:scale-105 ${logoAnimations[index] ? 'animate-fade-in' : ''}`}
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
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="why-choose-section">
          <div className="container">
            <div className="why-choose-grid">
              <div className="why-choose-content">
                <div className="section-badge">Why Choose Golden Coast Amenities</div>
                <h2 className="why-choose-title">
                  Turn your breakroom into the ultimate employee benefit
                </h2>
                <p className="why-choose-description">
                  We specialize in serving large companies of 150-25,000 employees across California, including prestigious locations like Downtown Disney. Our comprehensive approach means you get premium solutions without the hassle.
                </p>
                
                <div className="benefits-list">
                  <div className="benefit-item">
                    <div className="benefit-icon">✓</div>
                    <div className="benefit-content">
                      <h4>Complete Service Management</h4>
                      <p>We handle restocking, cleaning, maintenance, and repairs - you do nothing.</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">✓</div>
                    <div className="benefit-content">
                      <h4>Zero Upfront Investment</h4>
                      <p>No equipment costs, installation fees, or maintenance expenses.</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">✓</div>
                    <div className="benefit-content">
                      <h4>Employee Satisfaction Guaranteed</h4>
                      <p>Increase retention and productivity by keeping employees onsite and happy.</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">✓</div>
                    <div className="benefit-content">
                      <h4>Custom Solutions</h4>
                      <p>Tailored to your space, preferences, and company culture.</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleMakeAppointment}
                >
                  Schedule Consultation
                </button>
              </div>
              
              <div className="why-choose-image">
                <div className="image-stack">
                  <div className="image-card primary">
                    <Image 
                      src="/images/hero-backgrounds/mini-markets/micro-market-hero.jpg"
                      alt="Modern office micro market"
                      fill
                      className="stack-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="image-card secondary">
                    <Image 
                      src="/images/hero-backgrounds/coffee-services/coffee-brewing-hero.jpg"
                      alt="Premium coffee service"
                      fill
                      className="stack-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Service Showcase */}
        <section className="services-showcase">
          <div className="container">
            <div className="section-header text-center">
              <h2 className="section-title">Comprehensive Breakroom Solutions</h2>
              <p className="section-description">
                Everything you need to create the ultimate employee benefit and keep your team onsite during breaks.
              </p>
            </div>
            
            <div className="services-grid">
              {/* Mini Markets Service */}
              <div className="service-feature-card">
                <div className="service-feature-image">
                  <Image 
                    src="/images/hero-backgrounds/mini-markets/micro-market-hero.jpg"
                    alt="Modern micro market setup"
                    fill
                    className="service-image"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="service-feature-content">
                  <div className="service-feature-badge">Most Popular</div>
                  <h3 className="service-feature-title">Custom Micro-Markets</h3>
                  <p className="service-feature-description">
                    Transform your breakroom into a convenience store with fresh food, healthy options, and snacks. Completely customizable and managed by us.
                  </p>
                  <ul className="service-feature-benefits">
                    <li>Fresh, frozen & packaged foods</li>
                    <li>Employee suggestion system</li>
                    <li>24/7 accessibility</li>
                    <li>Zero upfront costs</li>
                  </ul>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleServiceClick('mini-markets')}
                  >
                    Learn More
                  </button>
                </div>
              </div>

              {/* Coffee Services */}
              <div className="service-feature-card">
                <div className="service-feature-image">
                  <Image 
                    src="/images/hero-backgrounds/coffee-services/coffee-brewing-hero.jpg"
                    alt="Professional coffee service"
                    fill
                    className="service-image"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="service-feature-content">
                  <h3 className="service-feature-title">Premium Coffee Services</h3>
                  <p className="service-feature-description">
                    From bean-to-cup machines to traditional brewing systems, we provide barista-quality coffee experiences for your workplace.
                  </p>
                  <ul className="service-feature-benefits">
                    <li>Bean-to-cup freshly ground</li>
                    <li>Full maintenance included</li>
                    <li>Wide variety of beverages</li>
                    <li>Professional installation</li>
                  </ul>
                  <button 
                    className="btn btn-coffee"
                    onClick={() => handleServiceClick('coffee-services')}
                  >
                    Learn More
                  </button>
                </div>
              </div>

              {/* Vending Machines */}
              <div className="service-feature-card">
                <div className="service-feature-image">
                  <Image 
                    src="/images/hero-backgrounds/vending-machines/smart-vending-hero.jpg"
                    alt="Smart vending technology"
                    fill
                    className="service-image"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="service-feature-content">
                  <h3 className="service-feature-title">Smart Vending Machines</h3>
                  <p className="service-feature-description">
                    State-of-the-art vending technology with contactless payments, real-time inventory, and healthy options alongside traditional favorites.
                  </p>
                  <ul className="service-feature-benefits">
                    <li>Contactless payment options</li>
                    <li>Real-time inventory tracking</li>
                    <li>Healthy & traditional options</li>
                    <li>Remote monitoring</li>
                  </ul>
                  <button 
                    className="btn btn-accent"
                    onClick={() => handleServiceClick('vending-machines')}
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About/Empowering Section */}
        <section className="section section-primary">
          <div className="container">
            <div className="section-header">
              <h6 className="section-subtitle">We are</h6>
              <h2 className="section-title">GOLDEN COAST AMENITIES</h2>
              <h4 className="section-description">EMPOWERING EMPLOYEES, ENRICHING LIVES.</h4>
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <p className="section-description">
                  We are passionate about offering nutritious options that keep employees energized and healthy, contributing to a vibrant and productive environment. Our mini-markets are fully customizable, allowing your employees to voice their preferences and see their favorite items stocked. Our Vending Machines in California are equipped with cutting-edge technology for inventory tracking, ensuring we&apos;re always stocked and ready.
                </p>
                <p className="section-description">
                  For coffee lovers, we are one of the top Coffee Suppliers in California, offering multiple stations, including fresh-brewed, bean-to-cup machines for any facility size. We manage everything – cleaning, restocking, and maintenance, so there&apos;s no need for you to lift a finger. Additionally, we can tailor Workplace Wellness programs, offering perks that boost employee well-being and satisfaction.
                </p>
                <div className="flex flex-wrap gap-4 justify-center mt-8">
                  <Link href="/about" className="btn btn-outline text-white border-white hover:bg-white hover:text-primary-600">
                    Read more about us
                  </Link>
                  <button 
                    className="btn btn-accent"
                    onClick={handleMakeAppointment}
                  >
                    Make an appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How Does It Work */}
        <section className="section section-white">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">How does it work?</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="process-steps">
                <div className="process-step">
                  <div className="process-number">1</div>
                  <div className="process-content">
                    <h4><strong>Choose Your Services:</strong></h4>
                    <p>Select the Vending, Coffee, or Mini-Market services your company desires.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="process-number">2</div>
                  <div className="process-content">
                    <h4><strong>Site Inspection:</strong></h4>
                    <p>We&apos;ll visit your company for a thorough site inspection to tailor our setup to your space.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="process-number">3</div>
                  <div className="process-content">
                    <h4><strong>Delivery and Installation:</strong></h4>
                    <p>Our team delivers and installs all necessary equipment, ensuring everything is ready for use.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="process-number">4</div>
                  <div className="process-content">
                    <h4><strong>On-Site Assistance:</strong></h4>
                    <p>We will be on-site for training/support to assist your employees and ensure a smooth transition for the first few days.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="process-number">5</div>
                  <div className="process-content">
                    <h4><strong>Seamless Restocking:</strong></h4>
                    <p>After going live, we take care of all restocking needs. We become like ghosts - present but unobtrusive, ensuring you never have to worry.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Coffee Products */}
        <section className="section section-neutral">
          <div className="container">
            <div className="section-header">
              <h6 className="section-subtitle">Order online</h6>
              <h2 className="section-title">Our featured coffee products</h2>
              <p className="section-text">
                Tailor your coffee experience with customizable options, ensuring your selections are perfectly aligned with your tastes and preferences. Simply place your orders, and leave the rest to us – we deliver and do the restocking for you.
              </p>
            </div>
            <div className="flex justify-center gap-8 mb-12">
              <div className="coffee-product animate-float">
                <span>☕</span>
              </div>
              <div className="coffee-product animate-float animate-stagger-2">
                <span>🫖</span>
              </div>
              <div className="coffee-product animate-float animate-stagger-3">
                <span>🥤</span>
              </div>
            </div>
            <div className="text-center">
              <button 
                className="btn btn-coffee btn-lg btn-shimmer"
                onClick={handleLoginToOrder}
              >
                Login to order online
              </button>
            </div>
          </div>
        </section>

        {/* Modern CTA Section */}
        <section className="final-cta-section">
          <div className="container">
            <div className="final-cta-content">
              <div className="final-cta-text">
                <h2 className="final-cta-title">
                  Ready to Upgrade Your Breakroom?
                </h2>
                <p className="final-cta-description">
                  Get a free consultation and discover how our comprehensive breakroom solutions can transform your workplace. No upfront costs, full-service management, and happier employees guaranteed.
                </p>
                <div className="final-cta-contact">
                  <div className="contact-method">
                    <span className="contact-label">Call us today</span>
                    <a href="tel:909.258.9848" className="contact-number">909.258.9848</a>
                  </div>
                  <div className="contact-divider">or</div>
                  <button 
                    className="btn btn-primary btn-xl btn-shimmer"
                    onClick={handleMakeAppointment}
                  >
                    Schedule Free Consultation
                  </button>
                </div>
              </div>
              <div className="final-cta-features">
                <div className="cta-feature">
                  <div className="cta-feature-icon">🎯</div>
                  <h4>Custom Solutions</h4>
                  <p>Tailored to your space and needs</p>
                </div>
                <div className="cta-feature">
                  <div className="cta-feature-icon">💰</div>
                  <h4>Zero Upfront Costs</h4>
                  <p>No equipment or installation fees</p>
                </div>
                <div className="cta-feature">
                  <div className="cta-feature-icon">🔧</div>
                  <h4>Full Service</h4>
                  <p>We handle everything for you</p>
                </div>
                <div className="cta-feature">
                  <div className="cta-feature-icon">✅</div>
                  <h4>Satisfaction Guaranteed</h4>
                  <p>15+ years of happy customers</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>

      <style jsx>{`
        /* Modern Split-Screen Hero */
        .hero-split {
          min-height: 90vh;
          display: flex;
          align-items: center;
          background: var(--color-white);
          overflow: hidden;
        }

        .hero-split-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 90vh;
          width: 100%;
        }

        .hero-content-side {
          display: flex;
          align-items: center;
          padding: var(--space-20) var(--space-12);
          background: var(--color-white);
        }

        .hero-content-inner {
          max-width: 600px;
        }

        .hero-badge {
          display: inline-block;
          background: var(--gradient-primary);
          color: var(--color-white);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--border-radius-full);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-6);
        }

        .hero-title {
          font-size: clamp(var(--font-size-4xl), 6vw, var(--font-size-6xl));
          font-weight: var(--font-weight-extrabold);
          color: var(--color-neutral-900);
          line-height: var(--line-height-tight);
          margin-bottom: var(--space-6);
          letter-spacing: -0.02em;
        }

        .rotating-text-container {
          display: inline-block;
          position: relative;
          min-width: 330px;
          max-width: 100%;
          height: 1.2em;
          overflow: hidden;
          vertical-align: baseline;
          line-height: inherit;
          /* Baseline correction for proper text alignment */
          top: 0.05em;
        }

        .rotating-text {
          color: var(--color-primary-600);
          display: inline-block;
          position: absolute;
          /* Use baseline-relative positioning instead of top: 0 */
          top: 0;
          left: 0;
          width: 100%;
          white-space: nowrap;
          line-height: inherit;
          /* Ensure consistent font baseline alignment */
          font-feature-settings: 'kern' 1;
          text-rendering: geometricPrecision;
          /* Additional baseline correction */
          transform: translateY(0);
        }

        .rotating-text-visible {
          transform: translateY(0);
          opacity: 1;
        }

        .rotating-text-exiting {
          animation: slideUpAndOut 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .rotating-text-entering {
          animation: slideInFromBottom 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes slideUpAndOut {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-120%);
            opacity: 0;
          }
        }

        @keyframes slideInFromBottom {
          0% {
            transform: translateY(120%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .hero-description {
          font-size: var(--font-size-lg);
          color: var(--color-neutral-600);
          line-height: var(--line-height-relaxed);
          margin-bottom: var(--space-8);
        }

        .hero-stats {
          display: flex;
          gap: var(--space-8);
          margin-bottom: var(--space-10);
          padding: var(--space-6) 0;
          border-top: var(--border-width) solid var(--color-neutral-200);
          border-bottom: var(--border-width) solid var(--color-neutral-200);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-extrabold);
          color: var(--color-primary-600);
          margin-bottom: var(--space-1);
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-neutral-600);
          font-weight: var(--font-weight-medium);
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: var(--space-8);
        }

        .hero-contact {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .contact-text {
          font-size: var(--font-size-sm);
          color: var(--color-neutral-600);
        }

        .contact-phone {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-primary-600);
          text-decoration: none;
        }

        .contact-phone:hover {
          color: var(--color-primary-700);
        }

        .hero-image-side {
          position: relative;
          background: var(--color-neutral-100);
        }

        .hero-image-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .hero-image {
          object-fit: cover;
        }

        .hero-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(249, 115, 22, 0.1));
        }

        /* Services Showcase */
        .services-showcase {
          padding: var(--space-32) 0;
          background: var(--gradient-neutral);
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--space-12);
          margin-top: var(--space-16);
        }

        .service-feature-card {
          background: var(--color-white);
          border-radius: var(--border-radius-2xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          transition: var(--transition-all);
          border: var(--border-width) solid var(--color-neutral-200);
          position: relative;
        }

        .service-feature-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-2xl);
        }

        .service-feature-image {
          position: relative;
          height: 240px;
          overflow: hidden;
        }

        .service-image {
          object-fit: cover;
          transition: var(--transition-transform);
        }

        .service-feature-card:hover .service-image {
          transform: scale(1.05);
        }

        .service-feature-content {
          padding: var(--space-8);
          position: relative;
        }

        .service-feature-badge {
          position: absolute;
          top: var(--space-4);
          left: var(--space-4);
          background: var(--color-accent-500);
          color: var(--color-white);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--border-radius-full);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .service-feature-title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-neutral-900);
          margin-bottom: var(--space-4);
        }

        .service-feature-description {
          color: var(--color-neutral-600);
          line-height: var(--line-height-relaxed);
          margin-bottom: var(--space-6);
        }

        .service-feature-benefits {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--space-8) 0;
        }

        .service-feature-benefits li {
          padding: var(--space-2) 0;
          color: var(--color-neutral-600);
          position: relative;
          padding-left: var(--space-6);
        }

        .service-feature-benefits li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--color-primary-600);
          font-weight: var(--font-weight-bold);
        }

        /* Why Choose Us Section */
        .why-choose-section {
          padding: var(--space-32) 0;
          background: var(--color-white);
        }

        .why-choose-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-20);
          align-items: center;
        }

        .section-badge {
          display: inline-block;
          background: var(--color-primary-50);
          color: var(--color-primary-600);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--border-radius-full);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-6);
        }

        .why-choose-title {
          font-size: clamp(var(--font-size-3xl), 5vw, var(--font-size-4xl));
          font-weight: var(--font-weight-extrabold);
          color: var(--color-neutral-900);
          line-height: var(--line-height-tight);
          margin-bottom: var(--space-6);
        }

        .why-choose-description {
          font-size: var(--font-size-lg);
          color: var(--color-neutral-600);
          line-height: var(--line-height-relaxed);
          margin-bottom: var(--space-10);
        }

        .benefits-list {
          margin-bottom: var(--space-10);
        }

        .benefit-item {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          align-items: flex-start;
        }

        .benefit-icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          background: var(--color-primary-600);
          color: var(--color-white);
          border-radius: var(--border-radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-sm);
        }

        .benefit-content h4 {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-neutral-900);
          margin-bottom: var(--space-2);
        }

        .benefit-content p {
          color: var(--color-neutral-600);
          line-height: var(--line-height-relaxed);
        }

        .image-stack {
          position: relative;
          height: 500px;
        }

        .image-card {
          position: absolute;
          border-radius: var(--border-radius-2xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          border: 4px solid var(--color-white);
        }

        .image-card.primary {
          width: 320px;
          height: 240px;
          top: 0;
          left: 0;
          z-index: 2;
        }

        .image-card.secondary {
          width: 280px;
          height: 200px;
          bottom: 60px;
          right: 0;
          z-index: 1;
        }

        .stack-image {
          object-fit: cover;
        }

        /* Final CTA Section */
        .final-cta-section {
          padding: var(--space-32) 0;
          background: linear-gradient(135deg, var(--color-primary-900), var(--color-primary-800));
          color: var(--color-white);
          position: relative;
          overflow: hidden;
        }

        .final-cta-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23ffffff" stroke-width="0.5" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
        }

        .final-cta-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-20);
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .final-cta-title {
          font-size: clamp(var(--font-size-3xl), 5vw, var(--font-size-5xl));
          font-weight: var(--font-weight-extrabold);
          margin-bottom: var(--space-6);
          line-height: var(--line-height-tight);
        }

        .final-cta-description {
          font-size: var(--font-size-lg);
          line-height: var(--line-height-relaxed);
          margin-bottom: var(--space-10);
          opacity: 0.95;
        }

        .final-cta-contact {
          display: flex;
          align-items: center;
          gap: var(--space-6);
          flex-wrap: wrap;
        }

        .contact-method {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .contact-label {
          font-size: var(--font-size-sm);
          opacity: 0.8;
          text-transform: uppercase;
          font-weight: var(--font-weight-medium);
          letter-spacing: 0.05em;
        }

        .contact-number {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-white);
          text-decoration: none;
          transition: var(--transition-colors);
        }

        .contact-number:hover {
          color: var(--color-primary-300);
        }

        .contact-divider {
          font-size: var(--font-size-lg);
          opacity: 0.7;
          font-weight: var(--font-weight-medium);
        }

        .final-cta-features {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-8);
        }

        .cta-feature {
          text-align: center;
          padding: var(--space-6);
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius-xl);
          backdrop-filter: blur(8px);
          border: var(--border-width) solid rgba(255, 255, 255, 0.2);
          transition: var(--transition-all);
        }

        .cta-feature:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.15);
        }

        .cta-feature-icon {
          font-size: var(--font-size-4xl);
          margin-bottom: var(--space-4);
        }

        .cta-feature h4 {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          margin-bottom: var(--space-2);
          color: var(--color-white);
        }

        .cta-feature p {
          font-size: var(--font-size-sm);
          opacity: 0.9;
          line-height: var(--line-height-relaxed);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .rotating-text-container {
            min-width: 240px;
          }
        }

        @media (max-width: 480px) {
          .rotating-text-container {
            min-width: 200px;
            font-size: 0.9em;
          }
        }

        @media (max-width: 1024px) {
          .hero-split-container {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .hero-content-side {
            order: 1;
            padding: var(--space-12) var(--space-8);
          }

          .hero-image-side {
            order: 2;
            height: 400px;
          }

          .hero-stats {
            flex-wrap: wrap;
            gap: var(--space-4);
          }

          .hero-actions {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-4);
          }

          .why-choose-grid {
            grid-template-columns: 1fr;
            gap: var(--space-12);
          }

          .why-choose-image {
            order: -1;
          }

          .services-grid {
            grid-template-columns: 1fr;
            gap: var(--space-8);
          }

          .final-cta-content {
            grid-template-columns: 1fr;
            gap: var(--space-12);
          }

          .final-cta-features {
            grid-template-columns: 1fr;
            gap: var(--space-6);
          }
        }

        @media (max-width: 768px) {
          .hero-content-side {
            padding: var(--space-8) var(--space-6);
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .service-feature-card {
            margin: 0 var(--space-4);
          }

          .stat-item {
            flex: 1;
          }

          .stat-number {
            font-size: var(--font-size-2xl);
          }

          .image-stack {
            height: 400px;
          }

          .image-card.primary {
            width: 260px;
            height: 200px;
          }

          .image-card.secondary {
            width: 220px;
            height: 160px;
            bottom: 40px;
          }

          .final-cta-contact {
            flex-direction: column;
            align-items: stretch;
            gap: var(--space-4);
          }

          .final-cta-features {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }

          .contact-number {
            font-size: var(--font-size-xl);
          }
        }
      `}</style>
    </>
  );
}
