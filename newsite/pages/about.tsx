import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function About() {
  const router = useRouter();

  const handleMakeAppointment = () => {
    router.push('/contact');
  };

  return (
    <>
      <Head>
        <title>About Us - Smarter Vending Machine | SMARTER VENDING</title>
        <meta name="description" content="Learn about Smarter Vending's journey from a small family business to serving over 50,000 users across 200 locations in California. Empowering employees, enriching lives." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        {/* Hero Section */}
        <section className="page-header">
          <div className="page-header-content">
            <h6 className="section-subtitle">About Us</h6>
            <h1 className="page-title">What we do</h1>
            <h4 className="page-subtitle">EMPOWERING EMPLOYEES, ENRICHING LIVES.</h4>
          </div>
        </section>

        {/* Company Story */}
        <section className="section section-white">
          <div className="container">
            <div className="content-block">
              <h2>Our Journey</h2>
              <p>
                Golden Coast Amenities is a testament to the power of a simple idea born from genuine need and compassion. What began as a small family business a decade ago in Corona has now expanded across Southern and Central California, touching the lives of over 50,000 users across 200 locations. Our journey started when our founder, working night shifts in his early 20s, recognized the challenges his colleagues faced during late hours – safety concerns made it difficult to leave the facility, and the absence of open stores or food trucks left few options for sustenance.
              </p>
              <p>
                With a vision to enhance the workplace environment, he secured permission to install vending machines at his own place of employment. The immediate impact was profound: staff morale soared, energy levels increased, and the workplace became a happier, more vibrant place. This transformation was not driven by profit but by a desire to improve the daily lives of employees.
              </p>
            </div>

            <div className="content-block">
              <h3>Making a Difference</h3>
              <p>
                One of the standout advantages of having our services onsite is the elimination of the need for employees to leave the facility to grab a snack, meal, or beverage. This is particularly crucial during short 15-minute breaks, where time is of the essence. Our conveniently located vending machines and mini-markets ensure that employees can quickly access a wide range of nutritious and satisfying options without the hassle of leaving the premises.
              </p>
            </div>

            <div className="content-block">
              <h3>Workplace Wellness</h3>
              <p>
                But what truly sets us apart is our unwavering dedication to enhancing workplace wellness. We understand that the heart of any company is its employees, which is why our Workplace Wellness programs are designed with the well-being of your staff in mind, offering perks that promote health, happiness, and productivity. Everything from periodic free gym memberships, gift cards, and other perks.
              </p>
              <p>
                In every cup of coffee brewed, snack served, and market curated, Golden Coast Amenities isn&apos;t just a provider; we&apos;re a partner in fostering a vibrant, healthy, and satisfying workplace culture. Join us in reimagining the potential of your break room and discover the difference that true quality and care can make.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section section-neutral">
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