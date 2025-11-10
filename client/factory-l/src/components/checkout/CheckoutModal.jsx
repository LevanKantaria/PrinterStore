import React, { useEffect, useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { getProfile } from "../../api/profile";
import { createOrder } from "../../api/orders";
import { ApiError } from "../../api/http";
import classes from "./CheckoutModal.module.css";

const BANK_DETAILS = {
  accountName: "Factory L LLC",
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

const CheckoutModal = ({ open, onClose, cartItems, onOrderPlaced }) => {
  const navigate = useNavigate();
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
          setError(err.message || "Unable to load saved profile details.");
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
      setError("Your cart is empty.");
      return;
    }

    if (!form.fullName || !form.line1 || !form.city || !form.phone) {
      setError("Please fill in your full name, address and phone number.");
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
      };

      const order = await createOrder(payload);
      setSuccessOrder(order);
    } catch (err) {
      console.error("[checkout] createOrder failed", err);
      if (err instanceof ApiError) {
        setError(err.payload?.message || err.message);
      } else {
        setError(err.message || "Unable to create order. Please try again.");
      }
    } finally {
      setLoadingOrder(false);
    }
  };

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: cartCurrency || "GEL",
      }).format(Number(amount || 0));
    } catch {
      return `${cartCurrency || "GEL"} ${Number(amount || 0).toFixed(2)}`;
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
              <h2>Confirm your order</h2>
              <p>Please review your shipping details and complete the manual bank transfer to finalize.</p>
            </header>

            <form className={classes.form} onSubmit={handleSubmit}>
              <div className={classes.formSection}>
                <h3>Shipping details</h3>
                <div className={classes.fieldGroup}>
                  <label htmlFor="fullName">Full name*</label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className={classes.fieldGroup}>
                  <label htmlFor="company">Company</label>
                  <input
                    id="company"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Company (optional)"
                  />
                </div>
                <div className={classes.fieldGroup}>
                  <label htmlFor="line1">Address line*</label>
                  <input
                    id="line1"
                    name="line1"
                    value={form.line1}
                    onChange={handleChange}
                    placeholder="Street and number"
                    required
                  />
                </div>
                <div className={classes.fieldGroup}>
                  <label htmlFor="line2">Address line 2</label>
                  <input
                    id="line2"
                    name="line2"
                    value={form.line2}
                    onChange={handleChange}
                    placeholder="Apt, suite, etc. (optional)"
                  />
                </div>
                <div className={classes.fieldRow}>
                  <div className={classes.fieldGroup}>
                    <label htmlFor="city">City*</label>
                    <input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className={classes.fieldGroup}>
                    <label htmlFor="phone">Phone*</label>
                    <input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+995 ..."
                      required
                    />
                  </div>
                </div>

                <div className={classes.fieldGroup}>
                  <label htmlFor="customerNotes">Order notes</label>
                  <textarea
                    id="customerNotes"
                    name="customerNotes"
                    value={form.customerNotes}
                    onChange={handleChange}
                    placeholder="Add special instructions (optional)"
                    rows={3}
                  />
                </div>
              </div>

              <div className={classes.summarySection}>
                <h3>Order summary</h3>
                <ul className={classes.summaryItems}>
                  {cartItems.map((item) => (
                    <li key={`${item._id || item.id}-${item.color || "default"}`} className={classes.summaryItem}>
                      <div>
                        <span className={classes.summaryName}>{item.name}</span>
                        <span className={classes.summaryMeta}>
                          Qty {item.quantity}
                          {item.color ? ` • ${item.color}` : ""}
                        </span>
                      </div>
                      <span>{formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}</span>
                    </li>
                  ))}
                </ul>
                <div className={classes.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className={classes.summaryRow}>
                  <span>Shipping</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className={classes.summaryDivider} />
                <div className={classes.summaryRow}>
                  <span className={classes.summaryTotal}>Total</span>
                  <span className={classes.summaryTotal}>{formatCurrency(subtotal)}</span>
                </div>
              </div>

              {error && <div className={classes.error}>{error}</div>}

              <div className={classes.actions}>
                <button type="button" className={classes.secondaryButton} onClick={handleClose} disabled={loadingOrder}>
                  Cancel
                </button>
                <button type="submit" className={classes.primaryButton} disabled={loadingOrder || loadingProfile}>
                  {loadingOrder ? "Placing order…" : "Place order & show bank details"}
                </button>
              </div>
            </form>
          </>
        )}

        {successOrder && (
          <div className={classes.successState}>
            <header className={classes.header}>
              <h2>Order created</h2>
              <p>
                Include the payment reference below when you complete the bank transfer. Payments usually register within
                30 minutes—once we confirm the funds we’ll update the order status and get production underway.
              </p>
            </header>

            <div className={classes.referenceCard}>
              <span>Payment reference</span>
              <button
                type="button"
                className={classes.copyButton}
                onClick={() => copyToClipboard(successOrder.orderId)}
                aria-label="Copy payment reference"
              >
                <strong>{successOrder.orderId}</strong>
                <ContentCopyIcon fontSize="small" />
                <span className={classes.copyHint}>Copy</span>
              </button>
            </div>

            <div className={classes.bankDetails}>
              <h3>Transfer details</h3>
              <p className={classes.instructions}>
                Make a bank transfer for the total amount using the reference code above. If you’ve already paid, the status
                will update automatically as soon as the transfer clears; feel free to reply to the confirmation email if you
                need a hand.
              </p>
              <ul>
                <li>
                  <span>Payee</span>
                  <strong>{BANK_DETAILS.accountName}</strong>
                </li>
                <li>
                  <span>Bank</span>
                  <strong>{BANK_DETAILS.bankName}</strong>
                </li>
                <li>
                  <span>Bank address</span>
                  <strong>{BANK_DETAILS.bankAddress}</strong>
                </li>
                <li>
                  <span>Account number</span>
                  <button
                    type="button"
                    className={classes.copyButton}
                    onClick={() => copyToClipboard(BANK_DETAILS.accountNumber)}
                    aria-label="Copy account number"
                  >
                    <strong>{BANK_DETAILS.accountNumber}</strong>
                    <ContentCopyIcon fontSize="small" />
                    <span className={classes.copyHint}>Copy</span>
                  </button>
                </li>
                <li>
                  <span>SWIFT</span>
                  <strong>{BANK_DETAILS.swift}</strong>
                </li>
                <li>
                  <span>Amount</span>
                  <strong>{formatCurrency(successOrder.total)}</strong>
                </li>
              </ul>
            </div>

            <div className={classes.actions}>
              <button type="button" className={classes.secondaryButton} onClick={handleClose}>
                Close
              </button>
              <button type="button" className={classes.primaryButton} onClick={handleGoToProfile}>
                View order history
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

CheckoutModal.defaultProps = {
  onOrderPlaced: undefined,
};

export default CheckoutModal;

