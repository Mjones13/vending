import Head from "next/head";
import Layout from "../components/Layout";
import * as React from "react";
import { isContactFormData, isValidEmail, ContactFormData } from "../lib/type-guards";

export default function Contact() {
  const [formData, setFormData] = React.useState<ContactFormData>({
    name: "",
    email: "",
    message: ""
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};

    // Validate using type guards
    if (!isContactFormData(formData)) {
      newErrors.general = "Invalid form data format";
      setErrors(newErrors);
      return;
    }

    // Basic required field validation
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Form data is validated and safe to process
    setErrors({});
    setShowSuccess(true);
    setFormData({ name: "", email: "", message: "" });

    // Here you could safely send the validated data to an API
    // fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Head>
        <title>Contact Us - Smarter Vending Machine | SMARTER VENDING</title>
        <meta name="description" content="Contact Smarter Vending for professional, affordable vending services. Call/text (909) 258-9848 or complete our form. Serving Southern California locations." />
      </Head>
      <Layout>
        {/* Hero Section */}
        <section id="contact-hero">
          <h6>Contact Us</h6>
          <h1>HOW CAN WE HELP?</h1>
        </section>

        {/* Contact Information */}
        <section id="contact-info">
          <p>Smarter Vending is dedicated to being professional, affordable and an accessible vending service company to all. We use state-of-the-art vending technology to provide a wide variety of traditional and healthy products for your work force, reaching people all <strong>around Southern California</strong>. We are a team of talented and dynamic vending experts who provide those with a fast pace lifestyle with healthy food alternatives while still maintaining traditional options. The good news is, we are hear to listen!</p>
          
          <p><strong>You can contact Smarter Vending in a number of ways. Feel free to call/text us at (909) 258-9848, online or complete the submission form below. You can also visit the &ldquo;Make an Appointment&rdquo; link. We will get back to you within minutes.</strong></p>
        </section>

        {/* Our Locations */}
        <section id="locations">
          <h3>OUR LOCATIONS</h3>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <ul>
              <li>San Diego County</li>
              <li>La County</li>
              <li>Orange County</li>
              <li>Riverside County</li>
            </ul>
            <ul>
              <li>San Bernardino County</li>
              <li>Louisville, Kentucky</li>
              <li>Tampa, Florida</li>
            </ul>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact-form">
          {showSuccess && (
            <div style={{ color: "green", marginBottom: "1rem" }}>
              <p>Thank you for your message! We&apos;ll get back to you soon.</p>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{ borderColor: errors.name ? "red" : "" }}
              />
              {errors.name && <span style={{ color: "red" }}>{errors.name}</span>}
            </div>
            <div>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{ borderColor: errors.email ? "red" : "" }}
              />
              {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}
            </div>
            <div>
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                style={{ borderColor: errors.message ? "red" : "" }}
              />
              {errors.message && <span style={{ color: "red" }}>{errors.message}</span>}
            </div>
            <button type="submit">Send Message</button>
          </form>
        </section>

        {/* Call to Action */}
        <section id="contact-cta">
          <h3>Need Some Help?<br />Call us today<br /><strong>909.258.9848</strong></h3>
          <button>Make an appointment</button>
        </section>
      </Layout>
    </>
  );
} 