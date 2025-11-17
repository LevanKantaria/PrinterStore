import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://makershub.ge';

/**
 * Product structured data (JSON-LD) for Google Shopping
 */
export const ProductStructuredData = ({ product }) => {
  if (!product || !product._id) return null;

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images || [],
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: product.makerName || product.creator || 'Makers Hub',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product._id}`,
      priceCurrency: 'GEL',
      price: parseFloat(product.price) || 0,
      availability: product.status === 'live' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Makers Hub',
      },
    },
    category: product.category,
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 0,
    } : undefined,
  };

  // Remove undefined fields
  Object.keys(structuredData).forEach(key => {
    if (structuredData[key] === undefined) {
      delete structuredData[key];
    }
  });

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

/**
 * Organization structured data
 */
export const OrganizationStructuredData = () => {
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Organization',
    name: 'Makers Hub',
    url: SITE_URL,
    logo: `${SITE_URL}/logo512.png`,
    description: '3D printing services and marketplace in Georgia',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GE',
    },
    sameAs: [
      // Add your social media links here when available
      // 'https://www.facebook.com/makershub',
      // 'https://www.instagram.com/makershub',
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

/**
 * Breadcrumb structured data
 */
export const BreadcrumbStructuredData = ({ items }) => {
  if (!items || items.length === 0) return null;

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

