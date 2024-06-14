import React from 'react'
import classes from './CategoryItem.module.css'
import { Link } from 'react-router-dom'
import translate from '../../translate'

const CategoryItem = (props) => {
  return (
    <div className={classes.main} >
        <img src={props.image} alt='decorative' loading='lazy' />
        <h3><Link to={props.link}> {translate(props.title)}</Link></h3>
        <ul>
            <li><Link to={props.link1}> {translate(props.item1)}</Link>  </li>
            <li><Link to={props.link2}> {translate(props.item2)}</Link>  </li>
            <li><Link to={props.link3}> {translate(props.item3)}</Link>  </li>
        </ul>
    </div>
  )
}

export default CategoryItem