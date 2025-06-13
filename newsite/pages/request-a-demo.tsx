import Head from "next/head";
import Layout from "../components/Layout";
import * as React from "react";
import { isString, isValidEmail, isValidPhoneNumber } from "../lib/type-guards";

interface DemoRequestForm {
  name: string;
  company: string;
  email: string;
  phone: string;
}

function isDemoRequestForm(value: unknown): value is DemoRequestForm {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  return isString(obj.name) && 
         isString(obj.company) && 
         isString(obj.email) && 
         isString(obj.phone);
}

export default function RequestADemo() {
  const [form, setForm] = React.useState<DemoRequestForm>({ name: "", company: "", email: "", phone: "" });
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Validate using type guard
    if (!isDemoRequestForm(form)) {
      newErrors.general = "Invalid form data format";
      return newErrors;
    }
    
    // Required field validation
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.company.trim()) newErrors.company = "Company is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required.";
    } else if (!isValidPhoneNumber(form.phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }
    
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