import Head from "next/head";
import Layout from "../components/Layout";

export default function Home() {
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
        <section id="hero">
          <img src="/hero-bg.jpg" alt="Smarter Vending Hero" style={{ width: "100%", maxHeight: 400, objectFit: "cover" }} />
          <h1>SMARTER VENDING</h1>
          <h2>Traditional & healthy</h2>
          <button>Request a Demo</button>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>CALL US TODAY <span style={{ color: '#0070f3' }}>909.258.9848</span></p>
        </section>

        {/* Company Logos */}
        <section id="company-logos">
          <h3>Trusted by</h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: 'center' }}>
            <img src="/disney-logo.png" alt="Disney" height={40} />
            <img src="/sheraton-logo.png" alt="Sheraton" height={40} />
            <img src="/marriott-logo.png" alt="Marriott" height={40} />
            <img src="/toyota-logo.png" alt="Toyota" height={40} />
            <img src="/audacy-logo.png" alt="Audacy" height={40} />
            <img src="/romeo-power-logo.png" alt="Romeo Power" height={40} />
            <img src="/splitsville-logo.png" alt="Splitsville" height={40} />
            <img src="/fresh-n-lean-logo.png" alt="Fresh N Lean" height={40} />
            <img src="/din-tai-fung-logo.png" alt="Din Tai Fung" height={40} />
          </div>
        </section>

        {/* Service Highlights */}
        <section id="services" style={{ display: "flex", gap: 32 }}>
          <div>
            <img src="/mini-markets-icon.svg" alt="Mini Markets" height={60} />
            <h3>Mini Markets</h3>
            <p>Have your own store in your break room! Stocked with fresh, frozen, and a variety of drinks – all chosen by your staff through our online suggestion box. LET US HANDLE RESTOCKING. Custom-designed to fit any space.</p>
            <button>Read more</button>
          </div>
          <div>
            <img src="/coffee-services-icon.svg" alt="Coffee Services" height={60} />
            <h3>Coffee Services</h3>
            <p>State of the art freshly ground coffee machines, including teas, hot chocolate, cappuccinos, and more at your fingertips. Enjoy a barista experience with our Coffee Services in California, which include a diverse selection of freshly served coffees. We take care of maintenance and restocking. We offer Bean to Cup machines and a wide range of coffee vending machines in California. Leave it to us.</p>
            <button>Read more</button>
          </div>
          <div>
            <img src="/vending-machines-icon.svg" alt="Vending Machines" height={60} />
            <h3>Vending Machines</h3>
            <p>Refresh, snack, and indulge with our smart vending machines – offering a wide range of selections from healthy snacks to guilty pleasures, cold drinks to energizing beverages. Tailored for convenience, ready for your choice.</p>
            <button>Read more</button>
          </div>
        </section>

        {/* About/Empowering Section */}
        <section id="about">
          <h3>EMPOWERING EMPLOYEES, ENRICHING LIVES.</h3>
          <p>We are passionate about offering nutritious options that keep employees energized and healthy, contributing to a vibrant and productive environment. Our mini-markets are fully customizable, allowing your employees to voice their preferences and see their favorite items stocked. Our Vending Machines in California are equipped with cutting-edge technology for inventory tracking, ensuring we&apos;re always stocked and ready.</p>
          <p>For coffee lovers, we are one of the top Coffee Suppliers in California, offering multiple stations, including fresh-brewed, bean-to-cup machines for any facility size. We manage everything – cleaning, restocking, and maintenance, so there&apos;s no need for you to lift a finger. Additionally, we can tailor Workplace Wellness programs, offering perks that boost employee well-being and satisfaction.</p>
        </section>

        {/* How Does It Work */}
        <section id="how-it-works">
          <h3>How does it work?</h3>
          <ol>
            <li><b>Choose Your Services:</b> Select the Vending, Coffee, or Mini-Market services your company desires.</li>
            <li><b>Site Inspection:</b> We&apos;ll visit your company for a thorough site inspection to tailor our setup to your space.</li>
            <li><b>Delivery and Installation:</b> Our team delivers and installs all necessary equipment, ensuring everything is ready for use.</li>
            <li><b>On-Site Assistance:</b> We will be on-site for training/support to assist your employees and ensure a smooth transition for the first few days.</li>
            <li><b>Seamless Restocking:</b> After going live, we take care of all restocking needs. We become like ghosts - present but unobtrusive, ensuring you never have to worry.</li>
          </ol>
        </section>

        {/* Featured Coffee Products */}
        <section id="featured-coffee">
          <h3>Our featured coffee products</h3>
          <p>Tailor your coffee experience with customizable options, ensuring your selections are perfectly aligned with your tastes and preferences. Simply place your orders, and leave the rest to us – we deliver and do the restocking for you.</p>
          <div>
            <img src="/coffee-product-1.jpg" alt="Coffee Product 1" height={80} />
            <img src="/coffee-product-2.jpg" alt="Coffee Product 2" height={80} />
            <img src="/coffee-product-3.jpg" alt="Coffee Product 3" height={80} />
          </div>
        </section>

        {/* Call to Action */}
        <section id="cta">
          <h3>TAKE THE NEXT STEP AND REACH OUT TODAY FOR OUR <b>MINI MARKETS</b>, <b>COFFEE SERVICES</b> AND <b>VENDING MACHINES</b>!</h3>
          <h4>Call us today <span style={{ color: '#0070f3' }}>909.258.9848</span></h4>
          <button>Make an appointment</button>
        </section>
      </Layout>
    </>
  );
}
