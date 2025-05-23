import Head from "next/head";
import Layout from "../components/Layout";

export default function Careers() {
  return (
    <>
      <Head>
        <title>Careers- Join US. Become A Part Of Something BIG | SMARTER VENDING</title>
        <meta name="description" content="Join Smarter Vending - family owned company with ambition, enthusiasm, and encouragement. Flexible hours, uncapped compensation, and rewarding work environment." />
      </Head>
      <Layout>
        {/* Hero Section */}
        <section id="careers-hero">
          <h6>Careers</h6>
          <h1>Join US</h1>
          <h4>Become A Part Of Something BIG!</h4>
        </section>

        {/* Company Culture */}
        <section id="company-culture">
          <p>Smarter Vending offers a culture of ambition, enthusiasm, and encouragement. As a family owned company, we are small enough to enjoy a family environment, but large enough to deliver on promises to our staff and clients.</p>

          <p>In a competitive environment, we provide strong resources for our staff to excel and grow with us. Many of our positions offer uncapped compensation, meaning our sales team enjoys high payouts for excellent performance. Most of our positions offer flexible hours. We care about our staff&apos;s quality of life and try not to obligate them to abide by the typical 9am-5pm system.</p>

          <h3>If you feel like job flexibility with rewarding compensation is a good fit for you, please contact us. We would love to hear from you!</h3>
        </section>

        {/* Call to Action */}
        <section id="careers-cta">
          <h3>Call us today<br /><strong>909.258.9848</strong></h3>
          <button>Make an appointment</button>
        </section>
      </Layout>
    </>
  );
} 