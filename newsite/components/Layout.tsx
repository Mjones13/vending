import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
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

  // Custom navigation component that conditionally forces reload
  const NavLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => {
    const isHomepage = router.pathname === '/';
    
    if (isHomepage && href !== '/') {
      return (
        <a 
          href={href}
          className={className}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = href;
          }}
        >
          {children}
        </a>
      );
    }
    
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <nav className="nav">
          <div className="nav-container">
            <Link href="/" className="logo">
              <span className="gradient-text">SMARTER VENDING</span>
            </Link>
            
            <button 
              className="menu-toggle"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
              <li className="nav-item">
                <Link href="/" className={isActive('/') ? 'active' : ''}>
                  Home
                </Link>
              </li>
              <li className="nav-item dropdown">
                <NavLink href="/coffee-services" className={`dropdown-toggle ${isActive('/coffee-services') ? 'active' : ''}`}>
                  Coffee Services
                </NavLink>
                <ul className="dropdown-menu">
                  <li><NavLink href="/coffee-services">Overview</NavLink></li>
                  <li><NavLink href="/coffee-services/ground-whole-bean">Ground & Whole Bean</NavLink></li>
                  <li><NavLink href="/coffee-services/airpot-portion-packets">Airpot Portion Packets</NavLink></li>
                  <li><NavLink href="/coffee-services/accessories">Accessories</NavLink></li>
                </ul>
              </li>
              <li className="nav-item">
                <NavLink href="/shop" className={isActive('/shop') ? 'active' : ''}>
                  Shop
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink href="/mini-markets" className={isActive('/mini-markets') ? 'active' : ''}>
                  Mini Markets
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink href="/vending-machines" className={isActive('/vending-machines') ? 'active' : ''}>
                  Vending Machines
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink href="/blog" className={isActive('/blog') ? 'active' : ''}>
                  Blog
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink href="/about" className={isActive('/about') ? 'active' : ''}>
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink href="/careers" className={isActive('/careers') ? 'active' : ''}>
                  Careers
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink href="/contact" className={isActive('/contact') ? 'active' : ''}>
                  Contact
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink href="/request-a-demo" className="btn-demo">
                  Request Demo
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink href="/login" className="btn-login">
                  Login
                </NavLink>
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
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .header.scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 2px 30px rgba(0, 0, 0, 0.15);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          text-decoration: none;
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .menu-toggle {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .menu-toggle span {
          width: 25px;
          height: 3px;
          background: #333;
          margin: 3px 0;
          transition: 0.3s;
          border-radius: 2px;
        }

        .nav-menu {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 1.5rem;
          align-items: center;
        }

        .nav-item {
          position: relative;
        }

        .nav-item a {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-item a:hover {
          color: #0066cc;
          transform: translateY(-2px);
        }

        .nav-item a.active {
          color: #0066cc;
          background: rgba(0, 102, 204, 0.1);
        }

        .dropdown {
          position: relative;
        }

        .dropdown-toggle {
          cursor: pointer;
          color: #333;
          font-weight: 500;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
          text-decoration: none;
          border-radius: 5px;
          position: relative;
        }

        .dropdown-toggle:hover,
        .dropdown:hover .dropdown-toggle {
          color: #0066cc;
          transform: translateY(-2px);
        }

        .dropdown-toggle.active {
          color: #0066cc;
          background: rgba(0, 102, 204, 0.1);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          padding: 1rem;
          min-width: 200px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 100;
        }

        .dropdown:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-menu li {
          margin: 0;
        }

        .dropdown-menu a {
          display: block;
          padding: 0.5rem 1rem;
          color: #555;
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .dropdown-menu a:hover {
          background: rgba(0, 102, 204, 0.1);
          color: #0066cc;
        }

        .btn-demo {
          background: #0066cc !important;
          color: white !important;
          padding: 0.7rem 1.5rem !important;
          border-radius: 25px !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
        }

        .btn-demo:hover {
          background: #004499 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 5px 15px rgba(0, 102, 204, 0.3) !important;
        }

        .btn-login {
          background: #ff6600 !important;
          color: white !important;
          padding: 0.7rem 1.5rem !important;
          border-radius: 25px !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
        }

        .btn-login:hover {
          background: #e55a00 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 5px 15px rgba(255, 102, 0, 0.3) !important;
        }

        .footer {
          background: #1a1a1a;
          color: white;
          padding: 3rem 0 1rem;
          margin-top: 4rem;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section h3 {
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .footer-section h4 {
          margin-bottom: 1rem;
          color: #0066cc;
          font-size: 1rem;
        }

        .footer-section p {
          margin-bottom: 1rem;
          line-height: 1.6;
          color: #ccc;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section li {
          margin-bottom: 0.5rem;
        }

        .footer-section a {
          color: #ccc;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-section a:hover {
          color: #0066cc;
        }

        .phone-number {
          color: #ffff00;
          font-weight: bold;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid #333;
          color: #999;
        }

        main {
          margin-top: 80px;
          min-height: calc(100vh - 80px);
        }

        @media (max-width: 768px) {
          .menu-toggle {
            display: flex;
          }

          .nav-menu {
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 2rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
          }

          .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .nav-item {
            width: 100%;
            margin-bottom: 1rem;
          }

          .nav-item a {
            display: block;
            text-align: center;
            padding: 1rem;
            border-radius: 8px;
          }

          .dropdown-menu {
            position: static;
            opacity: 1;
            visibility: visible;
            transform: none;
            box-shadow: none;
            padding: 0.5rem 1rem;
            background: #f8f9fa;
            margin-top: 0.5rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .nav-container {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default Layout; 