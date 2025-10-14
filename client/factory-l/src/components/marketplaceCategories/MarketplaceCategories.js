import React from "react";
import classes from "./MarketplaceCategories.module.css";
import CategoryItem from "./helpers/CategoryItem";
import { Link } from "react-router-dom";
import translate from "../translate";

const MarketplaceCategories = () => {
  const categories = [
    {
      item1: "categories.plants",
      item2: "categories.decorations",
      item3: "categories.kitchen",
      link1: "household/plants",
      link2: "household/decorations",
      link3: "household/kitchen",
      title: "categories.household",
      link: "household",
      image:
        "https://makerworld.bblmw.com/makerworld/model/USd7042754b003df/design/2023-09-26_h3xo6mywhubc.jpg?image_process:resize,w_1920/format,webp",
    },
    {
      item1: "categories.keychains",
      item2: "categories.accessories",
      item3: "categories.goodtohaves",
      link1: "cars/keychains",
      link2: "cars/accessories",
      link3: "cars/good-to-haves",
      title: "categories.cars",
      link: "cars",
      image:
        "https://makerworld.bblmw.com/makerworld/model/US3c7248c060c601/design/2024-05-13_709ae3a00dcb7.jpg?image_process=resize,w_1920/format,webp",
    },
    {
      item1: "categories.organizers",
      item2: "categories.decoration",
      item3: "categories.fidgets",
      link1: "office/organizers",
      link2: "office/decoration",
      link3: "office/fidgets",
      title: "categories.office",
      link: "office",
      image:
        "https://makerworld.bblmw.com/makerworld/model/USbb911d7e3d1771/design/2023-12-22_f931be163f122.jpg?image_process=resize,w_1000/format,webp",
    },
    // {
    //   item1: "Cars",
    //   item2: "Cameras",
    //   item3: "Drones",
    //   link1: "tech/cars",
    //   link2: "tech/cameras",
    //   link3: "tech/drones",
    //   title: "Tech",
    //   link: "tech",
    //   image:
    //     "https://static1.sw-cdn.net/cdn-cgi/image/quality=85,gravity=auto,format=auto,fit=scale-down,width=1920/files/cms/homepage/tech-categoryheader-rc-cars3.jpg",
    // },
    // {
    //   item1: "Dice",
    //   item2: "Toys",
    //   item3: "Board Games",
    //   link1: "games/dice",
    //   link2: "games/toys",
    //   link3: "games/board-games",
    //   title: "Games",
    //   link: "games",
    //   image:
    //     "https://images1.sw-cdn.net/cdn-cgi/image/quality=85,gravity=auto,format=auto,fit=scale-down,width=1920/product/picture/625x465_11550233_2738927_1459344027.jpg",
    // },
    // {
    //   item1: "Figurines",
    //   item2: "Vehicles",
    //   item3: "Ships",
    //   link1: "miniatures/figurines",
    //   link2: "miniatures/vehicles",
    //   link3: "miniatures/ships",
    //   title: "Miniatures",
    //   link: "miniatures",
    //   image:
    //     "https://images1.sw-cdn.net/cdn-cgi/image/quality=85,gravity=auto,format=auto,fit=scale-down,width=1920/product/picture/625x465_13553413_8232332_1462019511.jpg",
    // },
  ];

  return (
    <div className={classes.main}>
      <section className={classes.categoriesList}>
        <ul>
          {categories.map((category) => 
            <Link           key={Math.random()}
            to={category.link}><li>{translate(category.title)}</li></Link>
          )}
        </ul>
      </section>
      <section className={classes.content}>
        <div className={classes.title}>
          <h2>{translate('marketplace.categories')}</h2>
        </div>
        <div className={classes.categoriesWithImages}>
          {categories.map((category) => <CategoryItem 
          key={Math.random()}
           item1={category.item1}
           item2={category.item2}
           item3={category.item3}
           link1={category.link1}
           link2={category.link2}
           link3={category.link3}
           title={category.title}
           link={category.link}
           image={category.image}/>
           )}
         
        </div>
      </section>
    </div>
  );
};

export default MarketplaceCategories;
