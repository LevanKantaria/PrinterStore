import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import classes from "./AdminOrders.module.css";
import { listAllOrders, updateOrderStatus } from "../api/orders";
import { ApiError } from "../api/http";

const STATUS_OPTIONS = [
  { value: "awaiting_payment", label: "Awaiting payment" },
  { value: "payment_received", label: "Payment received" },
  { value: "processing", label: "Processing" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
];

const formatCurrency = (value, currency = "USD") => {
  const amount = Number(value || 0);
  return `${currency} ${amount.toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const { status: authStatus, user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("awaiting_payment");
  const [permissionError, setPermissionError] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [actionState, setActionState] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);

  const isAdmin = user?.isAdmin;

  const summary = useMemo(() => {
    const total = orders.length;
    const awaiting = orders.filter((o) => o.status === "awaiting_payment").length;
    const paymentReceived = orders.filter((o) => o.status === "payment_received").length;
    const fulfilled = orders.filter((o) => o.status === "fulfilled").length;
    return [
      {
        label: "Open invoices",
        value: awaiting,
        description: "Transfers waiting for payment",
        tone: "amber",
      },
      {
        label: "Payment received",
        value: paymentReceived,
        description: "Ready to move into production",
        tone: "mint",
      },
      {
        label: "Total in view",
        value: total,
        description: "Orders matching current filter",
        tone: "sage",
      },
      {
        label: "Fulfilled",
        value: fulfilled,
        description: "Completed & delivered orders",
        tone: "forest",
      },
    ];
  }, [orders]);

  const incomeSummary = useMemo(() => {
    const currency = orders[0]?.currency || "USD";
    const awaitingTotal = orders
      .filter((order) => order.status === "awaiting_payment")
      .reduce((acc, order) => acc + Number(order.total || 0), 0);
    const clearedTotal = orders
      .filter((order) =>
        ["payment_received", "processing", "fulfilled"].includes(order.status)
      )
      .reduce((acc, order) => acc + Number(order.total || 0), 0);
    const cancelledTotal = orders
      .filter((order) => order.status === "cancelled")
      .reduce((acc, order) => acc + Number(order.total || 0), 0);
    const overallTotal = orders.reduce((acc, order) => acc + Number(order.total || 0), 0);

    return [
      {
        label: "Outstanding invoices",
        value: formatCurrency(awaitingTotal, currency),
        description: "Waiting for bank transfer",
        tone: "amber",
      },
      {
        label: "Cleared payments",
        value: formatCurrency(clearedTotal, currency),
        description: "Funds ready for production",
        tone: "mint",
      },
      {
        label: "Cancelled value",
        value: formatCurrency(cancelledTotal, currency),
        description: "Refunded or voided orders",
        tone: "rose",
      },
      {
        label: "Gross total",
        value: formatCurrency(overallTotal, currency),
        description: "Combined value of filtered orders",
        tone: "forest",
      },
    ];
  }, [orders]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigate("/sign-in", { replace: true });
    }
  }, [authStatus, navigate]);

  const loadOrders = useMemo(
    () => async () => {
      if (authStatus !== "authenticated") return;

      setLoading(true);
      setError("");
      setPermissionError(false);
      try {
        const response = await listAllOrders({
          status: filter,
        });
        setOrders(response);
        const nextDrafts = {};
        response.forEach((order) => {
          nextDrafts[order.orderId] = {
            status: order.status,
            note: "",
          };
        });
        setDrafts(nextDrafts);
      } catch (err) {
        console.error("[admin orders] fetch failed", err);
        if (err instanceof ApiError && err.status === 403) {
          setPermissionError(true);
        } else {
          setError(err.message || "Unable to load orders.");
        }
      } finally {
        setLoading(false);
      }
    },
    [authStatus, filter]
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleDraftChange = (orderId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }));
  };

  const handleUpdateStatus = async (orderId) => {
    const draft = drafts[orderId];
    if (!draft) return;

    const payload = {
      status: draft.status,
    };
    if (draft.note && draft.note.trim()) {
      payload.note = draft.note.trim();
    }

    setActionState((prev) => ({
      ...prev,
      [orderId]: { saving: true, error: "" },
    }));

    try {
      const updatedOrder = await updateOrderStatus(orderId, payload);
      setOrders((prev) =>
        prev.map((order) => (order.orderId === orderId ? updatedOrder : order))
      );
      setDrafts((prev) => ({
        ...prev,
        [orderId]: {
          status: updatedOrder.status,
          note: "",
        },
      }));
    } catch (err) {
      console.error("[admin orders] update failed", err);
      setActionState((prev) => ({
        ...prev,
        [orderId]: {
          saving: false,
          error: err.message || "Unable to update status.",
        },
      }));
      return;
    }

    setActionState((prev) => ({
      ...prev,
      [orderId]: { saving: false, error: "" },
    }));
  };

  if (authStatus !== "authenticated") {
    return (
      <div className={classes.page}>
        <div className={classes.card}>
          <p>Checking your access…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || permissionError) {
    return (
      <div className={classes.page}>
        <div className={classes.card}>
          <h1>Admin access required</h1>
          <p>
            You need admin privileges to manage orders. If you believe this is a mistake, please
            contact the site owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.page}>
      <section className={classes.card}>
        <header className={classes.header}>
          <div>
            <span className={classes.kicker}>Operations</span>
            <h1>Manual order management</h1>
            <p>
              Track bank transfer orders, update statuses, and leave internal notes so the whole team
              stays aligned.
            </p>
          </div>
          <div className={classes.filterRow}>
            <label htmlFor="statusFilter">Status filter</label>
            <select
              id="statusFilter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="awaiting_payment">Awaiting payment</option>
              <option value="payment_received">Payment received</option>
              <option value="processing">Processing</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
              <option value="all">All</option>
            </select>
          </div>
        </header>

        <div className={classes.dashboard}>
          {summary.map((item) => (
            <div key={item.label} className={`${classes.metricCard} ${classes[`metric-${item.tone}`]}`}>
              <span className={classes.metricLabel}>{item.label}</span>
              <span className={classes.metricValue}>{item.value}</span>
              <span className={classes.metricDescription}>{item.description}</span>
            </div>
          ))}
        </div>

        <div className={`${classes.dashboard} ${classes.incomeGrid}`}>
          {incomeSummary.map((item) => (
            <div key={item.label} className={`${classes.metricCard} ${classes[`metric-${item.tone}`]}`}>
              <span className={classes.metricLabel}>{item.label}</span>
              <span className={classes.metricValue}>{item.value}</span>
              <span className={classes.metricDescription}>{item.description}</span>
            </div>
          ))}
        </div>

        {error && <div className={classes.alert}>{error}</div>}

        {loading ? (
          <div className={classes.loader}>Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className={classes.emptyState}>
            <h2>No orders found</h2>
            <p>Once customers place orders, they will appear here for manual review.</p>
          </div>
        ) : (
          <div className={classes.tableWrapper}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Placed</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Next action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const draft = drafts[order.orderId] || { status: order.status, note: "" };
                  const action = actionState[order.orderId] || { saving: false, error: "" };
                  const isExpanded = expandedOrder === order.orderId;

                  return (
                    <React.Fragment key={order.orderId}>
                      <tr className={classes.row}>
                        <td>
                          <button
                            type="button"
                            className={classes.expandButton}
                            onClick={() =>
                              setExpandedOrder((prev) =>
                                prev === order.orderId ? null : order.orderId
                              )
                            }
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? "−" : "+"}
                          </button>
                          <span className={classes.orderId}>{order.orderId}</span>
                          <span className={classes.itemsCount}>
                            {order.items.length} item{order.items.length === 1 ? "" : "s"}
                          </span>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          {order.shippingAddress?.fullName || "—"}
                          <br />
                          <span className={classes.secondaryText}>
                            {order.shippingAddress?.phone || ""}
                          </span>
                        </td>
                        <td className={classes.amountCell}>
                          {formatCurrency(order.total, order.currency)}
                        </td>
                        <td>
                          <div className={classes.statusSelect}>
                            <span
                              className={`${classes.statusBadge} ${
                                classes[`status-${order.status}`] || ""
                              }`}
                            >
                              {STATUS_OPTIONS.find((opt) => opt.value === order.status)?.label ||
                                order.status}
                            </span>
                            <select
                              value={draft.status}
                              onChange={(event) =>
                                handleDraftChange(order.orderId, "status", event.target.value)
                              }
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td>
                          <div className={classes.actionCell}>
                            <input
                              type="text"
                              placeholder="Internal note (optional)"
                              value={draft.note}
                              onChange={(event) =>
                                handleDraftChange(order.orderId, "note", event.target.value)
                              }
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.orderId)}
                              disabled={action.saving}
                            >
                              {action.saving ? "Saving…" : "Save"}
                            </button>
                          </div>
                          {action.error && (
                            <div className={classes.inlineError}>{action.error}</div>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className={classes.detailsRow}>
                          <td colSpan={6}>
                            <div className={classes.details}>
                              <div className={classes.detailCard}>
                                <h4>Items</h4>
                                <ul>
                                  {order.items.map((item) => (
                                    <li key={`${order.orderId}-${item.productId || item.name}`}>
                                      <span>{item.name}</span>
                                      <span className={classes.secondaryText}>
                                        Qty {item.quantity}
                                        {item.material ? ` • ${item.material}` : ""}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              {order.customerNotes ? (
                                <div className={classes.detailCard}>
                                  <h4>Customer notes</h4>
                                  <p>{order.customerNotes}</p>
                                </div>
                              ) : null}
                              <div className={classes.detailCard}>
                                <h4>Shipping address</h4>
                                <p>
                                  {order.shippingAddress?.fullName || "—"}
                                  {order.shippingAddress?.company ? (
                                    <>
                                      <br />
                                      {order.shippingAddress.company}
                                    </>
                                  ) : null}
                                  {order.shippingAddress?.line1 ? (
                                    <>
                                      <br />
                                      {order.shippingAddress.line1}
                                    </>
                                  ) : null}
                                  {order.shippingAddress?.line2 ? (
                                    <>
                                      <br />
                                      {order.shippingAddress.line2}
                                    </>
                                  ) : null}
                                  {order.shippingAddress?.city ? (
                                    <>
                                      <br />
                                      {order.shippingAddress.city}
                                    </>
                                  ) : null}
                                  {order.shippingAddress?.phone ? (
                                    <>
                                      <br />
                                      {order.shippingAddress.phone}
                                    </>
                                  ) : null}
                                </p>
                              </div>
                              {order.billingAddress ? (
                                <div className={classes.detailCard}>
                                  <h4>Billing address</h4>
                                  <p>
                                    {order.billingAddress?.fullName || "—"}
                                    {order.billingAddress?.company ? (
                                      <>
                                        <br />
                                        {order.billingAddress.company}
                                      </>
                                    ) : null}
                                    {order.billingAddress?.line1 ? (
                                      <>
                                        <br />
                                        {order.billingAddress.line1}
                                      </>
                                    ) : null}
                                    {order.billingAddress?.line2 ? (
                                      <>
                                        <br />
                                        {order.billingAddress.line2}
                                      </>
                                    ) : null}
                                    {order.billingAddress?.city ? (
                                      <>
                                        <br />
                                        {order.billingAddress.city}
                                      </>
                                    ) : null}
                                    {order.billingAddress?.phone ? (
                                      <>
                                        <br />
                                        {order.billingAddress.phone}
                                      </>
                                    ) : null}
                                  </p>
                                </div>
                              ) : null}
                              {order.paymentDueBy ? (
                                <div className={classes.detailCard}>
                                  <h4>Payment due</h4>
                                  <p>{formatDate(order.paymentDueBy)}</p>
                                </div>
                              ) : null}
                              <div className={classes.detailCard}>
                                <h4>Payment breakdown</h4>
                                <p>
                                  Subtotal: <strong>{formatCurrency(order.subtotal, order.currency)}</strong>
                                  <br />
                                  Shipping: <strong>{formatCurrency(order.shippingFee, order.currency)}</strong>
                                  <br />
                                  Total: <strong>{formatCurrency(order.total, order.currency)}</strong>
                                </p>
                              </div>
                              <div className={classes.detailCard}>
                                <h4>History</h4>
                                {order.history?.length ? (
                                  <ul className={classes.historyList}>
                                    {order.history.map((entry, index) => (
                                      <li key={`${order.orderId}-history-${index}`}>
                                        <span className={classes.secondaryText}>
                                          {formatDate(entry.changedAt)}
                                        </span>
                                        <div>
                                          <strong>{entry.status}</strong>
                                          {entry.note ? (
                                            <span className={classes.secondaryText}> — {entry.note}</span>
                                          ) : null}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className={classes.secondaryText}>No history yet.</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminOrders;

