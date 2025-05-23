import Head from "next/head";
import Layout from "../components/Layout";

export default function VendingMachines() {
  return (
    <>
      <Head>
        <title>Breakroom Coffee Vending Machines California | SMARTER VENDING</title>
        <meta name="description" content="Our vending machines support healthier living in diverse venues in California. Glass-front drink machines, traditional snack machines, refrigerated options and combo machines." />
      </Head>
      <Layout>
        {/* Hero Section */}
        <section id="vending-hero">
          <h4>LET US HANDLE RESTOCKING</h4>
          <h1>Breakroom Vending Machines</h1>
          <p><strong>Our vending machines support healthier living in diverse venues in California. We offer nourishing choices aligned with wellness initiatives in companies, factories, hospitals, hotels, and schools.</strong></p>
          <button>View our vending machines</button>
        </section>

        {/* Our Vending Machines */}
        <section id="our-machines">
          <h2>Our Vending Machines</h2>

          {/* Glass-Front Drink Machine */}
          <div className="machine-section">
            <h4>Glass-Front Drink Machine</h4>
            <p><strong>Drink Glass Front Machine</strong> – Offer your staff a huge cold drink selection ranging from juice to soda to energy drinks and much more – Holds a selection of roughly 40 choices – Credit card compatible and includes contactless pay methods such as Apple Pay – Equipped with an inventory tracking system which lets us know when the machine needs to be restocked.</p>
          </div>

          {/* Traditional Snack Machine */}
          <div className="machine-section">
            <h4>Traditional Snack Machine</h4>
            <p><strong>Traditional Snack Machine (not refrigerated)</strong> – Offers a large selection of both traditional and healthy options – Holds a selection of roughly 45 choices – Credit card compatible and includes contactless pay methods such as Apple Pay – Equipped with an inventory tracking system which lets us know when the machine needs to be restocked.</p>
          </div>

          {/* Refrigerated Snack Machine */}
          <div className="machine-section">
            <h4>Refrigerated snack machine</h4>
            <p>Able to hold perishable products such as Hot Pockets and Burritos – Holds a selection of roughly 40 choices – Credit card compatible and includes contact list pay methods such as Apple Pay – Equipped with an inventory tracking system which lets us know when the machine needs to be restocked.</p>
          </div>

          {/* Combo Machine */}
          <div className="machine-section">
            <h4>Refrigerated Snack & Drink combo machine</h4>
            <p>Refrigerated Snack & Drink Combo: Great for those with limited office space! – This is an all in one machine which holds drinks and snacks – Holds a selection of 12 drink choices and roughly 30 snack choices – Credit card compatible and includes contactless pay methods such as Apple Pay – Equipped with an inventory tracking system which lets us know when the machine needs to be restocked.</p>
          </div>
        </section>

        {/* Call to Action */}
        <section id="vending-cta">
          <h3>TAKE THE NEXT STEP AND REACH OUT TODAY FOR OUR<br /><strong>MINI MARKETS</strong>, <strong>COFFEE SERVICES</strong> AND <strong>VENDING MACHINES</strong>!</h3>
          <h3>Call us today<br /><strong>909.258.9848</strong></h3>
          <button>Make an appointment</button>
        </section>
      </Layout>
    </>
  );
} 