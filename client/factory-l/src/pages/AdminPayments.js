import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, Typography, CircularProgress, Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import classes from "./AdminPayments.module.css";
import translate from "../components/translate";
import { getAllPendingPayments, processPayment } from "../api/payments";

const AdminPayments = () => {
  const navigate = useNavigate();
  const { status: authStatus, user } = useSelector((state) => state.auth);
  const currentLang = useSelector((state) => state.lang.lang);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [transactionId, setTransactionId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated" || !user?.isAdmin) {
      navigate("/", { replace: true });
      return;
    }

    loadPayments();
  }, [authStatus, user, navigate]);

  const loadPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllPendingPayments();
      setPayments(data || []);
    } catch (err) {
      console.error("[adminPayments] load failed", err);
      setError(err.message || translate("adminPayments.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!selectedPayment) return;
    setActionLoading(true);
    try {
      await processPayment(selectedPayment.orderId, selectedPayment.makerId, {
        paymentMethod,
        transactionId,
      });
      await loadPayments();
      setProcessDialogOpen(false);
      setSelectedPayment(null);
      setPaymentMethod("bank_transfer");
      setTransactionId("");
    } catch (err) {
      setError(err.message || translate("adminPayments.processError"));
    } finally {
      setActionLoading(false);
    }
  };

  const openProcessDialog = (payment) => {
    setSelectedPayment(payment);
    setProcessDialogOpen(true);
  };

  const totalPending = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) {
    return (
      <div className={classes.page}>
        <div className={classes.loader}>
          <CircularProgress />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.page}>
      <div className={classes.container}>
        <div className={classes.header}>
          <div>
            <h1>{translate("adminPayments.title")}</h1>
            <Typography variant="body1" color="textSecondary">
              {payments.length} {translate("adminPayments.pendingCount")}
            </Typography>
          </div>
          <Card className={classes.totalCard}>
            <CardContent>
              <Typography variant="h6">
                {translate("adminPayments.totalPending")}
              </Typography>
              <Typography variant="h4">{totalPending.toFixed(2)} ₾</Typography>
            </CardContent>
          </Card>
        </div>

        {error && <Alert severity="error">{error}</Alert>}

        {payments.length === 0 ? (
          <Card>
            <CardContent>
              <Typography>{translate("adminPayments.noPayments")}</Typography>
            </CardContent>
          </Card>
        ) : (
          <div className={classes.paymentsList}>
            {payments.map((payment, index) => (
              <Card key={index} className={classes.paymentCard}>
                <CardContent>
                  <div className={classes.paymentHeader}>
                    <div>
                      <Typography variant="h6">
                        {translate("adminPayments.order")} {payment.orderId}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {payment.makerName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(payment.orderDate).toLocaleDateString()}
                      </Typography>
                    </div>
                    <div className={classes.paymentAmount}>
                      <Typography variant="h5">{payment.amount.toFixed(2)} ₾</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {translate("adminPayments.commission")}: {payment.commission.toFixed(2)} ₾
                      </Typography>
                    </div>
                  </div>

                  <div className={classes.actions}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => openProcessDialog(payment)}
                      disabled={actionLoading}
                    >
                      {translate("adminPayments.process")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Process Payment Dialog */}
        <Dialog open={processDialogOpen} onClose={() => setProcessDialogOpen(false)}>
          <DialogTitle>{translate("adminPayments.processTitle")}</DialogTitle>
          <DialogContent>
            {selectedPayment && (
              <div className={classes.dialogContent}>
                <Typography>
                  <strong>{translate("adminPayments.order")}:</strong> {selectedPayment.orderId}
                </Typography>
                <Typography>
                  <strong>{translate("adminPayments.maker")}:</strong> {selectedPayment.makerName}
                </Typography>
                <Typography>
                  <strong>{translate("adminPayments.amount")}:</strong> {selectedPayment.amount.toFixed(2)} ₾
                </Typography>
                <TextField
                  fullWidth
                  select
                  label={translate("adminPayments.paymentMethod")}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  SelectProps={{ native: true }}
                  className={classes.field}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Other</option>
                </TextField>
                <TextField
                  fullWidth
                  label={translate("adminPayments.transactionId")}
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={translate("adminPayments.transactionIdPlaceholder")}
                  className={classes.field}
                />
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProcessDialogOpen(false)}>
              {translate("adminPayments.cancel")}
            </Button>
            <Button
              onClick={handleProcess}
              color="primary"
              variant="contained"
              disabled={actionLoading}
            >
              {translate("adminPayments.confirm")}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPayments;

