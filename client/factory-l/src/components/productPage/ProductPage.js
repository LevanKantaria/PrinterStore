// ProductPage.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import classes from "./ProductPage.module.css";
import CustomButton from "../customButton/CustomButton";
import { cartActions } from "../../features/cart/cartSlice";
import Skeleton from "../skeleton/Skeleton";
import SimpleSlider from "./SimpleSlider";
import translate from "../translate";

const API_URL = "http://localhost:5000/";

const ProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  let id = params.id;
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({});
  const [quantity, setQuantity] = useState(1);

  const clickHandler = (e) => {
    e.preventDefault();
    const itemWithQuantity = { ...item, quantity };
    dispatch(cartActions.addItem(itemWithQuantity));
    navigate(`/cart/${item._id}`);
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(API_URL + "api/products", {
        params: { id: id },
      })
      .then((res) => {
        setItem(res.data[0]);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className={classes.main}>
      <div className={classes.breadCrumbs}>
        <Link to='/marketplace'>{translate('landing.marketplace')}</Link>
        {item.category && <Link to={`/marketplace/${item.category}`}>{translate(`categories.${item.category}`)}</Link>}
        {item.subCategory && <Link to={`/marketplace/${item.category}/${item.subCategory}`}>{translate(`categories.${item.subCategory}`)}</Link>}
      </div>
      {loading && (
        <div className={classes.skeletonContainer}>
          <div className={classes.imageSkeleton}>
            <Skeleton component="image" width="100%" height="470px" rounded={true} />
          </div>
          <div className={classes.contentSkeleton}>
            <Skeleton name="text-single" width="80%" height="30px" />
            <Skeleton name="text-single" width="60%" height="20px" />
            <div className={classes.orderSkeleton}>
              <Skeleton name="text-single" width="40%" height="25px" />
              <Skeleton name="text-single" width="70%" height="20px" />
              <Skeleton name="image-rectangle" width="150px" height="50px" />
            </div>
          </div>
        </div>
      )}
      <div className={classes.imageAndDescription}>
        <div className={classes.image}>
          {item?.images?.length > 0 && (
            <SimpleSlider images={item.images} />
          )}
        </div>
        <div className={classes.rightDiv}>
          <h1 className={classes.itemName}> {item.name}</h1>
          <h5> Made By</h5>
          <span>{item.creator}</span>
          <div className={classes.orderDiv}>
            <div className={classes.priceAndShipping}>
              <span className={classes.price}>${item.price}</span>
              <span className={classes.shipping}> Ships as soon as 7 days</span>
            </div>
            <div className={classes.qtyAndBuy}>
              <div className={classes.quantitySelector}>
                <label htmlFor="quantity">Quantity:</label>
                <select 
                  id="quantity" 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className={classes.quantitySelect}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <CustomButton
                onClick={clickHandler}
                text="Add to Cart"
                width="150px"
                height="50px"
                fontSize="15px"
              />
            </div>
          </div>
          <h2> Have a question about this Product?</h2>
          <p>You must be logged in and verified to contact the designer.</p>
        </div>
      </div>
      <div className={classes.descriptionAndDetails}>
        <div className={classes.description}>
          <div className={classes.sectionHeader}>
            <h3>About This Product</h3>
            <div className={classes.headerLine}></div>
          </div>
          <p className={classes.descriptionText}>{item.description || "No description available for this product."}</p>
        </div>
        <div className={classes.details}>
          <div className={classes.sectionHeader}>
            <h3>Product Information</h3>
            <div className={classes.headerLine}></div>
          </div>
          <div className={classes.detailsList}>
            <div className={classes.detailItem}>
              <div className={classes.detailIcon}>📦</div>
              <div className={classes.detailContent}>
                <span className={classes.detailLabel}>Category</span>
                <span className={classes.detailValue}>{item.category || "N/A"}</span>
              </div>
            </div>
            <div className={classes.detailItem}>
              <div className={classes.detailIcon}>🏷️</div>
              <div className={classes.detailContent}>
                <span className={classes.detailLabel}>Subcategory</span>
                <span className={classes.detailValue}>{item.subCategory || "N/A"}</span>
              </div>
            </div>
            <div className={classes.detailItem}>
              <div className={classes.detailIcon}>👤</div>
              <div className={classes.detailContent}>
                <span className={classes.detailLabel}>Created By</span>
                <span className={classes.detailValue}>{item.creator || "N/A"}</span>
              </div>
            </div>
            <div className={classes.detailItem}>
              <div className={classes.detailIcon}>💰</div>
              <div className={classes.detailContent}>
                <span className={classes.detailLabel}>Price</span>
                <span className={classes.detailValue}>${item.price || "N/A"}</span>
              </div>
            </div>
            <div className={classes.detailItem}>
              <div className={classes.detailIcon}>🚚</div>
              <div className={classes.detailContent}>
                <span className={classes.detailLabel}>Shipping</span>
                <span className={classes.detailValue}>7-14 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
