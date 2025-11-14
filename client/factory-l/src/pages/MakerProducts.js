import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Card, CardContent, Typography, CircularProgress, Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import classes from "./MakerProducts.module.css";
import translate from "../components/translate";
import { getMyProducts, deleteMakerProduct } from "../api/maker";
import { getProfile } from "../api/profile";

const MakerProducts = () => {
  const navigate = useNavigate();
  const { status: authStatus, user } = useSelector((state) => state.auth);
  const currentLang = useSelector((state) => state.lang.lang);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

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
      
      if (profile.role !== 'maker' || profile.makerStatus !== 'approved') {
        navigate("/profile", { replace: true });
        return;
      }

      loadProducts();
    } catch (err) {
      console.error("[makerProducts] profile check failed", err);
      navigate("/profile", { replace: true });
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("[makerProducts] load failed", err);
      setError(err.message || translate("makerProducts.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteMakerProduct(productToDelete._id);
      await loadProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err) {
      setError(err.message || translate("makerProducts.deleteError"));
    }
  };

  const openDeleteDialog = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
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
          <h1>{translate("makerProducts.title")}</h1>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/maker/products/new")}
          >
            {translate("makerProducts.addProduct")}
          </Button>
        </div>

        {error && <Alert severity="error">{error}</Alert>}

        {products.length === 0 ? (
          <Card>
            <CardContent>
              <Typography>{translate("makerProducts.noProducts")}</Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/maker/products/new")}
                className={classes.addFirstButton}
              >
                {translate("makerProducts.addFirstProduct")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={classes.productsGrid}>
            {products.map((product) => (
              <Card key={product._id} className={classes.productCard}>
                <CardContent>
                  <div className={classes.productHeader}>
                    <Typography variant="h6">{product.name}</Typography>
                    <Chip
                      label={translate(`makerDashboard.status.${product.status}`)}
                      color={getStatusColor(product.status)}
                      size="small"
                    />
                  </div>
                  
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className={classes.productImage}
                    />
                  )}

                  <div className={classes.productInfo}>
                    <Typography variant="body1">
                      <strong>{translate("makerProducts.price")}:</strong> {product.price} ₾
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {product.category} / {product.subCategory}
                    </Typography>
                  </div>

                  <div className={classes.actions}>
                    {['draft', 'rejected'].includes(product.status) && (
                      <Button
                        variant="outlined"
                        onClick={() => navigate(`/maker/products/${product._id}/edit`)}
                      >
                        {translate("makerProducts.edit")}
                      </Button>
                    )}
                    {['draft', 'rejected'].includes(product.status) && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => openDeleteDialog(product)}
                      >
                        {translate("makerProducts.delete")}
                      </Button>
                    )}
                    {product.status === 'pending_review' && (
                      <Typography variant="body2" color="textSecondary">
                        {translate("makerProducts.underReview")}
                      </Typography>
                    )}
                    {product.status === 'live' && (
                      <Typography variant="body2" color="success.main">
                        {translate("makerProducts.live")}
                      </Typography>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>{translate("makerProducts.deleteConfirm")}</DialogTitle>
          <DialogContent>
            <Typography>
              {translate("makerProducts.deleteMessage")} "{productToDelete?.name}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              {translate("makerProducts.cancel")}
            </Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              {translate("makerProducts.delete")}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default MakerProducts;

