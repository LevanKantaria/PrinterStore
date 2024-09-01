import { useEffect, useState } from "react";
import classes from "./MarketplaceItemsList.module.css";
import MarketplaceItem from "../marketplaceItem/MarketplaceItem";
import axios from "axios";
import { useParams } from "react-router";
import CircularIndeterminate from "../circularProgress/CircularProgress";
import { API_URL } from "../../API_URL";
import { Link } from "react-router-dom";
import Marketplace from '../../pages/Marketplace';
import MarketplaceItemSkeleton from "./MarketplaceItemSkeleton";
import translate from "../translate";


// const API_URL ='https://factory-l.herokuapp.com/'



const MarketplaceItemsList = () => {
  const params = useParams();
  let category = params.category;
  let subCategory = params.subCategory;
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
          setItems(res.data);
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
        images={item.images || item.image}
        price={item.price}
        creator={item.creator}
        key={Math.random()}
        name={item.name}
        description={item.description}
      />
    );
  });

  return (
    <div className={classes.wrapper}>
      <div className={classes.category}>
        <h3>
          {" "}
          <Link to={'/marketplace'}>{translate('landing.marketplace')}</Link>{" "}

          <Link to={categoryLink}>{translate(`categories.${category}`)}</Link>{" "}
          {subCategory && translate(`categories.${subCategory}`) }
        
        </h3>
      </div>
      {loading && <MarketplaceItemSkeleton/>
}
      <div className={classes.grid}>{marketplaceItems}</div>
    </div>
  );
};

export default MarketplaceItemsList;
