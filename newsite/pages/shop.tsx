import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function Shop() {
  const router = useRouter();
  const [heroRef, heroVisible] = useScrollAnimation(0.3);
  const [categoriesRef, categoriesVisible] = useScrollAnimation(0.2);

  const handleLoginToOrder = () => {
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Shop | SMARTER VENDING</title>
        <meta name="description" content="Shop for ground & whole bean coffee, airpot portion packets, and accessories from Smarter Vending." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <section 
          ref={heroRef}
          className={`shop-hero ${heroVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="hero-content">
            <h1 className="hero-title gradient-text">Shop</h1>
            <p className="hero-description">
              Tailor your coffee experience with customizable options. Simply place your orders, and leave the rest to us – we deliver and do the restocking for you.
            </p>
            <button 
              className="btn-animated login-btn"
              onClick={handleLoginToOrder}
            >
              Login to Order Online
            </button>
          </div>
        </section>

        <section 
          ref={categoriesRef}
          className={`shop-categories ${categoriesVisible ? 'animate-on-scroll animated' : 'animate-on-scroll'}`}
        >
          <div className="categories-container">
            <h2 className="section-title">Shop Categories</h2>
            <div className="categories-grid">
              <Link href="/coffee-services/ground-whole-bean" className="category-card card-hover">
                <div className="category-icon">☕</div>
                <h3>Ground & Whole Bean</h3>
                <p>Premium coffee selections for your office brewing needs</p>
                <span className="category-link">Shop Now →</span>
              </Link>
              
              <Link href="/coffee-services/airpot-portion-packets" className="category-card card-hover">
                <div className="category-icon">📦</div>
                <h3>Airpot Portion Packets</h3>
                <p>Pre-portioned coffee packets for convenient brewing</p>
                <span className="category-link">Shop Now →</span>
              </Link>
              
              <Link href="/coffee-services/accessories" className="category-card card-hover">
                <div className="category-icon">🔧</div>
                <h3>Accessories</h3>
                <p>Coffee accessories and brewing equipment</p>
                <span className="category-link">Shop Now →</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="shop-featured">
          <div className="featured-container">
            <h2 className="section-title">Featured Products</h2>
            <div className="featured-grid">
              <div className="product-card card-hover">
                <div className="product-icon">☕</div>
                <h4>Premium Colombian Blend</h4>
                <p>Rich, smooth coffee with notes of chocolate and caramel</p>
                <span className="product-price">Available to order</span>
              </div>
              
              <div className="product-card card-hover">
                <div className="product-icon">🍵</div>
                <h4>Organic Green Tea</h4>
                <p>Refreshing green tea with antioxidant benefits</p>
                <span className="product-price">Available to order</span>
              </div>
              
              <div className="product-card card-hover">
                <div className="product-icon">🥤</div>
                <h4>Hot Chocolate Mix</h4>
                <p>Creamy, indulgent hot chocolate for cold days</p>
                <span className="product-price">Available to order</span>
              </div>
            </div>
            
            <div className="featured-cta">
              <button 
                className="btn-animated cta-button"
                onClick={handleLoginToOrder}
              >
                Login to Browse Full Catalog
              </button>
            </div>
          </div>
        </section>
      </Layout>

      <style jsx>{`
        .shop-hero {
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

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: bold;
          margin: 0 0 2rem 0;
          line-height: 1.2;
        }

        .hero-description {
          font-size: 1.2rem;
          line-height: 1.6;
          opacity: 0.95;
          margin-bottom: 3rem;
        }

        .login-btn {
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

        .login-btn:hover {
          background: #e55a00;
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(255, 102, 0, 0.4);
        }

        .shop-categories {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .categories-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          margin-bottom: 3rem;
          color: #333;
          font-weight: 700;
          text-align: center;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .category-card {
          padding: 3rem 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          color: inherit;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .category-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .category-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          opacity: 0.8;
        }

        .category-card h3 {
          color: #0066cc;
          margin-bottom: 1rem;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .category-card p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .category-link {
          color: #ff6600;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .shop-featured {
          padding: 5rem 2rem;
          background: white;
        }

        .featured-container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .product-card {
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 15px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .product-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .product-card h4 {
          color: #333;
          margin-bottom: 1rem;
          font-size: 1.3rem;
          font-weight: 700;
        }

        .product-card p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .product-price {
          color: #0066cc;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .featured-cta {
          margin-top: 3rem;
        }

        .cta-button {
          background: #0066cc;
          color: white;
          border: none;
          padding: 1.2rem 2.5rem;
          font-size: 1.3rem;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 8px 20px rgba(0, 102, 204, 0.3);
          transition: all 0.3s ease;
        }

        .cta-button:hover {
          background: #004499;
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(0, 102, 204, 0.4);
        }

        @media (max-width: 768px) {
          .shop-hero {
            padding: 4rem 1rem 3rem;
            min-height: 50vh;
          }

          .categories-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .featured-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .category-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </>
  );
} 