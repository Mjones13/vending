import React, { ReactNode } from "react";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <header>
        <nav>
          <div className="logo">SMARTER VENDING</div>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li>
              <span>Coffee Services</span>
              <ul style={{ position: "absolute", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: 8, padding: 8, marginTop: 4, zIndex: 10 }}>
                <li><Link href="/coffee-services">Overview</Link></li>
                <li><Link href="/coffee-services/ground-whole-bean">Ground & Whole Bean</Link></li>
                <li><Link href="/coffee-services/airpot-portion-packets">Airpot Portion Packets</Link></li>
                <li><Link href="/coffee-services/accessories">Accessories</Link></li>
              </ul>
            </li>
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/mini-markets">Mini Markets</Link></li>
            <li><Link href="/vending-machines">Vending Machines</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/request-a-demo">Request Demo</Link></li>
            <li><Link href="/login">Login</Link></li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <div>
          <p>© 2025 Smarter Vending Inc. All rights reserved.</p>
          <nav>
            <Link href="/">Home</Link> | <Link href="/coffee-services">Coffee Services</Link> | <Link href="/shop">Shop</Link> | <Link href="/mini-markets">Mini Markets</Link> | <Link href="/vending-machines">Vending Machines</Link> | <Link href="/blog">Blog</Link> | <Link href="/about">About</Link> | <Link href="/careers">Careers</Link> | <Link href="/contact">Contact</Link> | <Link href="/request-a-demo">Request Demo</Link> | <Link href="/login">Login</Link>
          </nav>
        </div>
      </footer>
    </>
  );
};

export default Layout; 