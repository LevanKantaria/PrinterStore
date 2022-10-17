import React from "react";
import classes from "./Welcome.module.css";
import CustomButton from "../customButton/CustomButton";


function Welcome() {
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
           text='Get a Quote'/>
          </div>
        </article>

        <div className={classes.image}>
          <img src="/assets/welcome_logo_tra.png" />
        </div>
      </div>
    </div>
  );
}

export default Welcome;