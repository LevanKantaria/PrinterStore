import React from 'react'
import MarketplaceCategories from '../components/marketplaceCategories/MarketplaceCategories'
import SEO from '../components/seo/SEO'
import { useSelector } from 'react-redux'
import translate from '../components/translate'

const Marketplace = () => {
  const currentLang = useSelector((state) => state.lang.lang);
  const lang = currentLang === 'EN' ? 'EN' : 'KA';
  
  return (
    <div>
      <SEO 
        title={translate('landing.marketplace')}
        description={lang === 'EN'
          ? 'Browse our 3D printing marketplace. Find custom 3D printed products, choose from various materials, and order your unique items.'
          : 'გაეცანით ჩვენს 3D ბეჭდვის მარკეტპლეისს. იპოვეთ ინდივიდუალური 3D დაბეჭდილი პროდუქტები, აირჩიეთ სხვადასხვა მასალები და შეუკვეთეთ თქვენი უნიკალური ნივთები.'
        }
        keywords={lang === 'EN'
          ? '3D printing marketplace, custom products, 3D printed items, online store, Georgia'
          : '3D ბეჭდვის მარკეტპლეისი, ინდივიდუალური პროდუქტები, 3D დაბეჭდილი ნივთები, ონლაინ მაღაზია, საქართველო'
        }
      />
      <MarketplaceCategories />
    </div>
  )
}

export default Marketplace