import Head from "next/head";
import Layout from "../components/Layout";
import { useState } from "react";

export default function RequestADemo() {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name) newErrors.name = "Name is required.";
    if (!form.company) newErrors.company = "Company is required.";
    if (!form.email) newErrors.email = "Email is required.";
    if (!form.phone) newErrors.phone = "Phone is required.";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitted(false);
    } else {
      setErrors({});
      setSubmitted(true);
      // Here you would send the form data to your backend or API
    }
  };

  return (
    <>
      <Head>
        <title>Request a Demo | SMARTER VENDING</title>
        <meta name="description" content="Request a demo of Smarter Vending's services and see how we can enhance your workplace experience." />
      </Head>
      <Layout>
        <section id="request-demo-hero">
          <h1>Request a Demo</h1>
          <p>See how Smarter Vending can enhance your workplace experience. Fill out the form below to request a demo.</p>
        </section>
        <section id="request-demo-form">
          <h2>Demo Request Form</h2>
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" value={form.name} onChange={handleChange} />
            {errors.name && <span style={{ color: "red" }}>{errors.name}</span>}
            <label htmlFor="company">Company:</label>
            <input type="text" id="company" name="company" value={form.company} onChange={handleChange} />
            {errors.company && <span style={{ color: "red" }}>{errors.company}</span>}
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} />
            {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}
            <label htmlFor="phone">Phone:</label>
            <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} />
            {errors.phone && <span style={{ color: "red" }}>{errors.phone}</span>}
            <button type="submit">Request Demo</button>
            {submitted && <p style={{ color: "green" }}>Thank you for your request!</p>}
          </form>
        </section>
      </Layout>
    </>
  );
} 