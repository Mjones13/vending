import Head from "next/head";
import Layout from "../components/Layout";

export default function MiniMarkets() {
  return (
    <>
      <Head>
        <title>Micro & Mini Market Vending Machines California | SMARTER VENDING</title>
        <meta name="description" content="Our Mini Markets in California are customizable, on-site retail space offering fresh, frozen, and packaged food options with 24/7 access. Grab, Scan, and Go!" />
      </Head>
      <Layout>
        {/* Hero Section */}
        <section id="mini-markets-hero">
          <h6>Mini Markets</h6>
          <h1>Why is our Mini Market a game-changer for your break room?</h1>
          <p><strong>Our Mini Markets in California are customizable, on-site retail space offering a wide range of fresh, frozen, and packaged food and beverage options, designed to provide employees with convenient, 24/7 access to healthy and satisfying choices right in their workplace. Grab, Scan, and Go!</strong></p>
        </section>

        {/* The Process Simplified */}
        <section id="process">
          <h3>The Process Simplified</h3>
          <p>Our team will come to your workplace for a thorough inspection, crafting a tailored design and layout for your approval. Once you give the green light, we&apos;ll deliver and set up everything needed, filling your market with an array of delicious food options. To ensure a smooth transition, we&apos;ll have a representative on-site for the first 2-3 days, ready to guide your employees through using the market and to answer any questions or provide assistance. It&apos;s as straightforward as it gets!</p>
        </section>

        {/* Components */}
        <section id="components">
          <h2>Components</h2>
          <ul>
            <li><strong>Freezer:</strong> Chill out with our selection of frozen meals, ice cream, and healthy bowls, catering to all your frosty cravings.</li>
            <li><strong>Refrigerator:</strong> Refresh and refuel with our coolers, brimming with salads, sandwiches, cold drinks, and fresh fruits—perfect for a quick, nutritious bite.</li>
            <li><strong>Shelving Units:</strong> Snack and savor from our shelving units, offering a delightful mix of pastries, chips, soups, and a variety of tasty treats.</li>
            <li><strong>Kiosk Gondola Shelving:</strong> Discover wellness at our kiosk, stocked with essential hygiene, personal care, and health items, keeping well-being within easy reach.</li>
            <li><strong>Checkout Kiosk:</strong> Experience convenience at its best with our checkout kiosk, designed for swift, seamless transactions and a hassle-free shopping finale.</li>
          </ul>
        </section>

        {/* Customize your build */}
        <section id="customize">
          <h2>Customize your build</h2>
          <p><strong>With our custom build approach, you have full control over the look, color, and design of your Micro Markets in California, ensuring it aligns perfectly with your workplace aesthetic and theme. From the woodwork to the layout, every element can be tailored to reflect your specific vision and preferences, giving you the power to create a space that&apos;s truly your own.</strong></p>
          <button>Make an appointment</button>
        </section>

        {/* Suggestion Box */}
        <section id="suggestion-box">
          <h6>Suggestion Box</h6>
          <h3>Let your employees make requests</h3>
          <p>Our QR Code Suggestion Box empowers employees to directly influence the snack and drink selections in their workplace, ensuring their cravings and nutritional needs are always met.</p>
          <p><strong>Total turnaround time:</strong> 7 business days or less.</p>
        </section>
      </Layout>
    </>
  );
} 