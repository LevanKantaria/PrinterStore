import React, { useEffect, useMemo, useState } from "react";
import { TextField } from "@mui/material";
import classes from "./UploadItem.module.css";
import CustomButton from "../customButton/CustomButton";
import DragAndDrop from "../dragAndDrop/DragAndDrop";
import Select from "react-select";
import categories from "../../data/marketplaceCategories";
import translate from "../translate";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { createProduct } from "../../api/products";

const UploadItem = () => {
  const navigate = useNavigate();
  const { status: authStatus, user } = useSelector((state) => state.auth);

  const [item, setItem] = useState({
    name: "",
    category: "",
    images: [],
    price: "",
    creator: "levani",
    subCategory: "",
    description: "",
    colors: [],
  });
  const [colorInput, setColorInput] = useState("");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigate("/sign-in", { replace: true });
    }
  }, [authStatus, navigate]);

  useEffect(() => {
    if (authStatus === "authenticated" && user && user.isAdmin === false) {
      navigate("/", { replace: true });
    }
  }, [authStatus, user, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createProduct(item);
      setItem({
        name: "",
        category: "",
        images: [],
        price: "",
        creator: "levani",
        subCategory: "",
        description: "",
        colors: [],
      });
      setColorInput("");
    } catch (error) {
      console.error("[upload] create failed", error);
    }
  };

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: translate(category.titleKey),
      })),
    []
  );

  const subcategoryOptions = useMemo(() => {
    const activeCategory = categories.find((category) => category.id === item.category);
    return activeCategory
      ? activeCategory.subcategories.map((subcategory) => ({
          value: subcategory.id,
          label: translate(subcategory.labelKey),
        }))
      : [];
  }, [item.category]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "transparent",
      zIndex: 2,
      marginTop: "10px",
      minHeight: "50px",
      borderColor: "rgba(0, 0, 0, 0.2)",
      boxShadow: "none",
      "&:hover": { borderColor: "rgba(0, 0, 0, 0.35)" },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 3,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#0c210f",
      textAlign: "left",
      fontWeight: 600,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "rgba(28, 61, 39, 0.08)" : "transparent",
      color: "#0c210f",
      textAlign: "left",
      "&:hover": {
        backgroundColor: "rgba(28, 61, 39, 0.12)",
      },
    }),
  };

  return (
    <div className={classes.wrapper}>
      <h2>Upload item</h2>

      <form className={classes.uploadForm} onSubmit={submitHandler}>
        <Select
          options={categoryOptions}
          onChange={(selected) => {
            setItem({ ...item, category: selected?.value || "", subCategory: "" });
          }}
          placeholder="Category"
          styles={customStyles}
          value={categoryOptions.find((option) => option.value === item.category) || null}
        />
        <Select
          options={subcategoryOptions}
          onChange={(selected) => {
            setItem({ ...item, subCategory: selected?.value || "" });
          }}
          placeholder="Subcategory"
          styles={customStyles}
          value={subcategoryOptions.find((option) => option.value === item.subCategory) || null}
          isDisabled={!item.category}
        />

        <div className={classes.colorSection}>
          <label htmlFor="colorInput">Available colors</label>
          <div className={classes.colorInputRow}>
            <input
              id="colorInput"
              type="text"
              value={colorInput}
              placeholder="Add color name or hex code"
              onChange={(event) => setColorInput(event.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                const value = colorInput.trim();
                if (!value) return;
                setItem((prev) => ({
                  ...prev,
                  colors: prev.colors.includes(value) ? prev.colors : [...prev.colors, value],
                }));
                setColorInput("");
              }}
            >
              Add
            </button>
          </div>
          {item.colors.length > 0 && (
            <div className={classes.colorChips}>
              {item.colors.map((color, index) => (
                <span key={`${color}-${index}`} className={classes.colorChip}>
                  <span
                    className={classes.colorSwatch}
                    style={{
                      backgroundColor: color || "#1c3d27",
                    }}
                  />
                  {color}
                  <button
                    type="button"
                    onClick={() =>
                      setItem((prev) => ({
                        ...prev,
                        colors: prev.colors.filter((_, idx) => idx !== index),
                      }))
                    }
                    aria-label={`Remove ${color}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <TextField
          margin="dense"
          id="name"
          label="Name"
          value={item.name}
          onChange={(e) => {
            setItem({ ...item, name: e.target.value });
          }}
        />
        <TextField
          margin="dense"
          id="price"
          label="Price"
          value={item.price}
          onChange={(e) => {
            setItem({ ...item, price: e.target.value });
          }}
        />
        <TextField
          margin="dense"
          id="description"
          label="Description"
          value={item.description}
          multiline
          minRows={3}
          onChange={(e) => {
            setItem({ ...item, description: e.target.value });
          }}
        />
        <DragAndDrop onChange={(images) => setItem({ ...item, images })} text="Choose images or drag them here:" />

        <CustomButton type="submit" text="Submit" />
      </form>
    </div>
  );
};

export default UploadItem;
