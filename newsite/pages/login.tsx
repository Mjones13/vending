import Head from "next/head";
import Layout from "../components/Layout";
import { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Both fields are required.");
      setSubmitted(false);
    } else {
      setError("");
      setSubmitted(true);
      // Placeholder: No real authentication
    }
  };

  return (
    <>
      <Head>
        <title>Login | SMARTER VENDING</title>
        <meta name="description" content="Login to your Smarter Vending account." />
      </Head>
      <Layout>
        <section id="login-hero">
          <h1>Login</h1>
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Email or Username:</label>
            <input type="text" id="email" name="email" value={form.email} onChange={handleChange} />
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" value={form.password} onChange={handleChange} />
            {error && <span style={{ color: "red" }}>{error}</span>}
            <button type="submit">Login</button>
            {submitted && <p style={{ color: "green" }}>Login submitted (placeholder only).</p>}
          </form>
          <p style={{ marginTop: "1rem" }}><a href="#">Forgot your password?</a></p>
        </section>
      </Layout>
    </>
  );
} 