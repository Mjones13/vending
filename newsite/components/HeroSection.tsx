import React from 'react';
import Image from 'next/image';

interface HeroSectionProps {
  backgroundImage: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaButton?: {
    text: string;
    onClick: () => void;
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
              <button 
                className={`hero-cta-button ${ctaButton.className || ''}`}
                onClick={ctaButton.onClick}
              >
                {ctaButton.text}
              </button>
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
          background: var(--gradient-hero);
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
          max-width: 1000px;
          padding: var(--space-12);
          margin: 0 auto;
          animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(var(--font-size-4xl), 7vw, var(--font-size-7xl));
          font-weight: var(--font-weight-extrabold);
          margin: 0 0 var(--space-6) 0;
          line-height: var(--line-height-tight);
          text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, var(--color-white), #e6f3ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: clamp(var(--font-size-xl), 3.5vw, var(--font-size-3xl));
          margin: 0 0 var(--space-8) 0;
          opacity: 0.95;
          font-weight: var(--font-weight-medium);
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
          color: rgba(255, 255, 255, 0.95);
        }

        .hero-description {
          font-size: clamp(var(--font-size-base), 2vw, var(--font-size-lg));
          line-height: var(--line-height-relaxed);
          opacity: 0.9;
          margin-bottom: var(--space-10);
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          color: rgba(255, 255, 255, 0.9);
        }

        .hero-cta-button {
          background: var(--gradient-accent);
          color: var(--color-white);
          border: none;
          padding: var(--space-5) var(--space-10);
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          border-radius: var(--border-radius-full);
          cursor: pointer;
          transition: var(--transition-all);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: var(--shadow-xl);
          margin-bottom: var(--space-6);
          position: relative;
          overflow: hidden;
          text-decoration: none;
          display: inline-block;
        }

        .hero-cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .hero-cta-button:hover::before {
          left: 100%;
        }

        .hero-cta-button:hover {
          background: linear-gradient(135deg, var(--color-accent-600), var(--color-accent-700));
          transform: translateY(-3px);
          box-shadow: var(--shadow-2xl);
        }

        .hero-cta-button:focus {
          outline: 2px solid var(--color-accent-300);
          outline-offset: 2px;
        }

        .hero-cta-button:active {
          transform: translateY(-1px);
        }

        .hero-phone {
          font-size: var(--font-size-lg);
          margin: var(--space-6) 0 0 0;
          font-weight: var(--font-weight-semibold);
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          color: rgba(255, 255, 255, 0.9);
        }

        .phone-highlight {
          color: var(--color-highlight);
          font-weight: var(--font-weight-bold);
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          background: rgba(255, 255, 0, 0.1);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--border-radius-md);
        }

        @media (max-width: 768px) {
          .hero-content {
            padding: var(--space-8);
          }

          .hero-title {
            margin-bottom: var(--space-4);
          }

          .hero-subtitle {
            margin-bottom: var(--space-6);
          }

          .hero-description {
            margin-bottom: var(--space-8);
          }

          .hero-cta-button {
            padding: var(--space-4) var(--space-8);
            font-size: var(--font-size-base);
          }

          .hero-phone {
            font-size: var(--font-size-base);
          }
        }

        @media (max-width: 480px) {
          .hero-content {
            padding: var(--space-6);
          }

          .hero-cta-button {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
};

export default HeroSection; 