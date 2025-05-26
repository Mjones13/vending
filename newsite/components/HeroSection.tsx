import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroSectionProps {
  backgroundImage: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaButton?: {
    text: string;
    href: string;
    className?: string;
  };
  phoneNumber?: {
    text: string;
    number: string;
  };
  textColor?: 'white' | 'dark';
  overlayOpacity?: number;
  minHeight?: string;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  backgroundImage,
  title,
  subtitle,
  description,
  ctaButton,
  phoneNumber,
  textColor = 'white',
  overlayOpacity = 0.4,
  minHeight = '70vh',
  className = ''
}) => {
  return (
    <>
      <section className={`hero-section ${className}`}>
        {/* Background Image */}
        <div className="hero-background">
          <Image
            src={backgroundImage}
            alt="Hero background"
            fill
            style={{ objectFit: 'cover' }}
            priority
            quality={90}
            sizes="100vw"
          />
        </div>

        {/* Overlay for better text readability */}
        <div 
          className="hero-overlay" 
          style={{ 
            background: `linear-gradient(135deg, rgba(0, 0, 0, ${overlayOpacity}) 0%, rgba(0, 0, 0, ${overlayOpacity * 0.5}) 100%)` 
          }}
        />

        {/* Content */}
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">{title}</h1>
            {subtitle && <h2 className="hero-subtitle">{subtitle}</h2>}
            {description && <p className="hero-description">{description}</p>}
            {ctaButton && (
              <Link 
                href={ctaButton.href}
                className={`hero-cta-button ${ctaButton.className || ''}`}
              >
                {ctaButton.text}
              </Link>
            )}
            {phoneNumber && (
              <p className="hero-phone">
                {phoneNumber.text} <span className="phone-highlight">{phoneNumber.number}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero-section {
          position: relative;
          min-height: ${minHeight};
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
        }

        .hero-content {
          position: relative;
          z-index: 3;
          color: ${textColor};
          text-align: center;
          max-width: 900px;
          padding: 2rem;
          margin: 0 auto;
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: bold;
          margin: 0 0 1rem 0;
          line-height: 1.2;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, #0066cc, #ff6600);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(1.2rem, 3vw, 2.2rem);
          margin: 0 0 1.5rem 0;
          opacity: 0.95;
          font-weight: 600;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .hero-description {
          font-size: clamp(1rem, 2vw, 1.3rem);
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 2rem;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .hero-cta-button {
          display: inline-block;
          text-decoration: none;
          background: #ff6600;
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          font-size: 1.2rem;
          border-radius: 30px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(255, 102, 0, 0.3);
          margin-bottom: 1rem;
        }

        .hero-cta-button:hover {
          background: #e55a00;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 102, 0, 0.4);
        }

        .hero-cta-button:active {
          transform: translateY(-1px);
        }

        .hero-phone {
          font-size: 1.1rem;
          margin: 1rem 0 0 0;
          font-weight: 600;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .phone-highlight {
          color: #ffff00;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        @media (max-width: 768px) {
          .hero-content {
            padding: 1.5rem;
          }

          .hero-title {
            margin-bottom: 1rem;
          }

          .hero-subtitle {
            margin-bottom: 1rem;
          }

          .hero-description {
            margin-bottom: 1.5rem;
          }

          .hero-cta-button {
            padding: 0.8rem 2rem;
            font-size: 1rem;
          }

          .hero-phone {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .hero-content {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default HeroSection; 