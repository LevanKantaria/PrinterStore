import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import classes from "./CategoryItem.module.css";
import translate from "../../translate";

const CategoryItem = ({ link, image, title, items = [] }) => {
  // Subscribe to language changes to trigger re-render
  const currentLang = useSelector((state) => state.lang.lang);
  const navigate = useNavigate();

  const handleCategoryClick = (e) => {
    e.preventDefault();
    navigate(`/marketplace/${link}`);
  };

  const handleSubcategoryClick = (e, subcategoryLink) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/marketplace/${subcategoryLink}`);
  };

  return (
    <div className={classes.main}>
      <div 
        onClick={handleCategoryClick}
        style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCategoryClick(e);
          }
        }}
      >
        <img src={image} alt={translate(title)} loading="lazy" />
        <h3>{translate(title)}</h3>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.link}>
            <a 
              href={`/marketplace/${item.link}`}
              onClick={(e) => handleSubcategoryClick(e, item.link)}
              style={{ textDecoration: 'none' }}
            >
              {translate(item.label)}
            </a>
          </li>
        ))}
      </ul>
    </div>
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

export default CategoryItem;