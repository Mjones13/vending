import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "../components/Layout";
import HeroSection from "../components/HeroSection";
import { useStaggeredAnimation } from "../hooks/useScrollAnimation";

export default function Home() {
  const router = useRouter();
  const [logoAnimations, triggerLogoAnimations] = useStaggeredAnimation(9, 150);

  useEffect(() => {
    // Trigger logo animations on mount
    setTimeout(() => {
      triggerLogoAnimations();
    }, 500);
  }, [triggerLogoAnimations]);

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

        {/* Leave it to the Pros Section */}
        <section className="section section-white">
          <div className="container">
            <div className="section-header">
              <h6 className="section-subtitle">Leave it to the Pros!</h6>
              <h2 className="section-title">We handle Restocking, Cleaning and Maintenance.</h2>
              <h4 className="section-description">Keep your employees onsite during breaks</h4>
              <p className="section-text">
                We cater to large companies of 150 – 25,000 employees and prestigious locations, including Downtown Disney, 
                providing top-tier Vending, Coffee, and Mini-Market services to enhance the workplace experience.
              </p>
            </div>
          </div>
        </section>

        {/* Service Highlights */}
        <section className="section section-neutral">
          <div className="container">
            <div className="grid grid-auto gap-8">
              <div className="service-card">
                <div className="service-icon service-icon-primary">
                  <span>🏪</span>
                </div>
                <h3>Mini Markets</h3>
                <p>
                  Have your own store in your break room! Stocked with fresh, frozen, and a variety of drinks – all chosen by your staff through our online suggestion box. LET US HANDLE RESTOCKING. Custom-designed to fit any space.
                </p>
                <button 
                  className="btn btn-primary btn-shimmer"
                  onClick={() => handleServiceClick('mini-markets')}
                >
                  Read more
                </button>
              </div>
              
              <div className="service-card">
                <div className="service-icon service-icon-coffee">
                  <span>☕</span>
                </div>
                <h3>Coffee Services</h3>
                <p>
                  State of the art freshly ground coffee machines, including teas, hot chocolate, cappuccinos, and more at your fingertips. Enjoy a barista experience with our Coffee Services in California, which include a diverse selection of freshly served coffees. We take care of maintenance and restocking. We offer Bean to Cup machines and a wide range of coffee vending machines in California. Leave it to us.
                </p>
                <button 
                  className="btn btn-coffee btn-shimmer"
                  onClick={() => handleServiceClick('coffee-services')}
                >
                  Read more
                </button>
              </div>
              
              <div className="service-card">
                <div className="service-icon service-icon-accent">
                  <span>🥤</span>
                </div>
                <h3>Vending Machines</h3>
                <p>
                  Refresh, snack, and indulge with our smart vending machines – offering a wide range of selections from healthy snacks to guilty pleasures, cold drinks to energizing beverages. Tailored for convenience, ready for your choice.
                </p>
                <button 
                  className="btn btn-accent btn-shimmer"
                  onClick={() => handleServiceClick('vending-machines')}
                >
                  Read more
                </button>
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

        {/* Call to Action */}
        <section className="section section-cta">
          <div className="container">
            <div className="text-center">
              <h3 className="cta-title">
                TAKE THE NEXT STEP AND REACH OUT TODAY FOR OUR<br />
                <span className="cta-highlight cta-highlight-primary">MINI MARKETS</span>, <span className="cta-highlight cta-highlight-coffee">COFFEE SERVICES</span> AND <span className="cta-highlight cta-highlight-accent">VENDING MACHINES</span>!
              </h3>
              <h4 className="cta-phone">Call us today <span className="phone-highlight">909.258.9848</span></h4>
              <button 
                className="btn btn-accent btn-xl btn-shimmer"
                onClick={handleMakeAppointment}
              >
                Make an appointment
              </button>
            </div>
          </div>
        </section>
      </Layout>

    </>
  );
}
