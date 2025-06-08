import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return router.pathname === path;
    }
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''} ${isScrolled ? 'backdrop-blur' : ''}`}>
        <nav className="nav" role="navigation">
          <div className="nav-container">
            <Link href="/" className="logo" aria-label="Home">
              <Image 
                src="/images/logos/Golden Coast Amenities (3).svg"
                alt="Golden Coast Amenities"
                width={60}
                height={20}
                priority
                className="logo-image"
              />
            </Link>
            
            <button 
              className="menu-toggle"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`} data-testid="mobile-menu">
              <li className="nav-item">
                <Link href="/" className={isActive('/') ? 'nav-link active' : 'nav-link'}>
                  Home
                </Link>
              </li>
              <li className="nav-item dropdown">
                <Link href="/coffee-services" className={`nav-link dropdown-toggle ${isActive('/coffee-services') || isActive('/mini-markets') || isActive('/vending-machines') ? 'active' : ''}`}>
                  Services
                  <span className="dropdown-arrow">▼</span>
                </Link>
                <ul className="dropdown-menu">
                  <li><Link href="/coffee-services">Coffee Services</Link></li>
                  <li><Link href="/mini-markets">Mini Markets</Link></li>
                  <li><Link href="/vending-machines">Vending Machines</Link></li>
                  <li className="dropdown-divider"></li>
                  <li><Link href="/coffee-services/ground-whole-bean">Ground & Whole Bean</Link></li>
                  <li><Link href="/coffee-services/airpot-portion-packets">Airpot Portion Packets</Link></li>
                  <li><Link href="/coffee-services/accessories">Accessories</Link></li>
                </ul>
              </li>
              <li className="nav-item">
                <Link href="/shop" className={isActive('/shop') ? 'nav-link active' : 'nav-link'}>
                  Shop
                </Link>
              </li>
              <li className="nav-item dropdown">
                <Link href="/about" className={`nav-link dropdown-toggle ${isActive('/about') || isActive('/blog') || isActive('/careers') ? 'active' : ''}`}>
                  Company
                  <span className="dropdown-arrow">▼</span>
                </Link>
                <ul className="dropdown-menu">
                  <li><Link href="/about">About Us</Link></li>
                  <li><Link href="/blog">Blog</Link></li>
                  <li><Link href="/careers">Careers</Link></li>
                </ul>
              </li>
              <li className="nav-item">
                <Link href="/contact" className={isActive('/contact') ? 'nav-link active' : 'nav-link'}>
                  Contact
                </Link>
              </li>
              <li className="nav-item nav-cta">
                <Link href="/request-a-demo" className="btn-demo">
                  Request Demo
                </Link>
              </li>
              <li className="nav-item nav-secondary">
                <Link href="/login" className="btn-login">
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="gradient-text">SMARTER VENDING</h3>
              <p>Empowering employees, enriching lives through innovative vending solutions.</p>
              <div className="contact-info">
                <p><strong>Call us today: </strong><span className="phone-number">909.258.9848</span></p>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li><Link href="/coffee-services">Coffee Services</Link></li>
                <li><Link href="/mini-markets">Mini Markets</Link></li>
                <li><Link href="/vending-machines">Vending Machines</Link></li>
                <li><Link href="/shop">Shop</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Get Started</h4>
              <ul>
                <li><Link href="/request-a-demo">Request Demo</Link></li>
                <li><Link href="/login">Login</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2025 Smarter Vending Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          box-shadow: var(--shadow-lg);
          z-index: var(--z-50);
          transition: var(--transition-all);
          border-bottom: var(--border-width) solid var(--color-neutral-200);
        }

        .header.scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: var(--shadow-xl);
          border-bottom-color: var(--color-primary-200);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-4) var(--space-8);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }

        .logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          transition: var(--transition-transform);
          height: 20px;
          border-radius: var(--border-radius-md);
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo:focus {
          outline: 2px solid var(--color-primary-500);
          outline-offset: 2px;
        }

        .logo-image {
          height: auto;
          max-height: 16px;
          width: auto;
          object-fit: contain;
        }

        .menu-toggle {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-2);
          border-radius: var(--border-radius-md);
          transition: var(--transition-colors);
        }

        .menu-toggle:hover {
          background: var(--color-neutral-100);
        }

        .menu-toggle:focus {
          outline: 2px solid var(--color-primary-500);
          outline-offset: 2px;
        }

        .menu-toggle span {
          width: 24px;
          height: 2px;
          background: var(--color-neutral-700);
          margin: 2px 0;
          transition: var(--transition-all);
          border-radius: var(--border-radius-full);
        }

        .nav-menu {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          align-items: center;
          justify-content: center;
          flex: 1;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .nav-item {
          position: relative;
          margin: 0 var(--space-1);
        }

        .nav-item:not(.nav-cta):not(.nav-secondary) {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .nav-cta {
          margin-left: var(--space-6);
        }

        .nav-secondary {
          margin-left: var(--space-3);
        }

        .nav-link {
          text-decoration: none;
          color: var(--color-neutral-700);
          font-weight: var(--font-weight-semibold);
          font-size: var(--font-size-base);
          padding: var(--space-3) var(--space-5);
          border-radius: var(--border-radius-lg);
          transition: var(--transition-all);
          position: relative;
          display: block;
          white-space: nowrap;
          letter-spacing: -0.01em;
        }

        .nav-link:hover {
          color: var(--color-primary-600);
          background: var(--color-primary-50);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .nav-link:focus {
          outline: 2px solid var(--color-primary-500);
          outline-offset: 2px;
        }

        .nav-link.active {
          color: var(--color-primary-600);
          background: var(--color-primary-100);
          font-weight: var(--font-weight-bold);
          box-shadow: var(--shadow-sm);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: var(--color-primary-600);
          border-radius: var(--border-radius-full);
        }

        .dropdown {
          position: relative;
        }

        .dropdown-toggle {
          cursor: pointer;
          color: var(--color-neutral-700);
          font-weight: var(--font-weight-semibold);
          font-size: var(--font-size-base);
          padding: var(--space-3) var(--space-5);
          transition: var(--transition-all);
          text-decoration: none;
          border-radius: var(--border-radius-lg);
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          white-space: nowrap;
          letter-spacing: -0.01em;
        }

        .dropdown-arrow {
          font-size: 10px;
          transition: var(--transition-transform);
          opacity: 0.7;
        }

        .dropdown-toggle:hover,
        .dropdown:hover .dropdown-toggle {
          color: var(--color-primary-600);
          background: var(--color-primary-50);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .dropdown:hover .dropdown-arrow {
          transform: rotate(180deg);
          opacity: 1;
        }

        .dropdown-toggle:focus {
          outline: 2px solid var(--color-primary-500);
          outline-offset: 2px;
        }

        .dropdown-toggle.active {
          color: var(--color-primary-600);
          background: var(--color-primary-100);
          font-weight: var(--font-weight-bold);
          box-shadow: var(--shadow-sm);
        }

        .dropdown-toggle.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: var(--color-primary-600);
          border-radius: var(--border-radius-full);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + var(--space-3));
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          background: var(--color-white);
          box-shadow: var(--shadow-2xl);
          border: var(--border-width) solid var(--color-neutral-200);
          border-radius: var(--border-radius-2xl);
          padding: var(--space-4);
          min-width: 240px;
          opacity: 0;
          visibility: hidden;
          transition: var(--transition-all);
          z-index: var(--z-50);
          backdrop-filter: blur(8px);
        }

        .dropdown:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }

        .dropdown-menu li {
          margin: 0;
        }

        .dropdown-menu a {
          display: block;
          padding: var(--space-3) var(--space-4);
          color: var(--color-neutral-700);
          text-decoration: none;
          border-radius: var(--border-radius-lg);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          transition: var(--transition-all);
          margin-bottom: var(--space-1);
          position: relative;
        }

        .dropdown-menu a:hover {
          background: var(--color-primary-50);
          color: var(--color-primary-600);
          transform: translateX(4px);
          font-weight: var(--font-weight-semibold);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--color-neutral-200);
          margin: var(--space-3) 0;
          border: none;
        }

        .dropdown-menu a:focus {
          outline: 2px solid var(--color-primary-500);
          outline-offset: 2px;
        }

        .btn-demo {
          background: var(--gradient-primary) !important;
          color: var(--color-white) !important;
          padding: var(--space-3) var(--space-7) !important;
          border-radius: var(--border-radius-full) !important;
          font-weight: var(--font-weight-bold) !important;
          font-size: var(--font-size-sm) !important;
          transition: var(--transition-all) !important;
          box-shadow: var(--shadow-lg) !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          white-space: nowrap !important;
        }

        .btn-demo:hover {
          background: linear-gradient(135deg, var(--color-primary-700), var(--color-primary-800)) !important;
          transform: translateY(-2px) !important;
          box-shadow: var(--shadow-lg) !important;
        }

        .btn-demo:focus {
          outline: 2px solid var(--color-primary-300) !important;
          outline-offset: 2px !important;
        }

        .btn-login {
          background: transparent !important;
          color: var(--color-neutral-600) !important;
          border: 2px solid var(--color-neutral-300) !important;
          padding: var(--space-2) var(--space-5) !important;
          border-radius: var(--border-radius-full) !important;
          font-weight: var(--font-weight-semibold) !important;
          font-size: var(--font-size-sm) !important;
          transition: var(--transition-all) !important;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          white-space: nowrap !important;
        }

        .btn-login:hover {
          background: var(--color-neutral-600) !important;
          color: var(--color-white) !important;
          border-color: var(--color-neutral-600) !important;
          transform: translateY(-1px) !important;
          box-shadow: var(--shadow-md) !important;
        }

        .btn-login:focus {
          outline: 2px solid var(--color-neutral-400) !important;
          outline-offset: 2px !important;
        }

        .footer {
          background: linear-gradient(135deg, var(--color-neutral-900), var(--color-neutral-800));
          color: var(--color-white);
          padding: var(--space-20) 0 var(--space-8);
          margin-top: var(--space-20);
          border-top: var(--border-width) solid var(--color-neutral-700);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--space-8);
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-8);
          margin-bottom: var(--space-8);
        }

        .footer-section h3 {
          margin-bottom: var(--space-4);
          font-size: var(--font-size-xl);
          color: var(--color-white);
        }

        .footer-section h4 {
          margin-bottom: var(--space-4);
          color: var(--color-primary-400);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
        }

        .footer-section p {
          margin-bottom: var(--space-4);
          line-height: var(--line-height-relaxed);
          color: var(--color-neutral-300);
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section li {
          margin-bottom: var(--space-2);
        }

        .footer-section a {
          color: var(--color-neutral-300);
          text-decoration: none;
          transition: var(--transition-colors);
          font-size: var(--font-size-sm);
          padding: var(--space-1) 0;
          display: block;
          border-radius: var(--border-radius-md);
        }

        .footer-section a:hover {
          color: var(--color-primary-400);
          transform: translateX(4px);
        }

        .footer-section a:focus {
          outline: 2px solid var(--color-primary-400);
          outline-offset: 2px;
        }

        .phone-number {
          color: var(--color-highlight);
          font-weight: var(--font-weight-bold);
        }

        .footer-bottom {
          text-align: center;
          padding-top: var(--space-8);
          border-top: var(--border-width) solid var(--color-neutral-700);
          color: var(--color-neutral-400);
          font-size: var(--font-size-sm);
        }

        main {
          margin-top: 88px;
          min-height: calc(100vh - 88px);
        }

        @media (max-width: 768px) {
          .menu-toggle {
            display: flex;
          }

          .nav-container {
            padding: var(--space-4);
          }

          .logo {
            height: 18px;
          }

          .logo-image {
            max-height: 14px;
          }

          .nav-menu {
            position: fixed;
            top: 88px;
            left: 0;
            right: 0;
            background: var(--color-white);
            flex-direction: column;
            padding: var(--space-8);
            box-shadow: var(--shadow-xl);
            border-top: var(--border-width) solid var(--color-neutral-200);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: var(--transition-all);
            gap: var(--space-4);
            max-width: none;
            margin: 0;
            justify-content: flex-start;
          }

          .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .nav-item {
            width: 100%;
          }

          .nav-item:not(.nav-cta):not(.nav-secondary) {
            flex: none;
            justify-content: center;
          }

          .nav-cta,
          .nav-secondary {
            margin-left: 0;
            margin-top: var(--space-4);
          }

          .nav-link,
          .dropdown-toggle {
            text-align: center;
            padding: var(--space-4);
            border-radius: var(--border-radius-xl);
            font-size: var(--font-size-base);
            justify-content: center;
          }

          .dropdown-arrow {
            display: none;
          }

          .dropdown-menu {
            position: static;
            opacity: 1;
            visibility: visible;
            transform: none;
            box-shadow: none;
            border: none;
            padding: var(--space-3) var(--space-4);
            background: var(--color-neutral-50);
            margin-top: var(--space-2);
            border-radius: var(--border-radius-lg);
            min-width: auto;
            backdrop-filter: none;
          }

          .dropdown-divider {
            margin: var(--space-2) 0;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: var(--space-6);
          }

          .footer-container {
            padding: 0 var(--space-4);
          }

          main {
            margin-top: 88px;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: var(--space-3);
          }

          .nav-menu {
            padding: var(--space-6);
          }

          .btn-demo,
          .btn-login {
            width: 100% !important;
            text-align: center !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </>
  );
};

export default Layout; 