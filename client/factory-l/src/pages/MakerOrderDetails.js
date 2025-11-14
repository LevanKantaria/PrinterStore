import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, CardContent, Typography, Button, CircularProgress, Alert, Chip, Divider } from "@mui/material";
import classes from "./MakerOrderDetails.module.css";
import translate from "../components/translate";
import { getOrderById, updateOrderStatus } from "../api/orders";
import { confirmDeliveryWithCode } from "../api/maker";

// Helper function to get order status label
const getOrderStatusLabel = (status) => {
  const statusMap = {
    'awaiting_payment': 'profile.status.awaitingPayment',
    'payment_received': 'profile.status.paymentReceived',
    'processing': 'profile.status.processing',
    'fulfilled': 'profile.status.fulfilled',
    'cancelled': 'profile.status.cancelled',
  };
  const key = statusMap[status] || `profile.status.${status}`;
  return translate(key) || status;
};

// Helper function to get order status color
const getOrderStatusColor = (status) => {
  switch (status) {
    case 'fulfilled':
      return 'success';
    case 'processing':
    case 'payment_received':
      return 'info';
    case 'awaiting_payment':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const MakerOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status: authStatus, user } = useSelector((state) => state.auth);
  const currentLang = useSelector((state) => state.lang.lang);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [deliveryCode, setDeliveryCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigate("/sign-in", { replace: true });
      return;
    }

    loadOrder();
  }, [authStatus, navigate, id]);

  const loadOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const orderData = await getOrderById(id);
      
      // Filter items to show only this maker's items
      if (orderData.items && user?.uid) {
        const makerItems = orderData.items.filter(item => item.makerId === user.uid);
        setOrder({ ...orderData, items: makerItems });
      } else {
        setOrder(orderData);
      }
    } catch (err) {
      console.error("[makerOrderDetails] load failed", err);
      setError(err.message || translate("makerOrderDetails.loadError") || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!deliveryCode.trim()) {
      setError(translate("deliveryConfirmation.errors.codeRequired"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await confirmDeliveryWithCode(id, deliveryCode.trim().toUpperCase());
      await loadOrder(); // Reload to get updated status
      setError("");
      alert(translate("deliveryConfirmation.success") || "Delivery confirmed successfully!");
    } catch (err) {
      setError(err.message || translate("deliveryConfirmation.errors.submit"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(translate("makerOrderDetails.confirmStatusChange") || `Are you sure you want to mark this order as ${newStatus}?`)) {
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await updateOrderStatus(order.orderId, {
        status: newStatus,
        note: `Status updated to ${newStatus} by maker`,
      });
      await loadOrder(); // Reload to get updated status
      setError("");
    } catch (err) {
      setError(err.message || translate("makerOrderDetails.statusUpdateError") || "Failed to update order status");
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

  if (!order) {
    return (
      <div className={classes.page}>
        <Alert severity="error">{error || translate("makerOrderDetails.orderNotFound") || "Order not found"}</Alert>
      </div>
    );
  }

  // Filter items to show only this maker's items
  const makerItems = order.items?.filter(item => item.makerId === user?.uid) || [];
  const totalForMaker = makerItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);

  return (
    <div className={classes.page}>
      <div className={classes.container}>
        <div className={classes.header}>
          <Button variant="outlined" onClick={() => navigate("/maker/dashboard")}>
            {translate("makerOrderDetails.back") || "← Back to Dashboard"}
          </Button>
          <Typography variant="h4">{translate("makerOrderDetails.title") || "Order Details"}</Typography>
        </div>

        {error && <Alert severity="error" className={classes.alert}>{error}</Alert>}

        <Card className={classes.card}>
          <CardContent>
            <div className={classes.orderHeader}>
              <div>
                <Typography variant="h5">
                  {translate("makerOrderDetails.order") || "Order"} {order.orderId}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </div>
              <Chip
                label={getOrderStatusLabel(order.status)}
                color={getOrderStatusColor(order.status)}
              />
            </div>

            <Divider style={{ margin: "1.5rem 0" }} />

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className={classes.section}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  {translate("makerOrderDetails.shippingAddress") || "Shipping Address"}
                </Typography>
                <div className={classes.addressBox}>
                  {order.shippingAddress.fullName && (
                    <Typography><strong>{order.shippingAddress.fullName}</strong></Typography>
                  )}
                  {order.shippingAddress.company && (
                    <Typography>{order.shippingAddress.company}</Typography>
                  )}
                  {order.shippingAddress.line1 && (
                    <Typography>{order.shippingAddress.line1}</Typography>
                  )}
                  {order.shippingAddress.line2 && (
                    <Typography>{order.shippingAddress.line2}</Typography>
                  )}
                  {order.shippingAddress.city && (
                    <Typography>{order.shippingAddress.city}</Typography>
                  )}
                  {order.shippingAddress.phone && (
                    <Typography style={{ marginTop: "0.5rem" }}>
                      <strong>{translate("makerOrderDetails.phone") || "Phone"}:</strong> {order.shippingAddress.phone}
                    </Typography>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className={classes.section}>
              <Typography variant="h6" className={classes.sectionTitle}>
                {translate("makerOrderDetails.items") || "Your Items in This Order"}
              </Typography>
              <div className={classes.itemsList}>
                {makerItems.length === 0 ? (
                  <Typography color="textSecondary">No items found for this maker.</Typography>
                ) : (
                  makerItems.map((item, idx) => (
                    <div key={idx} className={classes.itemRow}>
                      <div className={classes.itemInfo}>
                        {item.image && (
                          <img src={item.image} alt={item.name} className={classes.itemImage} />
                        )}
                        <div>
                          <Typography variant="subtitle1">{item.name}</Typography>
                          {item.color && (
                            <Typography variant="body2" color="textSecondary">
                              {translate("makerOrderDetails.color") || "Color"}: {item.color}
                            </Typography>
                          )}
                          <Typography variant="body2" color="textSecondary">
                            {translate("makerOrderDetails.quantity") || "Quantity"}: {item.quantity}
                          </Typography>
                        </div>
                      </div>
                      <Typography variant="h6">
                        {item.lineTotal?.toFixed(2) || (item.unitPrice * item.quantity).toFixed(2)} {order.currency || "₾"}
                      </Typography>
                    </div>
                  ))
                )}
              </div>
              <div className={classes.totalRow}>
                <Typography variant="h6">
                  {translate("makerOrderDetails.total") || "Total"}: {totalForMaker.toFixed(2)} {order.currency || "₾"}
                </Typography>
                {makerItems[0]?.commission && (
                  <Typography variant="body2" color="textSecondary">
                    {translate("makerOrderDetails.commission") || "Commission"}: {makerItems[0].commission.toFixed(2)} {order.currency || "₾"} per unit
                  </Typography>
                )}
              </div>
            </div>

            {/* Order Status Actions */}
            {order.status === 'payment_received' && (
              <div className={classes.section}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  {translate("makerOrderDetails.updateStatus") || "Update Order Status"}
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: "1rem" }}>
                  {translate("makerOrderDetails.statusInstructions") || "Mark this order as processing when you start working on it."}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpdateStatus('processing')}
                  disabled={submitting}
                  style={{ marginRight: "1rem" }}
                >
                  {submitting ? <CircularProgress size={24} /> : translate("makerOrderDetails.markAsProcessing") || "Mark as Processing"}
                </Button>
              </div>
            )}

            {/* Delivery Confirmation */}
            {order.status !== 'awaiting_payment' && !order.delivery?.makerConfirmed && (
              <div className={classes.section}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  {translate("makerOrderDetails.confirmDelivery") || "Confirm Delivery"}
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: "1rem" }}>
                  {translate("makerOrderDetails.deliveryInstructions") || "Enter the delivery code provided by the customer to confirm delivery."}
                </Typography>
                <div className={classes.deliveryCodeInput}>
                  <input
                    type="text"
                    value={deliveryCode}
                    onChange={(e) => setDeliveryCode(e.target.value.toUpperCase())}
                    placeholder={translate("deliveryConfirmation.codePlaceholder") || "ABC 123"}
                    className={classes.codeInput}
                    maxLength={8}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConfirmDelivery}
                    disabled={submitting || !deliveryCode.trim()}
                  >
                    {submitting ? <CircularProgress size={24} /> : translate("makerOrderDetails.confirm") || "Confirm Delivery"}
                  </Button>
                </div>
                {order.delivery?.code && (
                  <Typography variant="caption" color="textSecondary" style={{ marginTop: "0.5rem", display: "block" }}>
                    {translate("makerOrderDetails.codeGenerated") || "Delivery code has been generated for this order."}
                  </Typography>
                )}
              </div>
            )}

            {order.delivery?.makerConfirmed && (
              <Alert severity="success" style={{ marginTop: "1.5rem" }}>
                {translate("makerOrderDetails.deliveryConfirmed") || "Delivery has been confirmed. Payment will be processed soon."}
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MakerOrderDetails;

