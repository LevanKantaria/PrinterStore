import React from 'react'
import classes from './ListItem.module.css'

function ListItem(props) {
    
    const clickHandler=()=>{
        window.open(props.buttonLink);
        // console.log(props.buttonLink)
    }
    const clickHandlerRoute=()=>{
        // window.open(props.buttonLink);
        // console.log(props.buttonLink)
    }
  return (
    <section className={classes.sections}>
    <div className={classes.image}>
      <img src={props.image} width={props.width} style={{objectFit:'cover'}} height={props.height} alt={props.title} />
      </div>
      <span>{props.title}</span>
      <p>
        {props.text}
      </p>
      
      {props.buttonLink && <button className={classes.button} onClick={clickHandler} >Learn More</button>}
      {props.buttonRoute && <button className={classes.button} onClick={clickHandlerRoute} >Learn More</button>}
      <hr></hr>
    </section>
  )
}

export default ListItem