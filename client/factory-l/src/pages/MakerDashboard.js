import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Card, CardContent, Typography, CircularProgress, Alert, Chip } from "@mui/material";
import classes from "./MakerDashboard.module.css";
import translate from "../components/translate";
import { getMyProducts } from "../api/maker";
import { getMyPayments, getMyPayoutSummary } from "../api/payments";
import { getMakerOrders } from "../api/orders";
import { getProfile } from "../api/profile";

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

const MakerDashboard = () => {
  const navigate = useNavigate();
  const { status: authStatus, user } = useSelector((state) => state.auth);
  const currentLang = useSelector((state) => state.lang.lang);
  const [profileData, setProfileData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [payoutSummary, setPayoutSummary] = useState({ pending: 0, paid: 0, total: 0 });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigate("/sign-in", { replace: true });
      return;
    }

    checkMakerStatus();
  }, [authStatus, navigate]);

  const checkMakerStatus = async () => {
    try {
      const profile = await getProfile();
      setProfileData(profile);
      
      if (profile.role !== 'maker' || profile.makerStatus !== 'approved') {
        navigate("/profile", { replace: true });
        return;
      }

      loadDashboardData();
    } catch (err) {
      console.error("[makerDashboard] profile check failed", err);
      navigate("/profile", { replace: true });
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, paymentsRes, summaryRes, ordersRes] = await Promise.allSettled([
        getMyProducts(),
        getMyPayments(),
        getMyPayoutSummary(),
        getMakerOrders({ limit: 10 }),
      ]);

      if (productsRes.status === "fulfilled") {
        setProducts(productsRes.value || []);
      }

      if (paymentsRes.status === "fulfilled") {
        setPayments(paymentsRes.value || []);
      }

      if (summaryRes.status === "fulfilled") {
        setPayoutSummary(summaryRes.value || { pending: 0, paid: 0, total: 0 });
      }

      if (ordersRes.status === "fulfilled") {
        setOrders(ordersRes.value || []);
      }
    } catch (err) {
      console.error("[makerDashboard] load failed", err);
      setError(err.message || translate("makerDashboard.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "live":
      case "approved":
        return "success";
      case "pending_review":
        return "warning";
      case "rejected":
      case "draft":
        return "error";
      default:
        return "default";
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

  return (
    <div className={classes.page}>
      <div className={classes.container}>
        <div className={classes.header}>
          <h1>{translate("makerDashboard.title")}</h1>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/maker/products/new")}
          >
            {translate("makerDashboard.addProduct")}
          </Button>
        </div>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Summary Cards */}
        <div className={classes.summaryGrid}>
          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                {translate("makerDashboard.totalProducts")}
              </Typography>
              <Typography variant="h4">{products.length}</Typography>
            </CardContent>
          </Card>

          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                {translate("makerDashboard.pendingEarnings")}
              </Typography>
              <Typography variant="h4">{payoutSummary.pending.toFixed(2)} ₾</Typography>
            </CardContent>
          </Card>

          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                {translate("makerDashboard.totalEarnings")}
              </Typography>
              <Typography variant="h4">{payoutSummary.total.toFixed(2)} ₾</Typography>
            </CardContent>
          </Card>

          <Card className={classes.summaryCard}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                {translate("makerDashboard.activeOrders")}
              </Typography>
              <Typography variant="h4">{orders.length}</Typography>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <Card className={classes.section}>
          <CardContent>
            <div className={classes.sectionHeader}>
              <Typography variant="h5">{translate("makerDashboard.myProducts")}</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate("/maker/products")}
              >
                {translate("makerDashboard.viewAll")}
              </Button>
            </div>

            {products.length === 0 ? (
              <Typography color="textSecondary">
                {translate("makerDashboard.noProducts")}
              </Typography>
            ) : (
              <div className={classes.productsList}>
                {products.slice(0, 5).map((product) => (
                  <div key={product._id} className={classes.productItem}>
                    <div className={classes.productInfo}>
                      <Typography variant="subtitle1">{product.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {product.price} ₾
                      </Typography>
                    </div>
                    <Chip
                      label={translate(`makerDashboard.status.${product.status}`)}
                      color={getStatusColor(product.status)}
                      size="small"
                    />
                    <Button
                      size="small"
                      onClick={() => navigate(`/maker/products/${product._id}/edit`)}
                    >
                      {translate("makerDashboard.edit")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className={classes.section}>
          <CardContent>
            <div className={classes.sectionHeader}>
              <Typography variant="h5">{translate("makerDashboard.recentPayments")}</Typography>
            </div>

            {payments.length === 0 ? (
              <Typography color="textSecondary">
                {translate("makerDashboard.noPayments")}
              </Typography>
            ) : (
              <div className={classes.paymentsList}>
                {payments.slice(0, 5).map((payment, index) => (
                  <div key={index} className={classes.paymentItem}>
                    <div>
                      <Typography variant="subtitle1">
                        {translate("makerDashboard.order")} {payment.orderId}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(payment.orderDate).toLocaleDateString()}
                      </Typography>
                    </div>
                    <div className={classes.paymentAmount}>
                      <Typography variant="h6">{payment.amount.toFixed(2)} ₾</Typography>
                      <Chip
                        label={translate(`makerDashboard.paymentStatus.${payment.status}`)}
                        color={payment.status === "paid" ? "success" : "warning"}
                        size="small"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className={classes.section}>
          <CardContent>
            <div className={classes.sectionHeader}>
              <Typography variant="h5">{translate("makerDashboard.recentOrders")}</Typography>
            </div>

            {orders.length === 0 ? (
              <Typography color="textSecondary">
                {translate("makerDashboard.noOrders")}
              </Typography>
            ) : (
              <div className={classes.ordersList}>
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className={classes.orderItem}>
                    <div>
                      <Typography variant="subtitle1">
                        {translate("makerDashboard.order")} {order.orderId}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </div>
                    <Chip
                      label={getOrderStatusLabel(order.status)}
                      color={getOrderStatusColor(order.status)}
                      size="small"
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/maker/orders/${order._id}`)}
                    >
                      {translate("makerDashboard.viewDetails") || "View Details"}
                    </Button>
                    {order.delivery?.makerConfirmed === false && order.status !== 'awaiting_payment' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/maker/orders/${order._id}/deliver`)}
                      >
                        {translate("makerDashboard.confirmDelivery")}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MakerDashboard;

