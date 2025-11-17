// SimpleSlider.js
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import classes from "./SimpleSlider.module.css";

const SimpleSlider = ({ images }) => {
  const NextArrow = ({ onClick }) => (
    <div className={classes.nextArrow} onClick={onClick}>
      &gt;
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div className={classes.prevArrow} onClick={onClick}>
      &lt;
    </div>
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  if (images.length === 1) {
    return (
      <div className={classes.singleImageContainer}>
        <img
          src={images[0]}
          alt="single-slide"
          className={classes.sliderImage}
        />
      </div>
    );
  }

  return (
    <div className={classes.sliderContainer}>
      <Slider {...settings} className={classes.slider}>
        {images.map((image, index) => (
          <div key={index} className={classes.slideWrapper}>
            <img
              src={image}
              alt={`slide-${index}`}
              className={classes.sliderImage}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SimpleSlider;
