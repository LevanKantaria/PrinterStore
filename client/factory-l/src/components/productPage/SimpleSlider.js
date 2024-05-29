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
      <div style={{ borderRadius: "12px" }}>
        <img
          src={images[0]}
          alt="single-slide"
          style={{ width: "100%", height: "auto", borderRadius: "12px" }}
        />
      </div>
    );
  }

  return (
    <Slider {...settings} style={{ borderRadius: "12px" }}>
      {images.map((image, index) => (
        <div key={index}>
          <img
            src={image}
            alt={`slide-${index}`}
            style={{ width: "100%", height: "auto", borderRadius: "12px" }}
          />
        </div>
      ))}
    </Slider>
  );
};

export default SimpleSlider;
