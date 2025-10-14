import React from 'react'
import classes from './CategoryItem.module.css'
import { Link } from 'react-router-dom'
import translate from '../../translate'

const CategoryItem = (props) => {
  const handleSubcategoryClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Link to={props.link} className={classes.main} >
        <img src={props.image} alt='decorative' loading='lazy' />
        <h3> {translate(props.title)}</h3>
        <ul>
            <li><Link to={props.link1} onClick={handleSubcategoryClick}> {translate(props.item1)}</Link>  </li>
            <li><Link to={props.link2} onClick={handleSubcategoryClick}> {translate(props.item2)}</Link>  </li>
            <li><Link to={props.link3} onClick={handleSubcategoryClick}> {translate(props.item3)}</Link>  </li>
        </ul>
    </Link>
  )
}

export default CategoryItem