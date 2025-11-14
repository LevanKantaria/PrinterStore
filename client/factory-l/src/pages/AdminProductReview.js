import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, Typography, CircularProgress, Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import classes from "./AdminProductReview.module.css";
import translate from "../components/translate";
import { getPendingProducts, approveProduct, rejectProduct } from "../api/maker";

const AdminProductReview = () => {
  const navigate = useNavigate();
  const { status: authStatus, user } = useSelector((state) => state.auth);
  const currentLang = useSelector((state) => state.lang.lang);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated" || !user?.isAdmin) {
      navigate("/", { replace: true });
      return;
    }

    loadProducts();
  }, [authStatus, user, navigate]);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPendingProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("[adminProductReview] load failed", err);
      setError(err.message || translate("adminProductReview.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await approveProduct(id);
      await loadProducts();
      setSelectedProduct(null);
    } catch (err) {
      setError(err.message || translate("adminProductReview.approveError"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProduct) return;
    setActionLoading(true);
    try {
      await rejectProduct(selectedProduct._id, rejectionReason);
      await loadProducts();
      setRejectDialogOpen(false);
      setSelectedProduct(null);
      setRejectionReason("");
    } catch (err) {
      setError(err.message || translate("adminProductReview.rejectError"));
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (product) => {
    setSelectedProduct(product);
    setRejectDialogOpen(true);
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
          <h1>{translate("adminProductReview.title")}</h1>
          <Typography variant="body1" color="textSecondary">
            {products.length} {translate("adminProductReview.pendingCount")}
          </Typography>
        </div>

        {error && <Alert severity="error">{error}</Alert>}

        {products.length === 0 ? (
          <Card>
            <CardContent>
              <Typography>{translate("adminProductReview.noProducts")}</Typography>
            </CardContent>
          </Card>
        ) : (
          <div className={classes.productsList}>
            {products.map((product) => (
              <Card key={product._id} className={classes.productCard}>
                <CardContent>
                  <div className={classes.productHeader}>
                    <div>
                      <Typography variant="h6">{product.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {translate("adminProductReview.by")} {product.makerName || product.creator}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {product.category} / {product.subCategory}
                      </Typography>
                    </div>
                    <Typography variant="h5">{product.price} ₾</Typography>
                  </div>

                  <div className={classes.productImages}>
                    {product.images?.slice(0, 3).map((img, idx) => (
                      <img key={idx} src={img} alt={product.name} className={classes.image} />
                    ))}
                  </div>

                  <div className={classes.productDetails}>
                    <Typography variant="subtitle2">
                      {translate("adminProductReview.description")}
                    </Typography>
                    <Typography>{product.description}</Typography>
                  </div>

                  {product.colors && product.colors.length > 0 && (
                    <div className={classes.productDetails}>
                      <Typography variant="subtitle2">
                        {translate("adminProductReview.colors")}
                      </Typography>
                      <div className={classes.colors}>
                        {product.colors.map((color, idx) => (
                          <span key={idx} className={classes.colorDot} style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={classes.actions}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(product._id)}
                      disabled={actionLoading}
                    >
                      {translate("adminProductReview.approve")}
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => openRejectDialog(product)}
                      disabled={actionLoading}
                    >
                      {translate("adminProductReview.reject")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
          <DialogTitle>{translate("adminProductReview.rejectTitle")}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={translate("adminProductReview.rejectPlaceholder")}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>
              {translate("adminProductReview.cancel")}
            </Button>
            <Button
              onClick={handleReject}
              color="error"
              variant="contained"
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {translate("adminProductReview.reject")}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminProductReview;

