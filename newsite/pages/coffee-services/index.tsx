import Head from "next/head";
import Layout from "../../components/Layout";
import Link from "next/link";

export default function CoffeeServicesOverview() {
  return (
    <>
      <Head>
        <title>Coffee Services | SMARTER VENDING</title>
        <meta name="description" content="Overview of Coffee Services from Smarter Vending." />
      </Head>
      <Layout>
        <section id="coffee-services-overview">
          <h1>Coffee Services</h1>
          <p>[Exact content from smartervendinginc.com/coffee-services/ goes here]</p>
          <ul>
            <li><Link href="/coffee-services/ground-whole-bean">Ground & Whole Bean</Link></li>
            <li><Link href="/coffee-services/airpot-portion-packets">Airpot Portion Packets</Link></li>
            <li><Link href="/coffee-services/accessories">Accessories</Link></li>
          </ul>
        </section>
      </Layout>
    </>
  );
} 