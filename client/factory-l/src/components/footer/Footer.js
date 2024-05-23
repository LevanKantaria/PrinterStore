import React from "react";
import classes from "./Footer.module.css";
import CustomButton from "../customButton/CustomButton";

const Footer = () => {
  return (
    <footer>
      <section className={classes.container}>
        <div className={classes.leftDiv}>
          <h2>Ready to get started?</h2>
          <p className={classes.p}>
            From product development to industrial 3D manufacturing, we can help
            you scale your business.
          </p>
          <CustomButton text="Contact" 
          name='contact'
          />
        </div>
        <div className={classes.rightDivs}>

            <div className={classes.footerColumn} >

                <h2>Services</h2>
                <p> <a  href=""> 3D Design</a></p>
                <p> <a  href=""> 3D Printing</a></p>
                <p> <a  href=""> Aditive Manufacturing</a></p>
                <p> <a  href=""> Business</a></p>
                <p> <a  href=""> Marketplace</a></p>
            </div>
            

           
            <div className={classes.footerColumn} >
                <h2>Support</h2>
                <p> <a  href=""> Contact Us</a></p>
                <p> <a  href=""> Help Center</a></p>
                <p> <a  href=""> 3D Materials Guide</a></p>
                <p> <a  href=""> For Students</a></p>
              </div>
            <div className={classes.footerColumn} >
                <h2>Factory L</h2>
                <p> <a  href=""> About</a></p>
                <p> <a  href=""> Blog</a></p>
                <p> <a  href=""> Press</a></p>
                <p> <a  href=""> Careers</a></p>
                <p> <a  href=""> Invite a Friend</a></p>
                <p> <a  href=""> Gift Cards</a></p>
                <p> <a  href=""> Newsletter Signup</a></p>
                
            </div>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
