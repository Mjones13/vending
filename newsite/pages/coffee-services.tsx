import Head from "next/head";
import Layout from "../components/Layout";
import Link from "next/link";

export default function CoffeeServices() {
  return (
    <>
      <Head>
        <title>Office Coffee Machine Suppliers California | SMARTER VENDING</title>
        <meta name="description" content="Premium Coffee Service, Onsite for your Company. Bean-to-Cup machines, Coffee & Tea Vending, Airpots. We handle installation, maintenance, and restocking." />
      </Head>
      <Layout>
        {/* Hero Section */}
        <section id="coffee-hero">
          <h6>Full Coffee Services</h6>
          <h1>Coffee Made Convenient</h1>
          <h4>Premium Coffee Service, Onsite for your Company.</h4>
        </section>

        {/* How it works */}
        <section id="how-it-works">
          <h2>How it works</h2>
          <ul>
            <li><strong>Site Inspection:</strong> We visit to assess space and discuss machine placement for optimal integration.</li>
            <li><strong>Choose Selections:</strong> Tell us your coffee preferences, including beans, teas, and specialties.</li>
            <li><strong>Install & Stock:</strong> We set up fresh bean-to-cup machines and stock them with your selected brews.</li>
            <li><strong>Brew & Enjoy:</strong> Installation complete, you&apos;re ready for top-notch, freshly brewed coffee.</li>
            <li><strong>Ongoing Restocking:</strong> We monitor supply levels and restock as needed to ensure your coffee station is always filled. Additionally, your company can place online orders for specific supplies or extra stock, offering flexibility and control over your coffee service.</li>
          </ul>
        </section>

        {/* Equipment Choices */}
        <section id="equipment-choices">
          <h2>Equipment Choices</h2>
          <h4>Select on the screen, place your cup, and enjoy</h4>
          <p>Our Coffee machines for Offices California make it that easy.</p>

          {/* Bean to Cup Section */}
          <div className="equipment-section">
            <div className="equipment-images">
              <img src="/Bean-to-Cup-Freshly-Ground-01.jpg" alt="Bean to Cup Machine 1" />
              <img src="/Bean-to-Cup-Freshly-Ground-2.jpg" alt="Bean to Cup Machine 2" />
              <img src="/Bean-to-Cup-Freshly-Ground-3.jpg" alt="Bean to Cup Machine 3" />
            </div>
            <h4>Bean to Cup Freshly Ground</h4>
            <ul>
              <li><strong>Freshness & Quality:</strong> Bean to Cup Ground on the spot</li>
              <li><strong>900 cup capacity</strong></li>
              <li><strong>Touchscreen Interface:</strong> Sleek, intuitive touch screen makes selecting your coffee type, strength, and customization options incredibly user-friendly.</li>
              <li><strong>8-12 Selection including cappuccinos, teas, hot chocolate</strong></li>
              <li><strong>Silent Operation:</strong> Advanced technology reduces the noise of grinding and brewing, making these machines unobtrusive in any office environment.</li>
              <li><strong>Water Filtration System:</strong> Built-in water filtration ensures every cup is brewed with the purest water, enhancing the taste and quality of the coffee.</li>
            </ul>
          </div>

          {/* Coffee & Tea Vending Machine */}
          <div className="equipment-section">
            <h4>Coffee & Tea Vending Machine</h4>
            <ul>
              <li><strong>All Internal Components:</strong> All essentials, including cups, milk, and sugar, are neatly stored inside, leaving no accessories outside.</li>
              <li><strong>Sleek Design:</strong> Featuring a modern, space-efficient design that enhances any setting.</li>
              <li><strong>Intuitive Touchscreen:</strong> Navigate easily with a user-friendly interface for all your coffee choices.</li>
              <li><strong>Large Capacity:</strong> Enjoy more coffee with less frequent refills, thanks to our generous capacity.</li>
              <li><strong>Low Maintenance:</strong> Experience hassle-free operation with minimal upkeep required.</li>
              <li><strong>Remote Monitoring:</strong> Benefit from prompt customer support and service, all remotely managed for convenience.</li>
            </ul>
            <div className="equipment-images">
              <img src="/Coffee-&-Tea-Vending-Machine-1.jpg" alt="Coffee Tea Vending Machine 1" />
              <img src="/Coffee-&-Tea-Vending-Machine-2.jpg" alt="Coffee Tea Vending Machine 2" />
              <img src="/Coffee-&-Tea-Vending-Machine-3.jpg" alt="Coffee Tea Vending Machine 3" />
            </div>
          </div>

          {/* Coffee Airpots */}
          <div className="equipment-section">
            <div className="equipment-images">
              <img src="/Coffee-Airpots-1.jpg" alt="Coffee Airpots 1" />
              <img src="/Coffee-Airpots-2.jpg" alt="Coffee Airpots 2" />
              <img src="/Coffee-Airpots-3.jpg" alt="Coffee Airpots 3" />
            </div>
            <h4>Coffee Airpots</h4>
            <ul>
              <li><strong>Traditional choice typical for hotels or smaller companies</strong></li>
              <li><strong>Temperature Retention:</strong> Airpots are designed to keep coffee hot for extended periods without the need for external heating sources, ensuring the last cup is as warm as the first.</li>
              <li><strong>Convenience and Mobility:</strong> Lightweight and portable, airpots can be easily moved and placed wherever needed, from meeting rooms to event spaces, making them ideal for varied settings.</li>
              <li><strong>Easy Dispensing:</strong> The pump-action dispensing mechanism allows for easy, self-serve access, reducing waiting times and enhancing user experience.</li>
              <li><strong>Variety and Flexibility:</strong> Having multiple Airpots allows for offering different types of coffee (e.g., regular, decaf, flavored) simultaneously, catering to diverse preferences.</li>
            </ul>
          </div>
        </section>

        {/* Coffee Selection */}
        <section id="coffee-selection">
          <h2>Our Coffee Selection</h2>
          <p>Showcase the range of coffees, teas, hot chocolates, and cappuccinos available.</p>
          <p>Use high-quality images or icons to visually represent the variety.</p>
        </section>

        {/* Why Your Workplace Needs Onsite Coffee */}
        <section id="workplace-benefits">
          <h3>Why Your Workplace Needs Onsite Coffee</h3>
          <ul>
            <li><strong>Boosts Productivity:</strong> Keeps employees energized, enhancing focus.</li>
            <li><strong>Increases Satisfaction:</strong> Demonstrates value, improving morale.</li>
            <li><strong>Offers Convenience:</strong> Saves time, reducing off-site coffee runs.</li>
            <li><strong>Builds Community:</strong> Encourages informal connections among staff.</li>
            <li><strong>Saves Money:</strong> Reduces employees' daily beverage expenses.</li>
            <li><strong>Customizable:</strong> Tailors coffee choices to employee preferences.</li>
            <li><strong>Eco-Friendly:</strong> Minimizes disposable cup use.</li>
            <li><strong>Enriches Culture:</strong> Contributes to a dynamic, positive work environment.</li>
          </ul>
        </section>

        {/* Why Choose Our Service */}
        <section id="why-choose-us">
          <h3>Why Choose Our Office Coffee Service in California</h3>
          <ul>
            <li><strong>Top-Quality Coffee:</strong> Finest beans for the best brews, every sip energizes.</li>
            <li><strong>Custom Choices:</strong> Wide selection to match any preference.</li>
            <li><strong>Hassle-Free Service:</strong> We manage installation, maintenance, and restocks.</li>
            <li><strong>Healthy Options:</strong> Includes wellness-focused alternatives.</li>
            <li><strong>Eco-Friendly:</strong> Sustainable practices from cups to beans.</li>
            <li><strong>Fast Support:</strong> Dedicated assistance keeps your station perfect.</li>
            <li><strong>Fresh Brewers:</strong> Our machines ensure every cup is freshly brewed.</li>
          </ul>
        </section>

        {/* Featured Coffee Products */}
        <section id="featured-coffee">
          <h6>Order online</h6>
          <h2>Our featured coffee products</h2>
          <p><strong>Tailor your coffee experience with customizable options, ensuring your selections are perfectly aligned with your tastes and preferences. Simply place your orders, and leave the rest to us – we deliver and do the restocking for you.</strong></p>
          <Link href="/login">Login to order online</Link>
        </section>

        {/* Call to Action */}
        <section id="coffee-cta">
          <h3>Ready to get started?</h3>
          <h3>Elevate your office coffee experience today with our <strong>office coffee service in California</strong></h3>
          <h3>Call us today<br /><strong>909.258.9848</strong></h3>
          <button>Make an appointment</button>
        </section>
      </Layout>
    </>
  );
} 