import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import HeroSection from "../components/HeroSection";

export default function MiniMarkets() {
  const router = useRouter();

  const handleMakeAppointment = () => {
    router.push('/contact');
  };

  return (
    <>
      <Head>
        <title>Micro & Mini Market Vending Machines California | SMARTER VENDING</title>
        <meta name="description" content="Our Mini Markets in California are customizable, on-site retail space offering fresh, frozen, and packaged food options with 24/7 access. Grab, Scan, and Go!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        {/* Hero Section */}
        <HeroSection
          backgroundImage="/images/hero-backgrounds/mini-markets/micro-market-hero.jpg"
          title="Mini Markets"
          subtitle="Why is our Mini Market a game-changer for your break room?"
          description="Our Mini Markets in California are customizable, on-site retail space offering a wide range of fresh, frozen, and packaged food and beverage options, designed to provide employees with convenient, 24/7 access to healthy and satisfying choices right in their workplace. Grab, Scan, and Go!"
          ctaButton={{
            text: "Make an Appointment",
            onClick: handleMakeAppointment
          }}
          minHeight="70vh"
          overlayOpacity={0.3}
        />

        {/* The Process Simplified */}
        <section className="section section-neutral">
          <div className="container">
            <div className="section-header">
              <h3 className="section-title">The Process Simplified</h3>
              <p className="section-description">
                Our team will come to your workplace for a thorough inspection, crafting a tailored design and layout for your approval. Once you give the green light, we&apos;ll deliver and set up everything needed, filling your market with an array of delicious food options. To ensure a smooth transition, we&apos;ll have a representative on-site for the first 2-3 days, ready to guide your employees through using the market and to answer any questions or provide assistance. It&apos;s as straightforward as it gets!
              </p>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="section section-white">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Components</h2>
            </div>
            <div className="grid grid-auto gap-8">
              <div className="service-card">
                <div className="service-icon service-icon-primary">
                  <span>🧊</span>
                </div>
                <h4>Freezer</h4>
                <p>Chill out with our selection of frozen meals, ice cream, and healthy bowls, catering to all your frosty cravings.</p>
              </div>
              <div className="service-card">
                <div className="service-icon service-icon-accent">
                  <span>🥗</span>
                </div>
                <h4>Refrigerator</h4>
                <p>Refresh and refuel with our coolers, brimming with salads, sandwiches, cold drinks, and fresh fruits—perfect for a quick, nutritious bite.</p>
              </div>
              <div className="service-card">
                <div className="service-icon service-icon-coffee">
                  <span>🍪</span>
                </div>
                <h4>Shelving Units</h4>
                <p>Snack and savor from our shelving units, offering a delightful mix of pastries, chips, soups, and a variety of tasty treats.</p>
              </div>
              <div className="service-card">
                <div className="service-icon service-icon-primary">
                  <span>🧴</span>
                </div>
                <h4>Kiosk Gondola Shelving</h4>
                <p>Discover wellness at our kiosk, stocked with essential hygiene, personal care, and health items, keeping well-being within easy reach.</p>
              </div>
              <div className="service-card">
                <div className="service-icon service-icon-accent">
                  <span>💳</span>
                </div>
                <h4>Checkout Kiosk</h4>
                <p>Experience convenience at its best with our checkout kiosk, designed for swift, seamless transactions and a hassle-free shopping finale.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Customize your build */}
        <section className="section section-neutral">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Customize your build</h2>
              <p className="section-description">
                <strong>With our custom build approach, you have full control over the look, color, and design of your Micro Markets in California, ensuring it aligns perfectly with your workplace aesthetic and theme. From the woodwork to the layout, every element can be tailored to reflect your specific vision and preferences, giving you the power to create a space that&apos;s truly your own.</strong>
              </p>
            </div>
            <div className="text-center">
              <button 
                className="btn btn-accent btn-xl btn-shimmer"
                onClick={handleMakeAppointment}
              >
                Make an appointment
              </button>
            </div>
          </div>
        </section>

        {/* Suggestion Box */}
        <section className="section section-white">
          <div className="container">
            <div className="section-header">
              <h6 className="section-subtitle">Suggestion Box</h6>
              <h3 className="section-title">Let your employees make requests</h3>
              <p className="section-description">
                Our QR Code Suggestion Box empowers employees to directly influence the snack and drink selections in their workplace, ensuring their cravings and nutritional needs are always met.
              </p>
              <p className="section-text" style={{color: 'var(--color-primary-600)', fontWeight: 'var(--font-weight-semibold)'}}>
                <strong>Total turnaround time:</strong> 7 business days or less.
              </p>
            </div>
          </div>
        </section>
      </Layout>

    </>
  );
} 