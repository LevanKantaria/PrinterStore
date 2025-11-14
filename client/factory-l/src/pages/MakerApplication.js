import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { TextField, Checkbox, FormControlLabel, Alert, CircularProgress, Button } from "@mui/material";
import classes from "./MakerApplication.module.css";
import CustomButton from "../components/customButton/CustomButton";
import DragAndDrop from "../components/dragAndDrop/DragAndDrop";
import translate from "../components/translate";
import { submitMakerApplication, getMyApplication } from "../api/maker";

const MACHINE_BRANDS = [
  "BambuLab",
  "QidiTech",
  "FlashForge",
  "Prusa",
  "Ultimaker",
  "Creality",
  "Other",
];

const FILAMENT_BRANDS = [
  "Prusament",
  "Polymaker",
  "BambuLab",
  "Hatchbox",
  "eSUN",
  "Overture",
  "Sunlu",
  "ColorFabb",
  "Fillamentum",
  "FormFutura",
  "Other",
];

const MakerApplication = () => {
  const navigate = useNavigate();
  const { status: authStatus, user } = useSelector((state) => state.auth);
  const currentLang = useSelector((state) => state.lang.lang);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);

  const [formData, setFormData] = useState({
    whatToSell: "",
    machines: [{ brand: "", model: "", year: new Date().getFullYear(), age: 0 }],
    machineCount: 1,
    filamentBrands: [],
    otherFilamentBrand: "",
    location: "",
    experience: "",
    productionCapacity: "",
    whyJoin: "",
    portfolioImages: [],
    termsAccepted: false,
  });

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigate("/sign-in", { replace: true });
      return;
    }

    // Check for existing application
    const checkApplication = async () => {
      try {
        const app = await getMyApplication();
        if (app && (app.status === "pending" || app.status === "approved")) {
          setExistingApplication(app);
        }
      } catch (err) {
        // No existing application
      } finally {
        setLoading(false);
      }
    };

    checkApplication();
  }, [authStatus, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleMachineChange = (index, field, value) => {
    const newMachines = [...formData.machines];
    newMachines[index] = { ...newMachines[index], [field]: value };
    
    // Auto-calculate age if year changed
    if (field === "year") {
      const currentYear = new Date().getFullYear();
      newMachines[index].age = currentYear - parseInt(value) || 0;
    }
    
    setFormData((prev) => ({ ...prev, machines: newMachines }));
  };

  const addMachine = () => {
    setFormData((prev) => ({
      ...prev,
      machines: [...prev.machines, { brand: "", model: "", year: new Date().getFullYear(), age: 0 }],
    }));
  };

  const removeMachine = (index) => {
    if (formData.machines.length > 1) {
      setFormData((prev) => ({
        ...prev,
        machines: prev.machines.filter((_, i) => i !== index),
      }));
    }
  };

  const handleFilamentBrandToggle = (brand) => {
    setFormData((prev) => {
      const isSelected = prev.filamentBrands.includes(brand);
      return {
        ...prev,
        filamentBrands: isSelected
          ? prev.filamentBrands.filter((b) => b !== brand)
          : [...prev.filamentBrands, brand],
      };
    });
  };

  const handlePortfolioImages = (images) => {
    setFormData((prev) => ({ ...prev, portfolioImages: images }));
  };

  const validateForm = () => {
    if (!formData.whatToSell.trim()) {
      setError(translate("makerApplication.errors.whatToSell"));
      return false;
    }

    if (formData.machines.length === 0 || formData.machines.some(m => !m.brand || !m.model)) {
      setError(translate("makerApplication.errors.machines"));
      return false;
    }

    if (formData.filamentBrands.length === 0) {
      setError(translate("makerApplication.errors.filamentBrands"));
      return false;
    }

    if (formData.filamentBrands.includes("Other") && !formData.otherFilamentBrand.trim()) {
      setError(translate("makerApplication.errors.otherFilamentBrand"));
      return false;
    }

    if (!formData.location.trim()) {
      setError(translate("makerApplication.errors.location"));
      return false;
    }

    if (formData.portfolioImages.length === 0) {
      setError(translate("makerApplication.errors.portfolio"));
      return false;
    }

    if (!formData.termsAccepted) {
      setError(translate("makerApplication.errors.terms"));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const applicationData = {
        whatToSell: formData.whatToSell,
        machines: formData.machines.map((m) => ({
          brand: m.brand,
          model: m.model,
          year: parseInt(m.year) || new Date().getFullYear(),
          age: parseInt(m.age) || 0,
        })),
        machineCount: parseInt(formData.machineCount) || formData.machines.length,
        filamentBrands: formData.filamentBrands.includes("Other")
          ? [...formData.filamentBrands.filter((b) => b !== "Other"), formData.otherFilamentBrand]
          : formData.filamentBrands,
        location: formData.location,
        experience: formData.experience ? parseInt(formData.experience) : undefined,
        productionCapacity: formData.productionCapacity,
        whyJoin: formData.whyJoin,
        portfolioImages: formData.portfolioImages,
        termsAccepted: true,
      };

      await submitMakerApplication(applicationData);
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      setError(err.message || translate("makerApplication.errors.submit"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={classes.page}>
        <div className={classes.loader}>
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (existingApplication) {
    return (
      <div className={classes.page}>
        <div className={classes.card}>
          <h1>{translate("makerApplication.existing.title")}</h1>
          <p>
            {translate("makerApplication.existing.message")}:{" "}
            <strong>{existingApplication.status}</strong>
          </p>
          {existingApplication.status === "pending" && (
            <p>{translate("makerApplication.existing.pending")}</p>
          )}
          {existingApplication.status === "approved" && (
            <p>{translate("makerApplication.existing.approved")}</p>
          )}
          <Button variant="contained" onClick={() => navigate("/profile")}>
            {translate("makerApplication.backToProfile")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.page}>
      <div className={classes.card}>
        <h1>{translate("makerApplication.title")}</h1>
        <p className={classes.subtitle}>{translate("makerApplication.subtitle")}</p>

        {error && <Alert severity="error">{error}</Alert>}
        {success && (
          <Alert severity="success">{translate("makerApplication.success")}</Alert>
        )}

        <form onSubmit={handleSubmit} className={classes.form}>
          {/* What do you want to sell */}
          <div className={classes.formGroup}>
            <label>{translate("makerApplication.whatToSell")} *</label>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={formData.whatToSell}
              onChange={(e) => handleInputChange("whatToSell", e.target.value)}
              placeholder={translate("makerApplication.whatToSellPlaceholder")}
            />
          </div>

          {/* Machines */}
          <div className={classes.formGroup}>
            <label>{translate("makerApplication.machines")} *</label>
            {formData.machines.map((machine, index) => (
              <div key={index} className={classes.machineRow}>
                <select
                  value={machine.brand}
                  onChange={(e) => handleMachineChange(index, "brand", e.target.value)}
                  className={classes.select}
                >
                  <option value="">{translate("makerApplication.selectBrand")}</option>
                  {MACHINE_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                <TextField
                  placeholder={translate("makerApplication.model")}
                  value={machine.model}
                  onChange={(e) => handleMachineChange(index, "model", e.target.value)}
                  className={classes.input}
                />
                <TextField
                  type="number"
                  placeholder={translate("makerApplication.year")}
                  value={machine.year}
                  onChange={(e) => handleMachineChange(index, "year", e.target.value)}
                  className={classes.inputSmall}
                />
                <TextField
                  type="number"
                  placeholder={translate("makerApplication.age")}
                  value={machine.age}
                  onChange={(e) => handleMachineChange(index, "age", e.target.value)}
                  className={classes.inputSmall}
                />
                {formData.machines.length > 1 && (
                  <Button onClick={() => removeMachine(index)} color="error">
                    {translate("makerApplication.remove")}
                  </Button>
                )}
              </div>
            ))}
            <Button onClick={addMachine} variant="outlined" className={classes.addButton}>
              {translate("makerApplication.addMachine")}
            </Button>
          </div>

          {/* Machine Count */}
          <div className={classes.formGroup}>
            <label>{translate("makerApplication.machineCount")} *</label>
            <TextField
              type="number"
              value={formData.machineCount}
              onChange={(e) => handleInputChange("machineCount", e.target.value)}
              inputProps={{ min: 1 }}
            />
          </div>

          {/* Filament Brands */}
          <div className={classes.formGroup}>
            <label>{translate("makerApplication.filamentBrands")} *</label>
            <div className={classes.checkboxGroup}>
              {FILAMENT_BRANDS.map((brand) => (
                <FormControlLabel
                  key={brand}
                  control={
                    <Checkbox
                      checked={formData.filamentBrands.includes(brand)}
                      onChange={() => handleFilamentBrandToggle(brand)}
                    />
                  }
                  label={brand}
                />
              ))}
            </div>
            {formData.filamentBrands.includes("Other") && (
              <TextField
                fullWidth
                placeholder={translate("makerApplication.otherFilamentBrand")}
                value={formData.otherFilamentBrand}
                onChange={(e) => handleInputChange("otherFilamentBrand", e.target.value)}
                className={classes.mt2}
              />
            )}
            <p className={classes.note}>
              {translate("makerApplication.filamentNote")}
            </p>
          </div>

          {/* Location */}
          <div className={classes.formGroup}>
            <label>{translate("makerApplication.location")} *</label>
            <TextField
              fullWidth
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder={translate("makerApplication.locationPlaceholder")}
            />
          </div>

          {/* Experience */}
          <div className={classes.formGroup}>
            <label>{translate("makerApplication.experience")}</label>
            <TextField
              type="number"
              value={formData.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              placeholder={translate("makerApplication.experiencePlaceholder")}
              inputProps={{ min: 0 }}
            />
          </div>

          {/* Production Capacity */}
          <div className={classes.formGroup}>
            <label>{translate("makerApplication.productionCapacity")}</label>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={formData.productionCapacity}
              onChange={(e) => handleInputChange("productionCapacity", e.target.value)}
              placeholder={translate("makerApplication.productionCapacityPlaceholder")}
            />
          </div>

          {/* Why Join */}
          <div className={classes.formGroup}>
            <label>{translate("makerApplication.whyJoin")}</label>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={formData.whyJoin}
              onChange={(e) => handleInputChange("whyJoin", e.target.value)}
              placeholder={translate("makerApplication.whyJoinPlaceholder")}
            />
          </div>

          {/* Portfolio Images */}
          <div className={classes.formGroup}>
            <label>{translate("makerApplication.portfolio")} *</label>
            <DragAndDrop
              text={translate("makerApplication.portfolioText")}
              onChange={handlePortfolioImages}
            />
            <p className={classes.note}>
              {translate("makerApplication.portfolioNote")}
            </p>
          </div>

          {/* Terms */}
          <div className={classes.formGroup}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.termsAccepted}
                  onChange={(e) => handleInputChange("termsAccepted", e.target.checked)}
                />
              }
              label={translate("makerApplication.terms")}
            />
          </div>

          {/* Submit */}
          <div className={classes.actions}>
            <CustomButton
              type="submit"
              text={translate("makerApplication.submit")}
              width="200px"
              height="50px"
              disabled={submitting}
            />
            <Button onClick={() => navigate("/profile")} variant="outlined">
              {translate("makerApplication.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MakerApplication;

