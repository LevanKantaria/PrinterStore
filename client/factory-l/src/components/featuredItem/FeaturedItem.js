import React from 'react'
import { useSelector } from 'react-redux';
import classes from './FeaturedItem.module.css'
import { useEffect, useState } from "react";
import MarketplaceItem from "../marketplaceItem/MarketplaceItem";
import Skeleton from "../skeleton/Skeleton";
import axios from "axios";
import translate from './../translate';
import { API_URL } from '../../API_URL';
const FeaturedItem = () => {
    // Subscribe to language changes to trigger re-render
    const currentLang = useSelector((state) => state.lang.lang);
    let category = 'household';
    let subCategory = '';
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    let marketplaceItems = [];
    let categoryLink = `/marketplace/${category}`;
    let subCategoryLink = `/marketplace/${subCategory}`;
  
  
    
    useEffect(() => {
      if (!subCategory) {
        setLoading(true);
        axios
          .get(API_URL + "/api/products", {
            params: {
              category: category,
            },
          })
          .then((res) => {
            setItems((res.data).splice(0,2));
            setLoading(false);
          })
          .catch((error) => {
            console.error('Error fetching featured items:', error);
            setLoading(false);
          });
      } else if (subCategory) {
        setLoading(true);
        axios
          .get(API_URL + "/api/products", {
            params: {
              subCategory: subCategory,
            },
          })
          .then((res) => {
            setItems(res.data);
            setLoading(false);
          })
          .catch((error) => {
            console.error('Error fetching featured items:', error);
            setLoading(false);
          });
      }
    }, [subCategory]);

    marketplaceItems = items.map((item) => {
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
        <h2 className={classes.header}>{translate('landing.trending')} </h2>
        <div className={classes.trendingContainer}>
          {loading ? (
            <div className={classes.grid}>
              <Skeleton name="marketplace-item" />
              <Skeleton name="marketplace-item" />
            </div>
          ) : (
            <div className={classes.grid}>{marketplaceItems}</div>
          )}
        </div>
    </div>
  )
}

export default FeaturedItem