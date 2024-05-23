import React from 'react'
import classes from "./MarketplaceItemsList.module.css";

const MarketplaceItemSkeleton = () => {

  const items = [1,2,3,4,5,6,7,8,9]

  const marketplaceItems = items.map((item) => {
   
    return (
      <div>
      <div className={classes.marketplaceItemPlaceholder}></div>
      <div className={classes.marketplaceItemPlaceholderText}></div>
      </div>
    );
  });


  return (
    <div className={classes.grid}>{marketplaceItems}</div>
  )
}

export default MarketplaceItemSkeleton