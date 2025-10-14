import React from "react";
import { useState } from "react";
import { TextField } from "@mui/material";
import axios from "axios";
import classes from "./UploadItem.module.css";
import CustomButton from "../customButton/CustomButton";
import DragAndDrop from "../dragAndDrop/DragAndDrop";
import Select from "react-select";

import { API_URL } from "../../API_URL";

const UploadItem = () => {
  const [item, setItem] = useState({
    name: "",
    category: "",
    images: [],
    price: "",
    creator: "levani",
    subCategory: "",
    description: "",
  });

  const submitHandler = (e) => {
    e.preventDefault();
    console.log(item);
    axios.post(API_URL + "api/products", item).then((res) => {
      console.log(res);
      setItem({
        name: "",
        category: "",
        images: "123456",
        price: "",
        creator: "levani",
        subCategory: "",
      });
    });
  };
  const categories = [
    { value: "household", label: "Household" },
    { value: "cars", label: "Cars" },
    { value: "office", label: "Office" },
  ];
  const subCategory = {
    cars: [
      { value: "keychains", label: "Keychains" },
      { value: "accessories", label: "accessories" },
      { value: "good-to-haves", label: "Good to have" },
    ],
    office: [
      { value: "organizers", label: "Organizers" },
      { value: "fidget", label: "Fidget" },
      { value: "decoration", label: "Decoration Office" },
    ],
    household: [
      { value: "plants", label: "Plants" },
      { value: "decorations", label: "Decorations household" },
      { value: "kitchen", label: "Kitchen" },
    ],
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "transparent", // Darker background color
      zIndex: 2,
      marginTop: "10px", // Adjust the top margin as needed
      height: "50px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 3, // Ensures the dropdown menu has a higher z-index
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "black", // Text color for better contrast with the darker background
      textAlign: "left",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "rgba(0.0.0.0.15)" : "transparent", // Darker background for options
      color: "black", // Text color for options
      textAlign: "left",
      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.2)", // Hover effect for options
      },
    }),
  };

  return (
    <div className={classes.wrapper}>
      <h2>UploadItem</h2>

      <form className={classes.uploadForm}>
        <Select
          options={categories}
          onChange={(e) => {
            setItem({ ...item, category: e.value });
          }}
          placeholder="Category"
          styles={customStyles}
        />
        <Select
          options={subCategory[item.category]}
          onChange={(e) => {
            setItem({ ...item, subCategory: e.value });
          }}
          placeholder="Sub Category"
          styles={customStyles}
        />

        <TextField
          margin="dense"
          id="name"
          label="name"
          onChange={(e) => {
            setItem({ ...item, name: e.target.value });
          }}
        />
        {/* <TextField
          margin="dense"
          id="category"
          label="category"
          onChange={(e) => {
            setItem({ ...item, category: e.target.value });
          }}
        />

        <TextField
          margin="dense"
          id="subCategory"
          label="subCategory"
          onChange={(e) => {
            setItem({ ...item, subCategory: e.target.value });
          }}
        /> */}
        <TextField
          margin="dense"
          id="price"
          label="price"
          onChange={(e) => {
            setItem({ ...item, price: e.target.value });
          }}
        />
        <TextField
          margin="dense"
          id="description"
          label="description"
          onChange={(e) => {
            setItem({ ...item, description: e.target.value });
          }}
        />
        <DragAndDrop
          onChange={(images, hasFiles) => setItem({ ...item, images })}
          text="Choose images or drag them here:"
        />

        <CustomButton onClick={submitHandler} text="submit" />
      </form>
    </div>
  );
};

export default UploadItem;
