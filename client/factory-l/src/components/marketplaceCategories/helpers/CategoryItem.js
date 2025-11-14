import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import classes from "./CategoryItem.module.css";
import { Link } from "react-router-dom";
import translate from "../../translate";

const CategoryItem = ({ link, image, title, items }) => {
  // Subscribe to language changes to trigger re-render
  const currentLang = useSelector((state) => state.lang.lang);
  const handleSubcategoryClick = (event) => {
    event.stopPropagation();
  };

  return (
    <Link to={link} className={classes.main}>
      <img src={image} alt={translate(title)} loading="lazy" />
      <h3>{translate(title)}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.link}>
            <Link to={item.link} onClick={handleSubcategoryClick}>
              {translate(item.label)}
            </Link>
          </li>
        ))}
      </ul>
    </Link>
  );
};

CategoryItem.propTypes = {
  link: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
    })
  ),
};

CategoryItem.defaultProps = {
  items: [],
};

export default CategoryItem;