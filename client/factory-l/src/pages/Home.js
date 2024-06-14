import React from "react";
import Welcome from "../components/welcome/Welcome";
import Welcome2 from "../components/welcome/Welcome2";
import Why3D from "../components/why3D/Why3D";
import Statistics from "../components/statistics/Statistics";
import OurServices from "../components/ourServicesList/OurServices";
import MaterialList from "../components/materialList/MaterialList";
import FeaturedItem from "../components/featuredItem/FeaturedItem";


const Home = () => {
  return (
    <>
      <Welcome2 />
      <FeaturedItem />
      {/* <Why3D /> */}
      {/* <Statistics /> */}
      {/* <OurServices /> */}
      {/* <MaterialList /> */}
    </>
  );
};

export default Home;
