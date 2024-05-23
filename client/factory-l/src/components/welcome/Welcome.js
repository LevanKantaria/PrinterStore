import React from "react";
import classes from "./Welcome.module.css";
import { useNavigate } from "react-router";
import CustomButton from "../customButton/CustomButton";



function Welcome() {

  const navigate = useNavigate();
  return (
    <div className={classes.main}>
      <div className={classes.welcomeArticleAndImage}>
        <article className={classes.article}>
          <h1>3D Printing Service</h1>
          <div className={classes.pAndBox}>
            <div className={classes.verticalBox}> </div>
            <p>
              Create and customize. Streamline and save. Break down design
              barriers and scale your business with FactoryL 3D printing
              services
            </p>
          </div>
          <div className={classes.buttons}>
           <CustomButton 
           onClick={()=>{navigate('/quote')}}
           name='quote'
           text='Get a Quote'
           width='200px'/>
          </div>
        </article>

        <div className={classes.image}>
            <iframe width="100%" height="100%" 
              src="https://www.youtube.com/embed/W0ERmrYaDqg?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1&loop=1&playlist=W0ERmrYaDqg"
              title="YouTube video player" 
              frameborder="0" 
              allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
              style={{borderRadius: '10px'}}
            ></iframe>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
