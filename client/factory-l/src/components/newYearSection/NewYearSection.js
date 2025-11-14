import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import classes from "./NewYearSection.module.css";
import MarketplaceItem from "../marketplaceItem/MarketplaceItem";
import Skeleton from "../skeleton/Skeleton";
import axios from "axios";
import { API_URL } from "../../API_URL";
import translate from "../translate";

const NewYearSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Subscribe to language changes to trigger re-render
  const currentLang = useSelector((state) => state.lang.lang);

  const handleSeeAll = () => {
    navigate("/marketplace/decorations/christmas");
  };

  useEffect(() => {
    setLoading(true);
    // TODO: When you know which products to feature, you can filter by:
    // - category: { category: 'christmas' } or { category: 'holiday' }
    // - subCategory: { subCategory: 'christmas-decorations' }
    // For now, fetching all products. Update the params object below when ready.
    const filterParams = {
      // category: 'christmas',  // Uncomment and set when you have Christmas category
      subCategory: 'christmas',  // Uncomment and set when you have subCategory
    };

    axios
      .get(API_URL + "/api/products", { params: filterParams })
      .then((res) => {
        setItems(res.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching New Year products:", error);
        setItems([]);
        setLoading(false);
      });
  }, []);

  const marketplaceItems = items.map((item) => {
    const images = Array.isArray(item.images)
      ? item.images
      : item.images
      ? [item.images]
      : item.image
      ? [item.image]
      : [];

    return (
      <MarketplaceItem
        category={item.category}
        subCategory={item.subCategory}
        id={item._id}
        images={images}
        price={item.price}
        creator={item.creator}
        key={item._id}
        name={item.name}
        description={item.description}
        colors={item.colors}
      />
    );
  });

  return (
    <div className={classes.main}>
      <div className={classes.headerContainer}>
        <h2 className={classes.header}>{translate("newYear.title")}</h2>
        <p className={classes.subtitle}>{translate("newYear.subtitle")}</p>
      </div>
      <div className={classes.scrollContainer}>
        {loading ? (
          <div className={classes.skeletonRow}>
            <Skeleton name="marketplace-item" />
            <Skeleton name="marketplace-item" />
            <Skeleton name="marketplace-item" />
            <Skeleton name="marketplace-item" />
          </div>
        ) : marketplaceItems.length > 0 ? (
          <div className={classes.itemsRow}>{marketplaceItems}</div>
        ) : (
          <div className={classes.emptyState}>
            <p>{translate("newYear.empty")}</p>
          </div>
        )}
      </div>
      <button className={classes.seeAllButton} onClick={handleSeeAll}>
        {translate("newYear.seeAll")} →
      </button>
    </div>
  );
};

export default NewYearSection;

