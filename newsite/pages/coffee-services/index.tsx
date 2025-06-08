import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import HeroSection from "../../components/HeroSection";

export default function CoffeeServicesOverview() {
  const router = useRouter();

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
        {/* Debug identifier */}
        <div style={{ display: 'none' }} data-page="coffee-services">Coffee Services Page Loaded</div>
        
        {/* Hero Section with Coffee Background */}
        <HeroSection
          backgroundImage="/images/hero-backgrounds/coffee-services/coffee-brewing-hero.jpg"
          title="Coffee Services"
          subtitle="Professional Office Coffee Solutions in California"
          description="Transform your workplace with our comprehensive coffee services. From bean-to-cup machines to traditional vending solutions, we provide everything you need to keep your team energized and productive."
          ctaButton={{
            text: "Make an Appointment",
            onClick: handleMakeAppointment
          }}
          minHeight="75vh"
          overlayOpacity={0.4}
        />

        {/* Overview Section */}
        <section className="section section-white">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Complete Coffee Solutions for Your Workplace</h2>
              <p className="section-description">
                We specialize in providing top-tier coffee services to businesses throughout California. Our comprehensive solutions include 
                state-of-the-art equipment, premium coffee selections, and full-service support to ensure your employees always have access 
                to exceptional coffee experiences.
              </p>
            </div>
            
            <div className="grid grid-auto gap-8">
              <div className="service-card">
                <div className="service-icon service-icon-coffee">
                  <span>☕</span>
                </div>
                <h3>Premium Quality</h3>
                <p>Sourced from the finest coffee beans worldwide, delivering exceptional taste in every cup.</p>
              </div>
              <div className="service-card">
                <div className="service-icon service-icon-primary">
                  <span>🔧</span>
                </div>
                <h3>Full Service</h3>
                <p>Complete installation, maintenance, and restocking services - we handle everything for you.</p>
              </div>
              <div className="service-card">
                <div className="service-icon service-icon-accent">
                  <span>🎯</span>
                </div>
                <h3>Customizable</h3>
                <p>Tailored solutions to match your workplace needs and employee preferences.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Coffee Equipment Section */}
        <section className="section section-neutral">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Our Coffee Equipment</h2>
              <h4 className="section-subtitle">Select on the screen, place your cup, and enjoy</h4>
              <p className="section-text">Our Coffee machines for Offices California make it that easy.</p>
            </div>

            <div className="equipment-grid">
              {/* Bean-to-Cup Section */}
              <div className="equipment-item">
                <div className="equipment-header">
                  <div className="flex justify-center gap-4 mb-4">
                    <div className="coffee-product">
                      <span>☕</span>
                    </div>
                    <div className="coffee-product" style={{background: 'var(--gradient-primary)'}}>
                      <span>🫘</span>
                    </div>
                  </div>
                  <h4 className="equipment-title">Bean to Cup Freshly Ground</h4>
                </div>
                <div className="equipment-content">
                  <ul className="equipment-features">
                    <li><strong>Freshness & Quality:</strong> Bean to Cup Ground on the spot</li>
                    <li><strong>900 cup capacity</strong></li>
                    <li><strong>Touchscreen Interface:</strong> Sleek, intuitive touch screen makes selecting your coffee type, strength, and customization options incredibly user-friendly.</li>
                    <li><strong>8-12 Selection including cappuccinos, teas, hot chocolate</strong></li>
                    <li><strong>Silent Operation:</strong> Advanced technology reduces the noise of grinding and brewing, making these machines unobtrusive in any office environment.</li>
                    <li><strong>Water Filtration System:</strong> Built-in water filtration ensures every cup is brewed with the purest water, enhancing the taste and quality of the coffee.</li>
                  </ul>
                </div>
              </div>

              {/* Coffee & Tea Vending Machine */}
              <div className="equipment-item">
                <div className="equipment-header">
                  <div className="flex justify-center gap-4 mb-4">
                    <div className="coffee-product" style={{background: 'var(--gradient-accent)'}}>
                      <span>🫖</span>
                    </div>
                    <div className="coffee-product">
                      <span>☕</span>
                    </div>
                    <div className="coffee-product" style={{background: 'var(--gradient-primary)'}}>
                      <span>🥤</span>
                    </div>
                  </div>
                  <h4 className="equipment-title">Coffee & Tea Vending Machine</h4>
                </div>
                <div className="equipment-content">
                  <ul className="equipment-features">
                    <li><strong>All Internal Components:</strong> All essentials, including cups, milk, and sugar, are neatly stored inside, leaving no accessories outside.</li>
                    <li><strong>Sleek Design:</strong> Featuring a modern, space-efficient design that enhances any setting.</li>
                    <li><strong>Intuitive Touchscreen:</strong> Navigate easily with a user-friendly interface for all your coffee choices.</li>
                    <li><strong>Large Capacity:</strong> Enjoy more coffee with less frequent refills, thanks to our generous capacity.</li>
                    <li><strong>Low Maintenance:</strong> Experience hassle-free operation with minimal upkeep required.</li>
                    <li><strong>Remote Monitoring:</strong> Benefit from prompt customer support and service, all remotely managed for convenience.</li>
                  </ul>
                </div>
              </div>

              {/* Coffee Airpots */}
              <div className="equipment-item">
                <div className="equipment-header">
                  <div className="flex justify-center gap-4 mb-4">
                    <div className="coffee-product" style={{background: 'linear-gradient(135deg, #B8860B, #DAA520)'}}>
                      <span>🫗</span>
                    </div>
                    <div className="coffee-product">
                      <span>☕</span>
                    </div>
                    <div className="coffee-product" style={{background: 'var(--gradient-accent)'}}>
                      <span>🏨</span>
                    </div>
                  </div>
                  <h4 className="equipment-title">Coffee Airpots</h4>
                </div>
                <div className="equipment-content">
                  <ul className="equipment-features">
                    <li><strong>Traditional choice typical for hotels or smaller companies</strong></li>
                    <li><strong>Temperature Retention:</strong> Airpots are designed to keep coffee hot for extended periods without the need for external heating sources, ensuring the last cup is as warm as the first.</li>
                    <li><strong>Convenience and Mobility:</strong> Lightweight and portable, airpots can be easily moved and placed wherever needed, from meeting rooms to event spaces, making them ideal for varied settings.</li>
                    <li><strong>Easy Dispensing:</strong> The pump-action dispensing mechanism allows for easy, self-serve access, reducing waiting times and enhancing user experience.</li>
                    <li><strong>Variety and Flexibility:</strong> Having multiple Airpots allows for offering different types of coffee (e.g., regular, decaf, flavored) simultaneously, catering to diverse preferences.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Your Workplace Needs Coffee */}
        <section className="section section-white">
          <div className="container">
            <div className="section-header">
              <h3 className="section-title">Why Your Workplace Needs Onsite Coffee</h3>
            </div>
            <div className="grid grid-auto-sm gap-6">
              <div className="service-card">
                <h4>Boosts Productivity</h4>
                <p>Keeps employees energized, enhancing focus.</p>
              </div>
              <div className="service-card">
                <h4>Increases Satisfaction</h4>
                <p>Demonstrates value, improving morale.</p>
              </div>
              <div className="service-card">
                <h4>Offers Convenience</h4>
                <p>Saves time, reducing off-site coffee runs.</p>
              </div>
              <div className="service-card">
                <h4>Builds Community</h4>
                <p>Encourages informal connections among staff.</p>
              </div>
              <div className="service-card">
                <h4>Saves Money</h4>
                <p>Reduces employees&apos; daily beverage expenses.</p>
              </div>
              <div className="service-card">
                <h4>Customizable</h4>
                <p>Tailors coffee choices to employee preferences.</p>
              </div>
              <div className="service-card">
                <h4>Eco-Friendly</h4>
                <p>Minimizes disposable cup use.</p>
              </div>
              <div className="service-card">
                <h4>Enriches Culture</h4>
                <p>Contributes to a dynamic, positive work environment.</p>
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
              <p className="section-description">
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
              <h3 className="cta-title">Ready to get started?!</h3>
              <h3 className="cta-title">Elevate your office coffee experience today with our <strong>office coffee service in California</strong></h3>
              <h4 className="cta-phone">Call us today <span style={{color: '#ffff00', fontWeight: 'bold'}}>909.258.9848</span></h4>
              <button 
                className="btn btn-accent btn-xl btn-shimmer"
                onClick={handleMakeAppointment}
              >
                Make an appointment
              </button>
            </div>
          </div>
        </section>

        {/* Navigation Links */}
        <section className="section section-neutral">
          <div className="container">
            <div className="section-header">
              <h3 className="section-title">Explore Our Coffee Services</h3>
            </div>
            <div className="flex justify-center gap-8 flex-wrap">
              <Link href="/coffee-services/ground-whole-bean" className="btn btn-coffee btn-lg btn-shimmer">
                Ground & Whole Bean
              </Link>
              <Link href="/coffee-services/airpot-portion-packets" className="btn btn-coffee btn-lg btn-shimmer">
                Airpot Portion Packets
              </Link>
              <Link href="/coffee-services/accessories" className="btn btn-coffee btn-lg btn-shimmer">
                Accessories
              </Link>
            </div>
          </div>
        </section>
      </Layout>

    </>
  );
} 