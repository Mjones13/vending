import Head from "next/head";
import Layout from "../components/Layout";

export default function Blog() {
  return (
    <>
      <Head>
        <title>Blog | SMARTER VENDING</title>
        <meta name="description" content="Read our blog posts about vending machines, cost saving features, and business solutions." />
      </Head>
      <Layout>
        {/* Hero Section */}
        <section id="blog-hero">
          <h1>Blog</h1>
        </section>

        {/* Blog Posts */}
        <section id="blog-posts">
          <article className="blog-post">
            <h2>Cost Saving Vending Machines With All Purpose Features</h2>
            <p className="post-meta">Vending Machines | December 10, 2020</p>
            <p>A vending machine has multiple purposes to support the industry, businesses, staff, and customers, but the biggest advantage is it [...]</p>
            <button>Cost Saving Vending Machines With All Purpose Features Read Post »</button>
          </article>
        </section>
      </Layout>
    </>
  );
} 