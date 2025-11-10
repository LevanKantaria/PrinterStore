import React, { useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import classes from "./OrderDetailsModal.module.css";

const BANK_DETAILS = {
  accountName: "Factory L LLC",
  bankName: "Mock National Bank",
  bankAddress: "12 Greenfield Ave, Tbilisi, Georgia",
  accountNumber: "01904917",
  swift: "MNBGGE22",
};

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const normalized = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`${classes.status} ${classes[`status-${normalized}`] || ""}`}>{status}</span>;
};

StatusBadge.propTypes = {
  status: PropTypes.string,
};

StatusBadge.defaultProps = {
  status: "",
};

const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className={classes.infoRow}>
      <span className={classes.infoLabel}>{label}</span>
      <span className={classes.infoValue}>{value}</span>
    </div>
  );
};

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

InfoRow.defaultProps = {
  value: "",
};

const formatDateTime = (isoDate) => {
  if (!isoDate) return "—";
  try {
    return new Date(isoDate).toLocaleString();
  } catch {
    return isoDate;
  }
};

const formatCurrency = (value, currency = "GEL") => {
  if (value == null || Number.isNaN(Number(value))) {
    return `${currency} 0.00`;
  }
  return `${currency} ${Number(value).toFixed(2)}`;
};

const OrderDetailsModal = ({ open, order, onClose }) => {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    let previousOverflow;
    let previousRootOverflow;
    if (typeof document !== "undefined") {
      previousOverflow = document.body.style.overflow;
      previousRootOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (typeof document !== "undefined") {
        document.body.style.overflow = previousOverflow || "";
        document.documentElement.style.overflow = previousRootOverflow || "";
      }
    };
  }, [open, onClose]);

  const copyToClipboard = useCallback(async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("[OrderDetailsModal] copy failed", error);
    }
  }, []);

  if (!open || !order) return null;

  const shipping = order?.shippingAddress || {};
  const billing = order?.billingAddress || {};
  const status = order.status || "Pending";
  const normalizedStatus = status.toLowerCase();
  const isAwaitingPayment = ["pending", "awaiting payment", "awaiting_payment", "awaiting-payment", "pending payment"].includes(
    normalizedStatus
  );

  return ReactDOM.createPortal(
    <div className={classes.overlay} onClick={onClose} role="presentation">
      <div
        className={classes.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
      >
        <button
          type="button"
          className={classes.closeButton}
          onClick={onClose}
          aria-label="Close order details"
        >
          ×
        </button>

        <div className={classes.modalBody}>
          <header className={classes.header}>
            <div className={classes.headerTop}>
              <h2 id="order-details-title">Order {order.orderId}</h2>
              <StatusBadge status={status} />
            </div>
            <p>
              Placed on{" "}
              <time dateTime={order.createdAt}>
                {formatDateTime(order.createdAt)}
              </time>
            </p>
          </header>

          {isAwaitingPayment && (
            <section className={`${classes.section} ${classes.paymentReminder}`}>
              <h3>Awaiting your bank transfer</h3>
              <p className={classes.paymentIntro}>
                We’re holding this order until the payment arrives. Please transfer the total using the reference below so
                we can move your project into production. Bank transfers usually show up within 30 minutes; if you’ve already
                paid, the status will update automatically once we confirm the funds.
              </p>

              <div className={classes.referenceCard}>
                <span className={classes.referenceLabel}>Payment reference</span>
                <button
                  type="button"
                  className={classes.copyButton}
                  onClick={() => copyToClipboard(order.orderId)}
                >
                  <strong>{order.orderId}</strong>
                  <ContentCopyIcon fontSize="small" className={classes.copyIcon} />
                  <span className={classes.copyHint}>Copy</span>
                </button>
              </div>

              <ul className={classes.bankList}>
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
                  >
                    <strong>{BANK_DETAILS.accountNumber}</strong>
                    <ContentCopyIcon fontSize="small" className={classes.copyIcon} />
                    <span className={classes.copyHint}>Copy</span>
                  </button>
                </li>
                <li>
                  <span>SWIFT</span>
                  <strong>{BANK_DETAILS.swift}</strong>
                </li>
                <li>
                  <span>Amount</span>
                  <strong>{formatCurrency(order.total, order.currency)}</strong>
                </li>
              </ul>
              <p className={classes.paymentHelp}>
                If it’s been more than 30 minutes since you transferred the funds, reply to the confirmation email and we’ll
                prioritize the review.
              </p>
            </section>
          )}

          <section className={classes.section}>
            <h3>Items</h3>
            <ul className={classes.itemsList}>
              {order.items.map((item, index) => (
                <li key={item.productId || `${order.orderId}-modal-${index}`} className={classes.itemRow}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className={classes.itemImage} />
                  ) : (
                    <div className={classes.itemImagePlaceholder} aria-hidden="true">
                      🧩
                    </div>
                  )}
                  <div className={classes.itemInfo}>
                    <strong>{item.name}</strong>
                    <span className={classes.itemMeta}>
                      Qty {item.quantity}
                      {item.color ? ` • ${item.color}` : ""}
                      {item.material ? ` • ${item.material}` : ""}
                    </span>
                  </div>
                  <div className={classes.itemAmount}>
                    {formatCurrency(
                      item.lineTotal != null
                        ? item.lineTotal
                        : Number(item.unitPrice || 0) * Number(item.quantity || 0),
                      order.currency
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={classes.section}>
            <h3>Shipping</h3>
            <div className={classes.addressBlock}>
              <InfoRow label="Recipient" value={shipping.fullName} />
              <InfoRow label="Company" value={shipping.company} />
              <InfoRow label="Address line 1" value={shipping.line1} />
              <InfoRow label="Address line 2" value={shipping.line2} />
              <InfoRow label="City" value={shipping.city} />
              <InfoRow label="Phone" value={shipping.phone} />
            </div>
          </section>

          <section className={classes.section}>
            <h3>Billing</h3>
            <div className={classes.addressBlock}>
              <InfoRow label="Recipient" value={billing.fullName || shipping.fullName} />
              <InfoRow label="Company" value={billing.company || shipping.company} />
              <InfoRow label="Address line 1" value={billing.line1 || shipping.line1} />
              <InfoRow label="Address line 2" value={billing.line2 || shipping.line2} />
              <InfoRow label="City" value={billing.city || shipping.city} />
              <InfoRow label="Phone" value={billing.phone || shipping.phone} />
            </div>
          </section>

          {order.customerNotes && (
            <section className={classes.section}>
              <h3>Customer notes</h3>
              <p className={classes.notes}>{order.customerNotes}</p>
            </section>
          )}

          <section className={classes.summary}>
            <div>
              <span className={classes.summaryLabel}>Subtotal</span>
              <span className={classes.summaryValue}>{formatCurrency(order.subtotal, order.currency)}</span>
            </div>
            <div>
              <span className={classes.summaryLabel}>Shipping</span>
              <span className={classes.summaryValue}>{formatCurrency(order.shippingFee, order.currency)}</span>
            </div>
            <div className={classes.summaryDivider} />
            <div>
              <span className={classes.summaryTotalLabel}>Total</span>
              <span className={classes.summaryTotalValue}>{formatCurrency(order.total, order.currency)}</span>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
};

OrderDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  order: PropTypes.shape({
    orderId: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    currency: PropTypes.string,
    subtotal: PropTypes.number,
    shippingFee: PropTypes.number,
    total: PropTypes.number,
    customerNotes: PropTypes.string,
    status: PropTypes.string,
    shippingAddress: PropTypes.shape({
      fullName: PropTypes.string,
      company: PropTypes.string,
      line1: PropTypes.string,
      line2: PropTypes.string,
      city: PropTypes.string,
      phone: PropTypes.string,
    }),
    billingAddress: PropTypes.shape({
      fullName: PropTypes.string,
      company: PropTypes.string,
      line1: PropTypes.string,
      line2: PropTypes.string,
      city: PropTypes.string,
      phone: PropTypes.string,
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        productId: PropTypes.string,
        name: PropTypes.string.isRequired,
        material: PropTypes.string,
        color: PropTypes.string,
        image: PropTypes.string,
        quantity: PropTypes.number.isRequired,
        unitPrice: PropTypes.number,
        lineTotal: PropTypes.number,
      })
    ).isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

OrderDetailsModal.defaultProps = {
  order: null,
};

export default OrderDetailsModal;

