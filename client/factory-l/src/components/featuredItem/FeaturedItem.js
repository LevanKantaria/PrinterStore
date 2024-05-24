import React from 'react'
import classes from './FeaturedItem.module.css'
import { useEffect, useState } from "react";
import MarketplaceItem from "../marketplaceItem/MarketplaceItem";
import axios from "axios";
import { API_URL } from "../../API_URL";


const FeaturedItem = () => {

    let category = 'household';
    let subCategory = '';
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    let marketplaceItems = [];
    let categoryLink = `/marketplace/${category}`;
    let subCategoryLink = `/marketplace/${subCategory}`;
  
  
    
    useEffect(() => {
      if (!subCategory) {
        setLoading(true);
        axios
          .get(API_URL+"api/products", {
            params: {
              category: category,
            },
          })
          .then((res) => {
            setItems((res.data).splice(0,2));
            setLoading(false);
          });
      } else if (subCategory) {
        setLoading(true);
        axios
          .get(API_URL+"api/products", {
            params: {
              subCategory: subCategory,
            },
          })
          .then((res) => {
            setItems(res.data);
            setLoading(false);
          });
      }
    }, [subCategory]);

    marketplaceItems = items.map((item) => {
   
        return (
          <MarketplaceItem
            category={item.category}
            subCategory={item.subCategory}
            id={item._id}
            images={item.images}
            price={item.price}
            creator={item.creator}
            key={Math.random()}
            name={item.name}
            description={item.description}
          />
        );
      });
    
    
  return (
    <div className={classes.main}>
        <h2 className={classes.header}>Trending </h2>
        <div className={classes.trendingContainer}>
        <div className={classes.grid}>{marketplaceItems}</div>
        </div>
    </div>
  )
}

export default FeaturedItem