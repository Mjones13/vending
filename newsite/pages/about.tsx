import Head from "next/head";
import Layout from "../components/Layout";

export default function About() {
  return (
    <>
      <Head>
        <title>About Us - Smarter Vending Machine | SMARTER VENDING</title>
        <meta name="description" content="Learn about Smarter Vending's journey from a small family business to serving over 50,000 users across 200 locations in California. Empowering employees, enriching lives." />
      </Head>
      <Layout>
        {/* Hero Section */}
        <section id="about-hero">
          <h6>About Us</h6>
          <h1>What we do</h1>
          <h4>EMPOWERING EMPLOYEES, ENRICHING LIVES.</h4>
        </section>

        {/* Company Story */}
        <section id="company-story">
          <p>Smarter Vending is a testament to the power of a simple idea born from genuine need and compassion. What began as a small family business a decade ago in Corona has now expanded across Southern and Central California, touching the lives of over 50,000 users across 200 locations. Our journey started when our founder, working night shifts in his early 20s, recognized the challenges his colleagues faced during late hours – safety concerns made it difficult to leave the facility, and the absence of open stores or food trucks left few options for sustenance. With a vision to enhance the workplace environment, he secured permission to install vending machines at his own place of employment. The immediate impact was profound: staff morale soared, energy levels increased, and the workplace became a happier, more vibrant place. This transformation was not driven by profit but by a desire to improve the daily lives of employees. Realizing the potential to replicate this positive change on a larger scale, our founder set out to extend these benefits to other companies. Today, Smarter Vending continues to operate with the same foundational principles of care, service, and community enrichment that sparked its inception, making a meaningful difference in workplaces throughout California.</p>

          <p>One of the standout advantages of having our services onsite is the elimination of the need for employees to leave the facility to grab a snack, meal, or beverage. This is particularly crucial during short 15-minute breaks, where time is of the essence. Our conveniently located vending machines and mini-markets ensure that employees can quickly access a wide range of nutritious and satisfying options without the hassle of leaving the premises. This maximizes their break time, allowing for genuine relaxation and recharging instead of spending precious minutes walking to and from external food outlets.</p>

          <p>But what truly sets us apart is our unwavering dedication to enhancing workplace wellness. We understand that the heart of any company is its employees, which is why our Workplace Wellness programs are designed with the well-being of your staff in mind, offering perks that promote health, happiness, and productivity. Everything from periodic free gym memberships, gift cards, and other perks.</p>

          <p>In every cup of coffee brewed, snack served, and market curated, Smarter Vending isn&apos;t just a provider; we&apos;re a partner in fostering a vibrant, healthy, and satisfying workplace culture. Join us in reimagining the potential of your break room and discover the difference that true quality and care can make.</p>
        </section>

        {/* How it works */}
        <section id="how-it-works">
          <h2>How does it work?</h2>
          <ul>
            <li><strong>Choose Your Services:</strong> Select the Vending, Coffee, or Mini-Market services your company desires.</li>
            <li><strong>Site Inspection:</strong> We&apos;ll visit your company for a thorough site inspection to tailor our setup to your space.</li>
            <li><strong>Delivery and Installation:</strong> Our team delivers and installs all necessary equipment, ensuring everything is ready for use.</li>
            <li><strong>On-Site Assistance:</strong> We will be on-site for training/support to assist your employees and ensure a smooth transition for the first few days.</li>
            <li><strong>Seamless Restocking:</strong> After going live, we take care of all restocking needs. We become like ghosts - present but unobtrusive, ensuring you never have to worry.</li>
          </ul>
        </section>

        {/* Call to Action */}
        <section id="about-cta">
          <h3>TAKE THE NEXT STEP AND REACH OUT TODAY FOR OUR<br /><strong>MINI MARKETS</strong>, <strong>COFFEE SERVICES</strong> AND <strong>VENDING MACHINES</strong>!</h3>
          <h3>Call us today<br /><strong>909.258.9848</strong></h3>
          <button>Make an appointment</button>
        </section>
      </Layout>
    </>
  );
} 