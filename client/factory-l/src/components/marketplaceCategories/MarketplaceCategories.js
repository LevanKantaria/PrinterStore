import React from "react";
import { useSelector } from "react-redux";
import classes from "./MarketplaceCategories.module.css";
import CategoryItem from "./helpers/CategoryItem";
import { Link } from "react-router-dom";
import translate from "../translate";
import categories from "../../data/marketplaceCategories";

const MarketplaceCategories = () => {
  // Subscribe to language changes to trigger re-render
  const currentLang = useSelector((state) => state.lang.lang);
  return (
    <div className={classes.main}>
      <section className={classes.categoriesList}>
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              <Link to={category.id}>{translate(category.titleKey)}</Link>
            </li>
          ))}
        </ul>
      </section>
      <section className={classes.content}>
        <div className={classes.title}>
          <h2>{translate("marketplace.categories")}</h2>
        </div>
        <div className={classes.categoriesWithImages}>
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              title={category.titleKey}
              link={category.id}
              image={category.image}
              items={category.subcategories.map((subcategory) => ({
                label: subcategory.labelKey,
                link: `${category.id}/${subcategory.id}`,
              }))}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default MarketplaceCategories;
