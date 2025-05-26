import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function MiniMarkets() {
  const router = useRouter();
  const [heroRef, heroVisible] = useScrollAnimation(0.3);
  const [processRef, processVisible] = useScrollAnimation(0.2);
  const [componentsRef, componentsVisible] = useScrollAnimation(0.2);

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
        <section 
          ref={heroRef}
          className={`mini-markets-hero ${heroVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="hero-content">
            <h6 className="section-subtitle">Mini Markets</h6>
            <h1 className="hero-title gradient-text">Why is our Mini Market a game-changer for your break room?</h1>
            <p className="hero-description">
              <strong>Our Mini Markets in California are customizable, on-site retail space offering a wide range of fresh, frozen, and packaged food and beverage options, designed to provide employees with convenient, 24/7 access to healthy and satisfying choices right in their workplace. Grab, Scan, and Go!</strong>
            </p>
          </div>
        </section>

        {/* The Process Simplified */}
        <section 
          ref={processRef}
          className={`process-section ${processVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="process-container">
            <h3 className="section-title">The Process Simplified</h3>
            <p className="process-description">
              Our team will come to your workplace for a thorough inspection, crafting a tailored design and layout for your approval. Once you give the green light, we&apos;ll deliver and set up everything needed, filling your market with an array of delicious food options. To ensure a smooth transition, we&apos;ll have a representative on-site for the first 2-3 days, ready to guide your employees through using the market and to answer any questions or provide assistance. It&apos;s as straightforward as it gets!
            </p>
          </div>
        </section>

        {/* Components */}
        <section 
          ref={componentsRef}
          className={`components-section ${componentsVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="components-container">
            <h2 className="section-title">Components</h2>
            <div className="components-grid">
              <div className="component-card card-hover">
                <div className="component-icon">🧊</div>
                <h4>Freezer</h4>
                <p>Chill out with our selection of frozen meals, ice cream, and healthy bowls, catering to all your frosty cravings.</p>
              </div>
              <div className="component-card card-hover">
                <div className="component-icon">🥗</div>
                <h4>Refrigerator</h4>
                <p>Refresh and refuel with our coolers, brimming with salads, sandwiches, cold drinks, and fresh fruits—perfect for a quick, nutritious bite.</p>
              </div>
              <div className="component-card card-hover">
                <div className="component-icon">🍪</div>
                <h4>Shelving Units</h4>
                <p>Snack and savor from our shelving units, offering a delightful mix of pastries, chips, soups, and a variety of tasty treats.</p>
              </div>
              <div className="component-card card-hover">
                <div className="component-icon">🧴</div>
                <h4>Kiosk Gondola Shelving</h4>
                <p>Discover wellness at our kiosk, stocked with essential hygiene, personal care, and health items, keeping well-being within easy reach.</p>
              </div>
              <div className="component-card card-hover">
                <div className="component-icon">💳</div>
                <h4>Checkout Kiosk</h4>
                <p>Experience convenience at its best with our checkout kiosk, designed for swift, seamless transactions and a hassle-free shopping finale.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Customize your build */}
        <section className="customize-section">
          <div className="customize-container">
            <h2 className="section-title">Customize your build</h2>
            <p className="customize-description">
              <strong>With our custom build approach, you have full control over the look, color, and design of your Micro Markets in California, ensuring it aligns perfectly with your workplace aesthetic and theme. From the woodwork to the layout, every element can be tailored to reflect your specific vision and preferences, giving you the power to create a space that&apos;s truly your own.</strong>
            </p>
            <button 
              className="btn-animated customize-button"
              onClick={handleMakeAppointment}
            >
              Make an appointment
            </button>
          </div>
        </section>

        {/* Suggestion Box */}
        <section className="suggestion-section">
          <div className="suggestion-container">
            <h6 className="section-subtitle">Suggestion Box</h6>
            <h3 className="section-title">Let your employees make requests</h3>
            <p className="suggestion-description">
              Our QR Code Suggestion Box empowers employees to directly influence the snack and drink selections in their workplace, ensuring their cravings and nutritional needs are always met.
            </p>
            <p className="turnaround-time">
              <strong>Total turnaround time:</strong> 7 business days or less.
            </p>
          </div>
        </section>
      </Layout>

      <style jsx>{`
        .mini-markets-hero {
          background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
          color: white;
          padding: 6rem 2rem 4rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          min-height: 60vh;
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
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: bold;
          margin: 0 0 2rem 0;
          line-height: 1.2;
        }

        .hero-description {
          font-size: 1.2rem;
          line-height: 1.6;
          opacity: 0.95;
        }

        .process-section {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .process-container {
          max-width: 900px;
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

        .process-description {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
        }

        .components-section {
          padding: 5rem 2rem;
          background: white;
        }

        .components-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .components-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .component-card {
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 15px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .component-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .component-card h4 {
          color: #0066cc;
          margin-bottom: 1rem;
          font-size: 1.3rem;
          font-weight: 700;
        }

        .component-card p {
          color: #666;
          line-height: 1.6;
        }

        .customize-section {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          text-align: center;
        }

        .customize-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .customize-description {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
          margin-bottom: 3rem;
        }

        .customize-button {
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

        .customize-button:hover {
          background: #e55a00;
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(255, 102, 0, 0.4);
        }

        .suggestion-section {
          padding: 5rem 2rem;
          background: white;
          text-align: center;
        }

        .suggestion-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .suggestion-description {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
          margin-bottom: 2rem;
        }

        .turnaround-time {
          font-size: 1.1rem;
          color: #0066cc;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .mini-markets-hero {
            padding: 4rem 1rem 3rem;
            min-height: 50vh;
          }

          .components-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .component-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
} 