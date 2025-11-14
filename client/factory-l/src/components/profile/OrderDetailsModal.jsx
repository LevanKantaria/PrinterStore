import React, { useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import classes from "./OrderDetailsModal.module.css";
import translate from "../translate";

const BANK_DETAILS = {
  accountName: "Makers Hub LLC",
  bankName: "Mock National Bank",
  bankAddress: "12 Greenfield Ave, Tbilisi, Georgia",
  accountNumber: "01904917",
  swift: "MNBGGE22",
};

const StatusBadge = ({ status = "" }) => {
  if (!status) return null;
  const normalized = status.toLowerCase().replace(/\s+/g, "-");
  const statusMap = {
    'awaiting_payment': 'profile.status.awaitingPayment',
    'awaiting-payment': 'profile.status.awaitingPayment',
    'payment_received': 'profile.status.paymentReceived',
    'payment-received': 'profile.status.paymentReceived',
    'processing': 'profile.status.processing',
    'fulfilled': 'profile.status.fulfilled',
    'cancelled': 'profile.status.cancelled',
  };
  const key = statusMap[normalized] || null;
  const label = key ? translate(key) : status;
  return <span className={`${classes.status} ${classes[`status-${normalized}`] || ""}`}>{label}</span>;
};

StatusBadge.propTypes = {
  status: PropTypes.string,
};

const InfoRow = ({ label, value = "" }) => {
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

const formatDateTime = (isoDate) => {
  if (!isoDate) return "—";
  try {
    return new Date(isoDate).toLocaleString();
  } catch {
    return isoDate;
  }
};

const formatCurrency = (value, currency = "GEL") => {
  const symbol = currency === "GEL" ? "₾" : currency;
  if (value == null || Number.isNaN(Number(value))) {
    return `${symbol} 0.00`;
  }
  return `${symbol} ${Number(value).toFixed(2)}`;
};

const OrderDetailsModal = ({ open, order = null, onClose }) => {
  // Subscribe to language changes to trigger re-render
  const currentLang = useSelector((state) => state.lang.lang);
  
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
          aria-label={translate('profile.orderDetails.close')}
        >
          ×
        </button>

        <div className={classes.modalBody}>
          <header className={classes.header}>
            <div className={classes.headerTop}>
              <h2 id="order-details-title">{translate('profile.order')} {order.orderId}</h2>
              <StatusBadge status={status} />
            </div>
            <p>
              {translate('profile.placedOn')}{" "}
              <time dateTime={order.createdAt}>
                {formatDateTime(order.createdAt)}
              </time>
            </p>
          </header>

          {isAwaitingPayment && (
            <section className={`${classes.section} ${classes.paymentReminder}`}>
              <h3>{translate('profile.orderDetails.awaitingTransfer')}</h3>
              <p className={classes.paymentIntro}>
                {translate('profile.orderDetails.paymentIntro')}
              </p>

              <div className={classes.referenceCard}>
                <span className={classes.referenceLabel}>{translate('profile.orderDetails.paymentReference')}</span>
                <button
                  type="button"
                  className={classes.copyButton}
                  onClick={() => copyToClipboard(order.orderId)}
                >
                  <strong>{order.orderId}</strong>
                  <ContentCopyIcon fontSize="small" className={classes.copyIcon} />
                  <span className={classes.copyHint}>{translate('profile.orderDetails.copy')}</span>
                </button>
              </div>

              <ul className={classes.bankList}>
                <li>
                  <span>{translate('profile.orderDetails.payee')}</span>
                  <strong>{BANK_DETAILS.accountName}</strong>
                </li>
                <li>
                  <span>{translate('profile.orderDetails.bank')}</span>
                  <strong>{BANK_DETAILS.bankName}</strong>
                </li>
                <li>
                  <span>{translate('profile.orderDetails.bankAddress')}</span>
                  <strong>{BANK_DETAILS.bankAddress}</strong>
                </li>
                <li>
                  <span>{translate('profile.orderDetails.accountNumber')}</span>
                  <button
                    type="button"
                    className={classes.copyButton}
                    onClick={() => copyToClipboard(BANK_DETAILS.accountNumber)}
                  >
                    <strong>{BANK_DETAILS.accountNumber}</strong>
                    <ContentCopyIcon fontSize="small" className={classes.copyIcon} />
                    <span className={classes.copyHint}>{translate('profile.orderDetails.copy')}</span>
                  </button>
                </li>
                <li>
                  <span>{translate('profile.orderDetails.swift')}</span>
                  <strong>{BANK_DETAILS.swift}</strong>
                </li>
                <li>
                  <span>{translate('profile.orderDetails.amount')}</span>
                  <strong>{formatCurrency(order.total, order.currency)}</strong>
                </li>
              </ul>
              <p className={classes.paymentHelp}>
                {translate('profile.orderDetails.paymentHelp')}
              </p>
            </section>
          )}

          <section className={classes.section}>
            <h3>{translate('profile.orderDetails.items')}</h3>
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
                      {translate('profile.qty')} {item.quantity}
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
            <h3>{translate('profile.orderDetails.shipping')}</h3>
            <div className={classes.addressBlock}>
              <InfoRow label={translate('profile.orderDetails.recipient')} value={shipping.fullName} />
              <InfoRow label={translate('profile.orderDetails.company')} value={shipping.company} />
              <InfoRow label={translate('profile.orderDetails.addressLine1')} value={shipping.line1} />
              <InfoRow label={translate('profile.orderDetails.addressLine2')} value={shipping.line2} />
              <InfoRow label={translate('profile.orderDetails.city')} value={shipping.city} />
              <InfoRow label={translate('profile.orderDetails.phone')} value={shipping.phone} />
            </div>
          </section>

          <section className={classes.section}>
            <h3>{translate('profile.orderDetails.billing')}</h3>
            <div className={classes.addressBlock}>
              <InfoRow label={translate('profile.orderDetails.recipient')} value={billing.fullName || shipping.fullName} />
              <InfoRow label={translate('profile.orderDetails.company')} value={billing.company || shipping.company} />
              <InfoRow label={translate('profile.orderDetails.addressLine1')} value={billing.line1 || shipping.line1} />
              <InfoRow label={translate('profile.orderDetails.addressLine2')} value={billing.line2 || shipping.line2} />
              <InfoRow label={translate('profile.orderDetails.city')} value={billing.city || shipping.city} />
              <InfoRow label={translate('profile.orderDetails.phone')} value={billing.phone || shipping.phone} />
            </div>
          </section>

          {order.customerNotes && (
            <section className={classes.section}>
              <h3>{translate('profile.orderDetails.customerNotes')}</h3>
              <p className={classes.notes}>{order.customerNotes}</p>
            </section>
          )}

          <section className={classes.summary}>
            <div>
              <span className={classes.summaryLabel}>{translate('profile.orderDetails.subtotal')}</span>
              <span className={classes.summaryValue}>{formatCurrency(order.subtotal, order.currency)}</span>
            </div>
            <div>
              <span className={classes.summaryLabel}>{translate('profile.orderDetails.shipping')}</span>
              <span className={classes.summaryValue}>{formatCurrency(order.shippingFee, order.currency)}</span>
            </div>
            <div className={classes.summaryDivider} />
            <div>
              <span className={classes.summaryTotalLabel}>{translate('profile.orderDetails.total')}</span>
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

export default OrderDetailsModal;

