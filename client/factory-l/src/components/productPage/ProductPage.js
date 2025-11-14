// ProductPage.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import classes from "./ProductPage.module.css";
import CustomButton from "../customButton/CustomButton";
import { cartActions } from "../../features/cart/cartSlice";
import Skeleton from "../skeleton/Skeleton";
import SimpleSlider from "./SimpleSlider";
import translate from "../translate";
import { API_URL } from "../../API_URL";

const ProductPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Subscribe to language changes to trigger re-render
  const currentLang = useSelector((state) => state.lang.lang);
  const params = useParams();
  let id = params.id;
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");

  const clickHandler = (e) => {
    e.preventDefault();
    const itemWithQuantity = { 
      ...item, 
      quantity, 
      color: selectedColor,
      makerId: item.makerId,
      makerName: item.makerName,
    };
    dispatch(cartActions.addItem(itemWithQuantity));
    navigate(`/cart/${item._id}`);
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(API_URL + "/api/products", {
        params: { id: id },
      })
      .then((res) => {
        const product = res.data[0];
        setItem(product);
        setSelectedColor(product?.colors?.[0] || "");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (item?.colors?.length) {
      setSelectedColor(item.colors[0]);
    } else {
      setSelectedColor("");
    }
  }, [item.colors]);

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
          <h5>{translate('product.madeBy')}</h5>
          <span>{item.creator}</span>
          <div className={classes.orderDiv}>
            <div className={classes.priceAndShipping}>
              <span className={classes.price}>₾{item.price}</span>
              <span className={classes.shipping}>{translate('product.ships')}</span>
            </div>
              {item.colors?.length > 0 && (
                <div className={classes.colorSelector}>
                  <span className={classes.colorLabel}>{translate('product.color')}</span>
                  <div className={classes.colorOptions}>
                    {item.colors.map((color) => (
                      <button
                        type="button"
                        key={color}
                        className={`${classes.colorOption} ${
                          selectedColor === color ? classes.colorOptionActive : ""
                        }`}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select ${color}`}
                      >
                        <span
                          className={classes.colorDot}
                          style={{ backgroundColor: color }}
                        />
                        <span>{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            <div className={classes.qtyAndBuy}>
              <div className={classes.quantitySelector}>
                <label htmlFor="quantity">{translate('product.quantity')}</label>
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
                text={translate('product.addToCart')}
                width="150px"
                height="50px"
                fontSize="15px"
                disabled={item.colors?.length > 0 && !selectedColor}
              />
            </div>
          </div>
          {/* Commented out - redundant section for now */}
          {/* <h2>{translate('product.question')}</h2>
          <p>{translate('product.loginRequired')}</p> */}
        </div>
      </div>
      <div className={classes.descriptionAndDetails}>
        <div className={classes.description}>
          <div className={classes.sectionHeader}>
            <h3>{translate('product.about')}</h3>
            <div className={classes.headerLine}></div>
          </div>
          <p className={classes.descriptionText}>{item.description || translate('product.noDescription')}</p>
        </div>
        <div className={classes.details}>
          <div className={classes.sectionHeader}>
            <h3>{translate('product.information')}</h3>
            <div className={classes.headerLine}></div>
          </div>
          <div className={classes.detailsList}>
            <div className={classes.detailItem}>
              <div className={classes.detailIcon}>📦</div>
              <div className={classes.detailContent}>
                <span className={classes.detailLabel}>{translate('product.category')}</span>
                <span className={classes.detailValue}>{item.category ? translate(`categories.${item.category}`) : "N/A"}</span>
              </div>
            </div>
            <div className={classes.detailItem}>
              <div className={classes.detailIcon}>🏷️</div>
              <div className={classes.detailContent}>
                <span className={classes.detailLabel}>{translate('product.subcategory')}</span>
                <span className={classes.detailValue}>{item.subCategory || "N/A"}</span>
              </div>
            </div>
            <div className={classes.detailItem}>
              <div className={classes.detailIcon}>👤</div>
              <div className={classes.detailContent}>
                <span className={classes.detailLabel}>{translate('product.createdBy')}</span>
                <span className={classes.detailValue}>{item.creator || "N/A"}</span>
              </div>
            </div>
            <div className={classes.detailItem}>
              <div className={classes.detailIcon}>💰</div>
              <div className={classes.detailContent}>
                <span className={classes.detailLabel}>{translate("product.price")}</span>
                <span className={classes.detailValue}>₾{item.price || "N/A"}</span>
              </div>
            </div>
            <div className={classes.detailItem}>
              <div className={classes.detailIcon}>🚚</div>
              <div className={classes.detailContent}>
                <span className={classes.detailLabel}>{translate('product.shipping')}</span>
                <span className={classes.detailValue}>{translate('product.shippingTime')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
