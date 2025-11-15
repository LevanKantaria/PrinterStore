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
import { createMakerProduct } from "../../api/maker";
import { getProfile } from "../../api/profile";

// Predefined colors with hex values
const PREDEFINED_COLORS = [
  { name: 'white', hex: '#FFFFFF' },
  { name: 'red', hex: '#FF0000' },
  { name: 'green', hex: '#00FF00' },
  { name: 'yellow', hex: '#FFFF00' },
  { name: 'purple', hex: '#800080' },
  { name: 'orange', hex: '#FFA500' },
  { name: 'brown', hex: '#A52A2A' },
  { name: 'blue', hex: '#0000FF' },
  { name: 'pink', hex: '#FFC0CB' },
  { name: 'violet', hex: '#8A2BE2' },
];

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

  const [isMaker, setIsMaker] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigate("/sign-in", { replace: true });
    }
  }, [authStatus, navigate]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (authStatus === "authenticated" && user) {
        try {
          const profile = await getProfile();
          const userIsAdmin = profile.isAdmin === true;
          const userIsMaker = profile.role === 'maker' && profile.makerStatus === 'approved';
          
          if (!userIsAdmin && !userIsMaker) {
            navigate("/", { replace: true });
            return;
          }
          
          setIsMaker(userIsMaker);
        } catch (err) {
          console.error("[upload] profile check failed", err);
        }
      }
    };
    
    checkUserRole();
  }, [authStatus, user, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      if (isMaker) {
        await createMakerProduct(item);
      } else {
        await createProduct(item);
      }
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
      navigate(isMaker ? "/maker/dashboard" : "/admin/listings");
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
          <label>{translate('upload.availableColors')}</label>
          <div className={classes.colorPicker}>
            {PREDEFINED_COLORS.map((colorObj) => {
              const isSelected = item.colors.includes(colorObj.name);
              return (
                <button
                  key={colorObj.name}
                  type="button"
                  className={`${classes.colorBall} ${isSelected ? classes.colorBallSelected : ''}`}
                  onClick={() => {
                    setItem((prev) => ({
                      ...prev,
                      colors: isSelected
                        ? prev.colors.filter((c) => c !== colorObj.name)
                        : [...prev.colors, colorObj.name],
                    }));
                  }}
                  title={translate(`colors.${colorObj.name}`)}
                  aria-label={translate(`colors.${colorObj.name}`)}
                >
                  <span
                    className={classes.colorBallInner}
                    style={{ backgroundColor: colorObj.hex }}
                  />
                  {isSelected && <span className={classes.checkmark}>✓</span>}
                </button>
              );
            })}
          </div>
          {item.colors.length > 0 && (
            <div className={classes.colorChips}>
              {item.colors.map((colorName, index) => {
                const colorObj = PREDEFINED_COLORS.find(c => c.name === colorName);
                return (
                  <span key={`${colorName}-${index}`} className={classes.colorChip}>
                    <span
                      className={classes.colorSwatch}
                      style={{
                        backgroundColor: colorObj?.hex || "#1c3d27",
                      }}
                    />
                    {translate(`colors.${colorName}`)}
                    <button
                      type="button"
                      onClick={() =>
                        setItem((prev) => ({
                          ...prev,
                          colors: prev.colors.filter((_, idx) => idx !== index),
                        }))
                      }
                      aria-label={`${translate('upload.remove')} ${translate(`colors.${colorName}`)}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
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
