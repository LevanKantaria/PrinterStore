import React, { useState } from "react";
import { useSelector } from "react-redux";
import classes from "./Contact.module.css";
import translate from "../components/translate";
import { API_URL } from "../API_URL";
import axios from "axios";

const Contact = () => {
  const currentLang = useSelector((state) => state.lang.lang);
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: user?.displayName || user?.email?.split("@")[0] || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  
  const [status, setStatus] = useState({
    type: null, // 'success' or 'error'
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await axios.post(`${API_URL}/api/contact`, formData);
      
      if (response.status === 200 || response.status === 201) {
        setStatus({
          type: "success",
          message: translate("contact.success"),
        });
        setFormData({
          name: user?.displayName || user?.email?.split("@")[0] || "",
          email: user?.email || "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus({
        type: "error",
        message: translate("contact.error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={classes.contactPage}>
      {/* Hero Section */}
      <section className={classes.hero}>
        <div className={classes.heroContent}>
          <h1 className={classes.heroTitle}>{translate("contact.hero.title")}</h1>
          <p className={classes.heroSubtitle}>{translate("contact.hero.subtitle")}</p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className={classes.section}>
        <div className={classes.container}>
          <div className={classes.formWrapper}>
            <div className={classes.formHeader}>
              <h2 className={classes.sectionTitle}>{translate("contact.form.title")}</h2>
              <p className={classes.formDescription}>{translate("contact.form.description")}</p>
            </div>

            <form className={classes.form} onSubmit={handleSubmit}>
              <div className={classes.formRow}>
                <div className={classes.formGroup}>
                  <label htmlFor="name" className={classes.label}>
                    {translate("contact.form.name")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={classes.input}
                    required
                    placeholder={translate("contact.form.namePlaceholder")}
                  />
                </div>

                <div className={classes.formGroup}>
                  <label htmlFor="email" className={classes.label}>
                    {translate("contact.form.email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={classes.input}
                    required
                    placeholder={translate("contact.form.emailPlaceholder")}
                  />
                </div>
              </div>

              <div className={classes.formGroup}>
                <label htmlFor="subject" className={classes.label}>
                  {translate("contact.form.subject")}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={classes.input}
                  required
                  placeholder={translate("contact.form.subjectPlaceholder")}
                />
              </div>

              <div className={classes.formGroup}>
                <label htmlFor="message" className={classes.label}>
                  {translate("contact.form.message")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={classes.textarea}
                  required
                  rows="6"
                  placeholder={translate("contact.form.messagePlaceholder")}
                />
              </div>

              {status.type && (
                <div
                  className={`${classes.alert} ${
                    status.type === "success" ? classes.alertSuccess : classes.alertError
                  }`}
                >
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                className={classes.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? translate("contact.form.sending") : translate("contact.form.submit")}
              </button>
            </form>
          </div>

          {/* Contact Info Section */}
          <div className={classes.infoSection}>
            <div className={classes.infoCard}>
              <div className={classes.infoIcon}>📧</div>
              <h3 className={classes.infoTitle}>{translate("contact.info.email.title")}</h3>
              <p className={classes.infoText}>{translate("contact.info.email.text")}</p>
            </div>

            <div className={classes.infoCard}>
              <div className={classes.infoIcon}>📍</div>
              <h3 className={classes.infoTitle}>{translate("contact.info.location.title")}</h3>
              <p className={classes.infoText}>{translate("contact.info.location.text")}</p>
            </div>

            <div className={classes.infoCard}>
              <div className={classes.infoIcon}>⏰</div>
              <h3 className={classes.infoTitle}>{translate("contact.info.hours.title")}</h3>
              <p className={classes.infoText}>{translate("contact.info.hours.text")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

