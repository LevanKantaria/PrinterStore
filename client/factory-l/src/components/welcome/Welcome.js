import React from "react";
import classes from "./Welcome.module.css";
import { useNavigate } from "react-router";
import CustomButton from "../customButton/CustomButton";
import translate from './../translate';




function Welcome() {

  const navigate = useNavigate();
  return (
    <div className={classes.main}>
      <div className={classes.welcomeArticleAndImage}>
        <article className={classes.article}>
          
          <div className={classes.title}><h1>{translate('landing.title')}</h1></div>
          <div className={classes.pAndBox}>
            <div className={classes.verticalBox}> </div>
            <p>
            {translate('landing.desc')}
            </p>
          </div>
          <div className={classes.buttons}>
           <CustomButton 
           onClick={()=>{navigate('/quote')}}
           name='quote'
           text= {translate('landing.button')}
           width='200px'/>
          </div>
        </article>

        <div className={classes.image}>
            <iframe width="100%" height="100%" 
              src="https://www.youtube.com/embed/W0ERmrYaDqg?autoplay=0mute=1&controls=0&showinfo=0&modestbranding=1&loop=1&playlist=W0ERmrYaDqg"
              title="YouTube video player" 
              frameBorder="0" 
              allow="autoplay; clipboard-write; encrypted-media;  picture-in-picture; web-share;"
              style={{borderRadius: '10px'}}
            ></iframe>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
