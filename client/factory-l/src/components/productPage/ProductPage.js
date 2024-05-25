// ProductPage.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import classes from "./ProductPage.module.css";
import CustomButton from "../customButton/CustomButton";
import { cartActions } from "../../features/cart/cartSlice";
import ProductSkeleton from "./ProductSkeleton";
import SimpleSlider from "./SimpleSlider";

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
    dispatch(cartActions.addItem(item));
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

  let linkToSubCategory = `/marketplace/${item.category + '/' + item.subCategory}`;

  return (
    <div className={classes.main}>
      <div className={classes.breadCrumbs}>
        <Link to='/marketplace'>Marketplace </Link>
        <Link to={linkToSubCategory}>{item.subCategory} </Link>
      </div>
      {loading && <ProductSkeleton />}
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
              <CustomButton
                onClick={clickHandler}
                text="add To Cart"
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
          Product description
          <p> {item.description} </p>
        </div>
        <div className={classes.details}>
          Details
          <p> Dimensions: </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
