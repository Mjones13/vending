import Head from "next/head";
import Layout from "../components/Layout";

export default function Shop() {
  return (
    <>
      <Head>
        <title>Shop | SMARTER VENDING</title>
        <meta name="description" content="Shop for ground & whole bean coffee, airpot portion packets, and accessories from Smarter Vending." />
      </Head>
      <Layout>
        <section id="shop-hero">
          <h1>Shop</h1>
          <p>Tailor your coffee experience with customizable options. Simply place your orders, and leave the rest to us – we deliver and do the restocking for you.</p>
        </section>
        <section id="shop-categories">
          <h2>Categories</h2>
          <ul>
            <li>Ground & Whole Bean</li>
            <li>Airpot Portion Packets</li>
            <li>Accessories</li>
          </ul>
        </section>
        <section id="shop-featured">
          <h2>Featured Products</h2>
          <div>[Featured products will appear here]</div>
        </section>
      </Layout>
    </>
  );
} 