import React, { useEffect, useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { getProfile } from "../../api/profile";
import { createOrder } from "../../api/orders";
import { ApiError } from "../../api/http";
import classes from "./CheckoutModal.module.css";
import translate from "../translate";

const BANK_DETAILS = {
  accountName: "Makers Hub LLC",
  bankName: "Mock National Bank",
  bankAddress: "12 Greenfield Ave, Tbilisi, Georgia",
  accountNumber: "01904917",
  swift: "MNBGGE22",
};

const defaultAddress = {
  fullName: "",
  company: "",
  line1: "",
  line2: "",
  city: "",
  phone: "",
};

const CheckoutModal = ({ open, onClose, cartItems, onOrderPlaced = undefined }) => {
  const navigate = useNavigate();
  // Subscribe to language changes to trigger re-render
  const currentLang = useSelector((state) => state.lang.lang);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);
  const [form, setForm] = useState({
    ...defaultAddress,
    customerNotes: "",
  });

  const cartCurrency = useMemo(() => {
    if (!cartItems?.length) return "GEL";
    return cartItems[0].currency || "GEL";
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
  }, [cartItems]);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setError("");
      setSuccessOrder(null);
      setLoadingOrder(false);
      return;
    }

    let mounted = true;

    const loadProfile = async () => {
      setLoadingProfile(true);
      setError("");
      try {
        const profile = await getProfile();
        if (!mounted) return;
        const shipping = profile?.shippingAddress || {};
        setForm((prev) => ({
          ...prev,
          fullName: shipping.fullName || profile?.displayName || prev.fullName,
          company: shipping.company || profile?.company || prev.company,
          line1: shipping.line1 || prev.line1,
          line2: shipping.line2 || prev.line2,
          city: shipping.city || prev.city,
          phone: shipping.phone || profile?.phone || prev.phone,
        }));
      } catch (err) {
        if (mounted) {
          console.error("[checkout] loadProfile failed", err);
          setError(err.message || translate('checkout.profileError'));
        }
      } finally {
        if (mounted) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loadingOrder) return;

    if (!cartItems.length) {
      setError(translate('checkout.cartEmpty'));
      return;
    }

    if (!form.fullName || !form.line1 || !form.city || !form.phone) {
      setError(translate('checkout.fillRequired'));
      return;
    }

    setLoadingOrder(true);
    setError("");

    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item._id || item.id || item.productId,
          name: item.name,
          material: item.material,
          color: item.color,
          quantity: Number(item.quantity || 1),
          makerId: item.makerId,
          makerName: item.makerName,
          unitPrice: Number(item.price || 0),
          lineTotal: Number(item.price || 0) * Number(item.quantity || 0),
          image: item.image || item.images?.[0] || item.thumbnail || "",
        })),
        shippingAddress: {
          fullName: form.fullName,
          company: form.company,
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          phone: form.phone,
        },
        customerNotes: form.customerNotes,
        currency: cartCurrency,
        shippingFee: 0,
        language: currentLang || 'KA', // Include current language
      };

      const order = await createOrder(payload);
      setSuccessOrder(order);
    } catch (err) {
      console.error("[checkout] createOrder failed", err);
      if (err instanceof ApiError) {
        setError(err.payload?.message || err.message);
      } else {
        setError(err.message || translate('checkout.orderError'));
      }
    } finally {
      setLoadingOrder(false);
    }
  };

  const formatCurrency = (amount) => {
    const currency = cartCurrency || "GEL";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency,
      }).format(Number(amount || 0));
    } catch {
      const symbol = currency === "GEL" ? "₾" : currency;
      return `${symbol} ${Number(amount || 0).toFixed(2)}`;
    }
  };

  const handleClose = () => {
    if (successOrder && onOrderPlaced) {
      onOrderPlaced(successOrder);
    }
    onClose();
  };

  const handleGoToProfile = () => {
    if (successOrder && onOrderPlaced) {
      onOrderPlaced(successOrder);
    }
    onClose();
    navigate("/profile");
  };

  return (
    <div className={classes.overlay}>
      <div className={classes.modal}>
        <button type="button" className={classes.closeButton} onClick={handleClose} aria-label="Close checkout">
          ×
        </button>

        {!successOrder && (
          <>
            <header className={classes.header}>
              <h2>{translate('checkout.confirmOrder')}</h2>
              <p>{translate('checkout.confirmDescription')}</p>
            </header>

            <form className={classes.form} onSubmit={handleSubmit}>
              <div className={classes.formSection}>
                <h3>{translate('checkout.shippingDetails')}</h3>
                <div className={classes.fieldGroup}>
                  <label htmlFor="fullName">{translate('checkout.fullName')}</label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder={translate('checkout.fullNamePlaceholder')}
                    required
                  />
                </div>
                <div className={classes.fieldGroup}>
                  <label htmlFor="company">{translate('checkout.company')}</label>
                  <input
                    id="company"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder={translate('checkout.companyPlaceholder')}
                  />
                </div>
                <div className={classes.fieldGroup}>
                  <label htmlFor="line1">{translate('checkout.addressLine')}</label>
                  <input
                    id="line1"
                    name="line1"
                    value={form.line1}
                    onChange={handleChange}
                    placeholder={translate('checkout.addressLinePlaceholder')}
                    required
                  />
                </div>
                <div className={classes.fieldGroup}>
                  <label htmlFor="line2">{translate('checkout.addressLine2')}</label>
                  <input
                    id="line2"
                    name="line2"
                    value={form.line2}
                    onChange={handleChange}
                    placeholder={translate('checkout.addressLine2Placeholder')}
                  />
                </div>
                <div className={classes.fieldRow}>
                  <div className={classes.fieldGroup}>
                    <label htmlFor="city">{translate('checkout.city')}</label>
                    <input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder={translate('checkout.cityPlaceholder')}
                      required
                    />
                  </div>
                  <div className={classes.fieldGroup}>
                    <label htmlFor="phone">{translate('checkout.phone')}</label>
                    <input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={translate('checkout.phonePlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className={classes.fieldGroup}>
                  <label htmlFor="customerNotes">{translate('checkout.orderNotes')}</label>
                  <textarea
                    id="customerNotes"
                    name="customerNotes"
                    value={form.customerNotes}
                    onChange={handleChange}
                    placeholder={translate('checkout.orderNotesPlaceholder')}
                    rows={3}
                  />
                </div>
              </div>

              <div className={classes.summarySection}>
                <h3>{translate('checkout.orderSummary')}</h3>
                <ul className={classes.summaryItems}>
                  {cartItems.map((item) => (
                    <li key={`${item._id || item.id}-${item.color || "default"}`} className={classes.summaryItem}>
                      <div>
                        <span className={classes.summaryName}>{item.name}</span>
                        <span className={classes.summaryMeta}>
                          {translate('checkout.qty')} {item.quantity}
                          {item.color ? ` • ${item.color}` : ""}
                        </span>
                      </div>
                      <span>{formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}</span>
                    </li>
                  ))}
                </ul>
                <div className={classes.summaryRow}>
                  <span>{translate('checkout.subtotal')}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className={classes.summaryRow}>
                  <span>{translate('checkout.shipping')}</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className={classes.summaryDivider} />
                <div className={classes.summaryRow}>
                  <span className={classes.summaryTotal}>{translate('checkout.total')}</span>
                  <span className={classes.summaryTotal}>{formatCurrency(subtotal)}</span>
                </div>
              </div>

              {error && <div className={classes.error}>{error}</div>}

              <div className={classes.actions}>
                <button type="button" className={classes.secondaryButton} onClick={handleClose} disabled={loadingOrder}>
                  {translate('checkout.cancel')}
                </button>
                <button type="submit" className={classes.primaryButton} disabled={loadingOrder || loadingProfile}>
                  {loadingOrder ? translate('checkout.placingOrder') : translate('checkout.placeOrder')}
                </button>
              </div>
            </form>
          </>
        )}

        {successOrder && (
          <div className={classes.successState}>
            <header className={classes.header}>
              <h2>{translate('checkout.orderCreated')}</h2>
              <p>
                {translate('checkout.orderCreatedDescription')}
              </p>
            </header>

            <div className={classes.referenceCard}>
              <span>{translate('checkout.paymentReference')}</span>
              <button
                type="button"
                className={classes.copyButton}
                onClick={() => copyToClipboard(successOrder.orderId)}
                aria-label={translate('checkout.paymentReference')}
              >
                <strong>{successOrder.orderId}</strong>
                <ContentCopyIcon fontSize="small" />
                <span className={classes.copyHint}>{translate('checkout.copy')}</span>
              </button>
            </div>

            <div className={classes.bankDetails}>
              <h3>{translate('checkout.transferDetails')}</h3>
              <p className={classes.instructions}>
                {translate('checkout.transferInstructions')}
              </p>
              <ul>
                <li>
                  <span>{translate('checkout.payee')}</span>
                  <strong>{BANK_DETAILS.accountName}</strong>
                </li>
                <li>
                  <span>{translate('checkout.bank')}</span>
                  <strong>{BANK_DETAILS.bankName}</strong>
                </li>
                <li>
                  <span>{translate('checkout.bankAddress')}</span>
                  <strong>{BANK_DETAILS.bankAddress}</strong>
                </li>
                <li>
                  <span>{translate('checkout.accountNumber')}</span>
                  <button
                    type="button"
                    className={classes.copyButton}
                    onClick={() => copyToClipboard(BANK_DETAILS.accountNumber)}
                    aria-label={translate('checkout.accountNumber')}
                  >
                    <strong>{BANK_DETAILS.accountNumber}</strong>
                    <ContentCopyIcon fontSize="small" />
                    <span className={classes.copyHint}>{translate('checkout.copy')}</span>
                  </button>
                </li>
                <li>
                  <span>{translate('checkout.swift')}</span>
                  <strong>{BANK_DETAILS.swift}</strong>
                </li>
                <li>
                  <span>{translate('checkout.amount')}</span>
                  <strong>{formatCurrency(successOrder.total)}</strong>
                </li>
              </ul>
            </div>

            <div className={classes.actions}>
              <button type="button" className={classes.secondaryButton} onClick={handleClose}>
                {translate('checkout.close')}
              </button>
              <button type="button" className={classes.primaryButton} onClick={handleGoToProfile}>
                {translate('checkout.viewOrderHistory')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

CheckoutModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cartItems: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      quantity: PropTypes.number.isRequired,
      currency: PropTypes.string,
    })
  ).isRequired,
  onOrderPlaced: PropTypes.func,
};

export default CheckoutModal;

