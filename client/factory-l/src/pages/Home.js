import React from "react";
import Welcome from "../components/welcome/Welcome";
import Why3D from "../components/why3D/Why3D";
import Statistics from "../components/statistics/Statistics";
import OurServices from "../components/ourServicesList/OurServices";
import MaterialList from "../components/materialList/MaterialList";
import FeaturedItem from "../components/featuredItem/FeaturedItem";
import NewYearSection from "../components/newYearSection/NewYearSection";
import SEO from "../components/seo/SEO";
import { useSelector } from "react-redux";
import translate from "../components/translate";


const Home = () => {
  const currentLang = useSelector((state) => state.lang.lang);
  const lang = currentLang === 'EN' ? 'EN' : 'KA';
  
  return (
    <>
      <SEO 
        title={translate('landing.title')}
        description={lang === 'EN' 
          ? 'Professional 3D printing services and marketplace in Georgia. Custom 3D printed products, wide material selection, and expert consultation.'
          : 'პროფესიონალური 3D ბეჭდვის სერვისები და მარკეტპლეისი საქართველოში. ინდივიდუალური 3D დაბეჭდილი პროდუქტები, მასალების ფართო არჩევანი და ექსპერტული კონსულტაცია.'
        }
        keywords={lang === 'EN'
          ? '3D printing, 3D printer, custom 3D printing, marketplace, Georgia, Tbilisi, PLA, ABS, PETG, 3D models'
          : '3D ბეჭდვა, 3D პრინტერი, ინდივიდუალური 3D ბეჭდვა, მარკეტპლეისი, საქართველო, თბილისი, PLA, ABS, PETG, 3D მოდელები'
        }
      />
      <Welcome />
      <NewYearSection />
      <FeaturedItem />
      {/* <Why3D /> */}
      {/* <Statistics /> */}
      {/* <OurServices /> */}
      {/* <MaterialList /> */}
    </>
  );
};

export default Home;
