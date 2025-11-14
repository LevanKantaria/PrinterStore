import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import classes from "./OrderHistory.module.css";
import OrderDetailsModal from "./OrderDetailsModal";
import translate from "../translate";

const getStatusLabel = (status) => {
  const normalized = status?.toLowerCase() || "unknown";
  const statusMap = {
    awaiting_payment: 'profile.status.awaitingPayment',
    payment_received: 'profile.status.paymentReceived',
    processing: 'profile.status.processing',
    fulfilled: 'profile.status.fulfilled',
    cancelled: 'profile.status.cancelled',
  };
  const key = statusMap[normalized] || null;
  return key ? translate(key) : status || "Unknown";
};

const StatusBadge = ({ status }) => {
  const normalized = status?.toLowerCase() || "unknown";
  const label = getStatusLabel(status);
  return <span className={`${classes.status} ${classes[`status-${normalized}`]}`}>{label}</span>;
};

StatusBadge.propTypes = {
  status: PropTypes.string,
};

StatusBadge.defaultProps = {
  status: "awaiting_payment",
};

const formatCurrency = (currency, amount) => {
  const value = Number(amount || 0);
  const defaultCurrency = currency || "GEL";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: defaultCurrency,
    }).format(value);
  } catch {
    const symbol = defaultCurrency === "GEL" ? "₾" : defaultCurrency;
    return `${symbol} ${value.toFixed(2)}`;
  }
};

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  try {
    const date = new Date(isoDate);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
};

const OrderHistory = ({ orders }) => {
  // Subscribe to language changes to trigger re-render
  const currentLang = useSelector((state) => state.lang.lang);
  const [selectedOrder, setSelectedOrder] = useState(null);

  if (!orders?.length) {
    return (
      <section className={classes.section}>
        <header className={classes.header}>
          <span className={classes.kicker}>{translate('profile.recentActivity')}</span>
          <h2>{translate('profile.noPurchases')}</h2>
          <p>
            {translate('profile.noPurchasesDesc')}
          </p>
        </header>
      </section>
    );
  }

  return (
    <section className={classes.section}>
      <header className={classes.header}>
        <span className={classes.kicker}>{translate('profile.recentActivity')}</span>
        <h2>{translate('profile.latestPurchases')}</h2>
        <p>{translate('profile.latestPurchasesDesc')}</p>
      </header>

      <div className={classes.list}>
        {orders.map((order) => (
          <article key={order.orderId} className={classes.card}>
            <div className={classes.cardHeader}>
              <div>
                <h3>{translate('profile.order')} {order.orderId}</h3>
                <p className={classes.meta}>
                  {translate('profile.placedOn')}{" "}
                  <time dateTime={order.createdAt}>
                    {formatDate(order.createdAt)}
                  </time>
                </p>
              </div>
              <div className={classes.cardAside}>
                <span className={classes.total}>{formatCurrency(order.currency, order.total)}</span>
                <StatusBadge status={order.status} />
              </div>
            </div>

            <ul className={classes.items}>
              {order.items.map((item, index) => {
                const key = item.productId || `${order.orderId}-item-${index}`;
                const lineTotal =
                  item.lineTotal != null
                    ? item.lineTotal
                    : item.unitPrice != null
                    ? Number(item.unitPrice) * Number(item.quantity || 0)
                    : 0;

                const thumbnail = item.image || item.thumbnail || item.imageUrl || "";
                const productLink = item.productId ? `/products/${item.productId}` : null;

                return (
                  <li key={key} className={classes.item}>
                    {thumbnail ? (
                      productLink ? (
                        <Link to={productLink} className={classes.itemImageLink}>
                          <img src={thumbnail} alt={item.name} className={classes.itemImage} />
                        </Link>
                      ) : (
                        <img src={thumbnail} alt={item.name} className={classes.itemImage} />
                      )
                    ) : (
                      <div className={classes.itemImagePlaceholder} aria-hidden="true">
                        🧩
                      </div>
                    )}
                    <div className={classes.itemInfo}>
                      <p className={classes.itemName}>{item.name}</p>
                      <p className={classes.itemMeta}>
                        {translate('profile.qty')} {item.quantity}
                        {item.color ? ` • ${item.color}` : ""}
                        {item.material ? ` • ${item.material}` : ""}
                      </p>
                    </div>
                    <span className={classes.itemPrice}>
                      {formatCurrency(order.currency, lineTotal)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className={classes.actions}>
              <button
                type="button"
                className={classes.secondaryAction}
                onClick={() => setSelectedOrder(order)}
              >
                {translate('profile.viewDetails')}
              </button>
            </div>
          </article>
        ))}
      </div>
      <OrderDetailsModal
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </section>
  );
};

OrderHistory.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      orderId: PropTypes.string.isRequired,
      createdAt: PropTypes.string,
      currency: PropTypes.string,
      total: PropTypes.number,
      status: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          productId: PropTypes.string,
          name: PropTypes.string.isRequired,
          material: PropTypes.string,
          color: PropTypes.string,
          quantity: PropTypes.number.isRequired,
          unitPrice: PropTypes.number,
          lineTotal: PropTypes.number,
          image: PropTypes.string,
        })
      ).isRequired,
    })
  ),
};

OrderHistory.defaultProps = {
  orders: [],
};

export default OrderHistory;

