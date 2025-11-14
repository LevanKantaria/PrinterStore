import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { TextField, Button, Alert, CircularProgress, Card, CardContent, Typography } from "@mui/material";
import classes from "./DeliveryConfirmation.module.css";
import CustomButton from "../components/customButton/CustomButton";
import translate from "../components/translate";
import { confirmDeliveryWithCode } from "../api/maker";
import { getOrderById } from "../api/orders";

const DeliveryConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status: authStatus } = useSelector((state) => state.auth);
  const currentLang = useSelector((state) => state.lang.lang);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [code, setCode] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigate("/sign-in", { replace: true });
      return;
    }

    loadOrder();
  }, [authStatus, navigate, id]);

  const loadOrder = async () => {
    try {
      const orderData = await getOrderById(id);
      setOrder(orderData);
    } catch (err) {
      setError(err.message || translate("deliveryConfirmation.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!code.trim()) {
      setError(translate("deliveryConfirmation.errors.codeRequired"));
      return;
    }

    setSubmitting(true);

    try {
      await confirmDeliveryWithCode(id, code.trim().toUpperCase());
      setSuccess(true);
      
      setTimeout(() => {
        navigate("/maker/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.message || translate("deliveryConfirmation.errors.submit"));
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
        <Alert severity="error">{translate("deliveryConfirmation.orderNotFound")}</Alert>
      </div>
    );
  }

  return (
    <div className={classes.page}>
      <div className={classes.container}>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="h4" className={classes.title}>
              {translate("deliveryConfirmation.title")}
            </Typography>
            <Typography variant="body1" className={classes.subtitle}>
              {translate("deliveryConfirmation.subtitle")} {order.orderId}
            </Typography>

            {error && <Alert severity="error" className={classes.alert}>{error}</Alert>}
            {success && (
              <Alert severity="success" className={classes.alert}>
                {translate("deliveryConfirmation.success")}
              </Alert>
            )}

            <div className={classes.orderInfo}>
              <Typography variant="h6">{translate("deliveryConfirmation.orderDetails")}</Typography>
              <Typography>
                <strong>{translate("deliveryConfirmation.orderId")}:</strong> {order.orderId}
              </Typography>
              <Typography>
                <strong>{translate("deliveryConfirmation.total")}:</strong> {order.total} {order.currency}
              </Typography>
              <Typography>
                <strong>{translate("deliveryConfirmation.items")}:</strong> {order.items?.length || 0}
              </Typography>
              
              {order.shippingAddress && (
                <div className={classes.shippingAddress}>
                  <Typography variant="subtitle2" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                    <strong>{translate("deliveryConfirmation.shippingAddress") || "Shipping Address"}:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {order.shippingAddress.fullName && <>{order.shippingAddress.fullName}<br /></>}
                    {order.shippingAddress.company && <>{order.shippingAddress.company}<br /></>}
                    {order.shippingAddress.line1 && <>{order.shippingAddress.line1}<br /></>}
                    {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
                    {order.shippingAddress.city && <>{order.shippingAddress.city}<br /></>}
                    {order.shippingAddress.phone && <>{translate("deliveryConfirmation.phone") || "Phone"}: {order.shippingAddress.phone}</>}
                  </Typography>
                </div>
              )}

              {order.items && order.items.length > 0 && (
                <div className={classes.orderItems} style={{ marginTop: '1rem' }}>
                  <Typography variant="subtitle2" style={{ marginBottom: '0.5rem' }}>
                    <strong>{translate("deliveryConfirmation.orderItems") || "Order Items"}:</strong>
                  </Typography>
                  {order.items.filter(item => item.makerId === (order.items.find(i => i.makerId)?.makerId)).map((item, idx) => (
                    <Typography key={idx} variant="body2">
                      • {item.name} - {item.quantity}x {item.color && `(${item.color})`}
                    </Typography>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className={classes.form}>
              <div className={classes.formGroup}>
                <label>{translate("deliveryConfirmation.codeLabel")}</label>
                <TextField
                  fullWidth
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder={translate("deliveryConfirmation.codePlaceholder")}
                  inputProps={{ maxLength: 8, style: { textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "1.2rem", textAlign: "center" } }}
                  className={classes.codeInput}
                />
                <Typography variant="caption" color="textSecondary" className={classes.helpText}>
                  {translate("deliveryConfirmation.helpText")}
                </Typography>
              </div>

              <div className={classes.actions}>
                <CustomButton
                  type="submit"
                  text={translate("deliveryConfirmation.submit")}
                  width="200px"
                  height="50px"
                  disabled={submitting || !code.trim()}
                />
                <Button onClick={() => navigate("/maker/dashboard")} variant="outlined">
                  {translate("deliveryConfirmation.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryConfirmation;

