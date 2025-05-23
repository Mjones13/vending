import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function About() {
  const router = useRouter();
  const [heroRef, heroVisible] = useScrollAnimation(0.3);
  const [storyRef, storyVisible] = useScrollAnimation(0.2);
  const [processRef, processVisible] = useScrollAnimation(0.2);

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
        <section 
          ref={heroRef}
          className={`about-hero ${heroVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="hero-content">
            <h6 className="section-subtitle">About Us</h6>
            <h1 className="hero-title gradient-text">What we do</h1>
            <h4 className="hero-tagline">EMPOWERING EMPLOYEES, ENRICHING LIVES.</h4>
          </div>
        </section>

        {/* Company Story */}
        <section 
          ref={storyRef}
          className={`company-story ${storyVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="story-container">
            <div className="story-content">
              <div className="story-section">
                <h2 className="section-title">Our Journey</h2>
                <p className="story-paragraph">
                  Smarter Vending is a testament to the power of a simple idea born from genuine need and compassion. What began as a small family business a decade ago in Corona has now expanded across Southern and Central California, touching the lives of over 50,000 users across 200 locations. Our journey started when our founder, working night shifts in his early 20s, recognized the challenges his colleagues faced during late hours – safety concerns made it difficult to leave the facility, and the absence of open stores or food trucks left few options for sustenance.
                </p>
                <p className="story-paragraph">
                  With a vision to enhance the workplace environment, he secured permission to install vending machines at his own place of employment. The immediate impact was profound: staff morale soared, energy levels increased, and the workplace became a happier, more vibrant place. This transformation was not driven by profit but by a desire to improve the daily lives of employees.
                </p>
              </div>

              <div className="story-section">
                <h3 className="subsection-title">Making a Difference</h3>
                <p className="story-paragraph">
                  One of the standout advantages of having our services onsite is the elimination of the need for employees to leave the facility to grab a snack, meal, or beverage. This is particularly crucial during short 15-minute breaks, where time is of the essence. Our conveniently located vending machines and mini-markets ensure that employees can quickly access a wide range of nutritious and satisfying options without the hassle of leaving the premises.
                </p>
              </div>

              <div className="story-section">
                <h3 className="subsection-title">Workplace Wellness</h3>
                <p className="story-paragraph">
                  But what truly sets us apart is our unwavering dedication to enhancing workplace wellness. We understand that the heart of any company is its employees, which is why our Workplace Wellness programs are designed with the well-being of your staff in mind, offering perks that promote health, happiness, and productivity. Everything from periodic free gym memberships, gift cards, and other perks.
                </p>
                <p className="story-paragraph">
                  In every cup of coffee brewed, snack served, and market curated, Smarter Vending isn&apos;t just a provider; we&apos;re a partner in fostering a vibrant, healthy, and satisfying workplace culture. Join us in reimagining the potential of your break room and discover the difference that true quality and care can make.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section 
          ref={processRef}
          className={`process-section ${processVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="process-container">
            <h2 className="section-title">How does it work?</h2>
            <ol className="process-steps">
              <li className="process-step">
                <div className="step-content">
                  <strong>Choose Your Services:</strong> Select the Vending, Coffee, or Mini-Market services your company desires.
                </div>
              </li>
              <li className="process-step">
                <div className="step-content">
                  <strong>Site Inspection:</strong> We&apos;ll visit your company for a thorough site inspection to tailor our setup to your space.
                </div>
              </li>
              <li className="process-step">
                <div className="step-content">
                  <strong>Delivery and Installation:</strong> Our team delivers and installs all necessary equipment, ensuring everything is ready for use.
                </div>
              </li>
              <li className="process-step">
                <div className="step-content">
                  <strong>On-Site Assistance:</strong> We will be on-site for training/support to assist your employees and ensure a smooth transition for the first few days.
                </div>
              </li>
              <li className="process-step">
                <div className="step-content">
                  <strong>Seamless Restocking:</strong> After going live, we take care of all restocking needs. We become like ghosts - present but unobtrusive, ensuring you never have to worry.
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Call to Action */}
        <section className="about-cta">
          <div className="cta-content">
            <h3 className="cta-title">
              TAKE THE NEXT STEP AND REACH OUT TODAY FOR OUR<br />
              <span className="cta-highlight mini-markets">MINI MARKETS</span>, <span className="cta-highlight coffee">COFFEE SERVICES</span> AND <span className="cta-highlight vending">VENDING MACHINES</span>!
            </h3>
            <h4 className="cta-phone">Call us today <span className="phone-highlight">909.258.9848</span></h4>
            <button 
              className="btn-animated cta-button"
              onClick={handleMakeAppointment}
            >
              Make an appointment
            </button>
          </div>
        </section>
      </Layout>

      <style jsx>{`
        .about-hero {
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
          max-width: 800px;
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
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: bold;
          margin: 0 0 1rem 0;
          line-height: 1.2;
        }

        .hero-tagline {
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          margin: 0;
          opacity: 0.9;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .company-story {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .story-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .story-content {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .story-section {
          background: white;
          padding: 3rem;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .story-section:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }

        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          margin-bottom: 2rem;
          color: #333;
          font-weight: 700;
          text-align: center;
        }

        .subsection-title {
          font-size: clamp(1.3rem, 3vw, 1.8rem);
          margin-bottom: 1.5rem;
          color: #0066cc;
          font-weight: 700;
        }

        .story-paragraph {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
          margin-bottom: 1.5rem;
        }

        .story-paragraph:last-child {
          margin-bottom: 0;
        }

        .process-section {
          padding: 5rem 2rem;
          background: white;
        }

        .process-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .process-steps {
          list-style: none;
          padding: 0;
          margin: 0;
          counter-reset: step-counter;
        }

        .process-step {
          counter-increment: step-counter;
          margin-bottom: 2rem;
          position: relative;
          padding-left: 4rem;
        }

        .process-step::before {
          content: counter(step-counter);
          position: absolute;
          left: 0;
          top: 0;
          background: linear-gradient(135deg, #0066cc, #004499);
          color: white;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1rem;
          box-shadow: 0 3px 10px rgba(0, 102, 204, 0.3);
        }

        .step-content {
          background: #f8f9fa;
          padding: 1.5rem 2rem;
          border-radius: 10px;
          font-size: 1.1rem;
          line-height: 1.7;
          color: #555;
          transition: all 0.3s ease;
        }

        .step-content:hover {
          background: #e9ecef;
          transform: translateX(10px);
        }

        .step-content strong {
          color: #0066cc;
          font-weight: 700;
        }

        .about-cta {
          padding: 5rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
          color: white;
        }

        .cta-content {
          max-width: 1000px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          margin-bottom: 2rem;
          line-height: 1.4;
          font-weight: 700;
        }

        .cta-highlight {
          font-weight: bold;
        }

        .cta-highlight.mini-markets {
          color: #0066cc;
        }

        .cta-highlight.coffee {
          color: #8B4513;
        }

        .cta-highlight.vending {
          color: #ff6600;
        }

        .cta-phone {
          font-size: 1.5rem;
          margin: 2rem 0;
          font-weight: 600;
        }

        .phone-highlight {
          color: #ffff00;
          font-weight: bold;
        }

        .cta-button {
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

        .cta-button:hover {
          background: #e55a00;
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(255, 102, 0, 0.4);
        }

        @media (max-width: 768px) {
          .about-hero {
            padding: 4rem 1rem 3rem;
            min-height: 50vh;
          }

          .company-story {
            padding: 3rem 1rem;
          }

          .story-section {
            padding: 2rem;
          }

          .process-section {
            padding: 3rem 1rem;
          }

          .process-step {
            padding-left: 3rem;
          }

          .process-step::before {
            width: 2rem;
            height: 2rem;
            font-size: 0.9rem;
          }

          .step-content {
            padding: 1rem 1.5rem;
            font-size: 1rem;
          }

          .about-cta {
            padding: 3rem 1rem;
          }
        }
      `}</style>
    </>
  );
} 