import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Default site information
const SITE_NAME = 'Makers Hub';
const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://makershub.ge';
const DEFAULT_DESCRIPTION = {
  KA: '3D ბეჭდვის სერვისები და მარკეტპლეისი საქართველოში. მაღალი ხარისხის 3D დაბეჭდილი პროდუქტები, მასალების არჩევანი და პროფესიონალური მომსახურება.',
  EN: '3D printing services and marketplace in Georgia. High-quality 3D printed products, material selection, and professional service.'
};

const SEO = ({ 
  title, 
  description, 
  keywords,
  image,
  type = 'website',
  noindex = false,
  canonical
}) => {
  const location = useLocation();
  const currentLang = useSelector((state) => state.lang.lang);
  const lang = currentLang === 'EN' ? 'EN' : 'KA';

  // Build full title
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  
  // Use provided description or default based on language
  const metaDescription = description || DEFAULT_DESCRIPTION[lang];
  
  // Build canonical URL
  const canonicalUrl = canonical 
    ? (canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}`)
    : `${SITE_URL}${location.pathname}`;
  
  // Default image (you can add your logo/og-image here)
  const ogImage = image || `${SITE_URL}/assets/og-image.jpg`;
  
  // Default keywords
  const metaKeywords = keywords || (lang === 'KA' 
    ? '3D ბეჭდვა, 3D პრინტერი, მარკეტპლეისი, საქართველო, პროდუქტები, მასალები'
    : '3D printing, 3D printer, marketplace, Georgia, products, materials');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={lang === 'EN' ? 'en' : 'ka'} />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Language Alternates */}
      <link rel="alternate" hreflang="ka" href={`${SITE_URL}${location.pathname}`} />
      <link rel="alternate" hreflang="en" href={`${SITE_URL}${location.pathname}`} />
      <link rel="alternate" hreflang="x-default" href={`${SITE_URL}${location.pathname}`} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={lang === 'EN' ? 'en_US' : 'ka_GE'} />
      <meta property="og:locale:alternate" content={lang === 'EN' ? 'ka_GE' : 'en_US'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#214c33" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
    </Helmet>
  );
};

export default SEO;

