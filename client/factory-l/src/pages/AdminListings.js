import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import classes from "./AdminListings.module.css";
import categoriesConfig from "../data/marketplaceCategories";
import translate from "../components/translate";
import DragAndDrop from "../components/dragAndDrop/DragAndDrop";
import {
  createProduct,
  deleteProduct,
  getAllProductsForAdmin,
  updateProduct,
} from "../api/products";
import { approveProduct, rejectProduct } from "../api/maker";

const initialForm = {
  _id: "",
  name: "",
  category: "",
  subCategory: "",
  price: "",
  description: "",
  creator: "levani",
  images: [],
  colors: [],
  status: "live",
};

const AdminListings = () => {
  const navigate = useNavigate();
  const { user, status } = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [productToReject, setProductToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/sign-in", { replace: true });
    }
  }, [status, navigate]);

  useEffect(() => {
    if (status === "authenticated" && user && !user.isAdmin) {
      navigate("/", { replace: true });
    }
  }, [status, user, navigate]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllProductsForAdmin();
      setProducts(response || []);
    } catch (err) {
      console.error("[admin listings] fetch failed", err);
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && user?.isAdmin) {
      fetchProducts();
    }
  }, [status, user, fetchProducts]);

  const categoryOptions = useMemo(
    () =>
      categoriesConfig.map((category) => ({
        value: category.id,
        label: translate(category.titleKey),
      })),
    []
  );

  const subcategoryOptions = useMemo(() => {
    const activeCategory = categoriesConfig.find((category) => category.id === form.category);
    if (!activeCategory) return [];
    return activeCategory.subcategories.map((subcategory) => ({
      value: subcategory.id,
      label: translate(subcategory.labelKey),
    }));
  }, [form.category]);

  const handleSelectProduct = (product) => {
    setEditingId(product._id);
    setForm({
      _id: product._id,
      status: product.status || 'live',
      name: product.name || "",
      category: product.category || "",
      subCategory: product.subCategory || "",
      price: product.price || "",
      description: product.description || "",
      creator: product.creator || "levani",
      images: product.images || [],
      colors: product.colors || [],
    });
    setColorInput("");
    setMessage("");
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setMessage("");
    setColorInput("");
  };

  const handleImagesAdd = (images) => {
    setForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...images],
    }));
  };

  const handleImageRemove = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleAddColor = () => {
    const value = colorInput.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.includes(value) ? prev.colors : [...prev.colors, value],
    }));
    setColorInput("");
  };

  const handleRemoveColor = (index) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, idx) => idx !== index),
    }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: form.name,
      category: form.category,
      subCategory: form.subCategory,
      price: form.price,
      description: form.description,
      creator: form.creator,
    images: form.images,
    colors: form.colors,
    };

    try {
      if (editingId) {
        const updated = await updateProduct(editingId, payload);
        setProducts((prev) =>
          prev.map((product) => (product._id === editingId ? updated : product))
        );
        setMessage("Listing updated.");
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
        setMessage("Listing created.");
      }
      resetForm();
    } catch (err) {
      console.error("[admin listings] save failed", err);
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this listing? This action cannot be undone.")) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await deleteProduct(productId);
      if (editingId === productId) {
        resetForm();
      }
      setProducts((prev) => prev.filter((product) => product._id !== productId));
      setMessage("Listing deleted.");
    } catch (err) {
      console.error("[admin listings] delete failed", err);
      setError(err.message || "Unable to delete product.");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (productId) => {
    setSaving(true);
    setError("");
    try {
      await approveProduct(productId);
      await fetchProducts();
      setMessage("Product approved and is now live.");
    } catch (err) {
      console.error("[admin listings] approve failed", err);
      setError(err.message || "Unable to approve product.");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!productToReject) return;
    setSaving(true);
    setError("");
    try {
      await rejectProduct(productToReject._id, rejectionReason);
      await fetchProducts();
      setRejectDialogOpen(false);
      setProductToReject(null);
      setRejectionReason("");
      setMessage("Product rejected.");
    } catch (err) {
      console.error("[admin listings] reject failed", err);
      setError(err.message || "Unable to reject product.");
    } finally {
      setSaving(false);
    }
  };

  const openRejectDialog = (product) => {
    setProductToReject(product);
    setRejectDialogOpen(true);
  };

  if (status !== "authenticated") {
    return (
      <div className={classes.page}>
        <div className={classes.card}>
          <p>Checking your access…</p>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className={classes.page}>
        <div className={classes.card}>
          <h1>Admin access required</h1>
          <p>You need administrator privileges to manage product listings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.page}>
      <section className={classes.card}>
        <header className={classes.header}>
          <div>
            <span className={classes.kicker}>Catalog</span>
            <h1>Manage marketplace listings</h1>
            <p>
              Update existing products, adjust pricing, and curate which items are featured in the
              marketplace.
            </p>
          </div>
          <div className={classes.actions}>
            <button type="button" onClick={resetForm}>
              {editingId ? "Start new listing" : "Reset form"}
            </button>
            <button type="button" onClick={fetchProducts} disabled={loading}>
              Refresh
            </button>
          </div>
        </header>

        <div className={classes.content}>
          <div className={classes.tableWrapper}>
            {loading ? (
              <div className={classes.loader}>Loading listings…</div>
            ) : (
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Colors</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const categoryLabel = translate(`categories.${product.category}`);
                    const subcategoryLabel = product.subCategory
                      ? translate(`categories.${product.subCategory}`)
                      : null;
                    return (
                      <tr
                        key={product._id}
                        className={
                          editingId === product._id ? classes.activeRow : undefined
                        }
                      >
                        <td>
                          <div className={classes.itemCell}>
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} />
                            ) : (
                              <div className={classes.placeholder}>No image</div>
                            )}
                            <div>
                              <strong>{product.name}</strong>
                              <div className={classes.muted}>
                                {product.creator || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span>{categoryLabel || product.category || "—"}</span>
                          {subcategoryLabel ? (
                            <div className={classes.muted}>{subcategoryLabel}</div>
                          ) : null}
                        </td>
                        <td>
                          {product.colors?.length ? (
                            <div className={classes.colorChips}>
                              {product.colors.slice(0, 5).map((color, index) => (
                                <span key={`${product._id}-${color}-${index}`} className={classes.colorChip}>
                                  <span
                                    className={classes.colorSwatch}
                                    style={{ backgroundColor: color || "#1c3d27" }}
                                  />
                                  {color}
                                </span>
                              ))}
                              {product.colors.length > 5 && (
                                <span className={classes.muted}>+{product.colors.length - 5} more</span>
                              )}
                            </div>
                          ) : (
                            <span className={classes.muted}>—</span>
                          )}
                        </td>
                        <td>
                          <strong>₾{product.price}</strong>
                        </td>
                        <td>
                          <span className={classes.statusBadge} data-status={product.status || 'live'}>
                            {product.status === 'pending_review' ? 'Pending Review' :
                             product.status === 'live' ? 'Live' :
                             product.status === 'draft' ? 'Draft' :
                             product.status === 'rejected' ? 'Rejected' :
                             product.status === 'approved' ? 'Approved' :
                             'Live'}
                          </span>
                        </td>
                        <td>
                          <span className={classes.muted}>
                            {product.updatedAt
                              ? new Date(product.updatedAt).toLocaleString()
                              : "—"}
                          </span>
                        </td>
                        <td className={classes.rowActions}>
                          {(product.status === 'pending_review' || product.status === 'draft' || !product.status || product.status === 'rejected') && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(product._id)}
                                className={classes.approve}
                                disabled={saving}
                              >
                                Approve
                              </button>
                              {product.status === 'pending_review' && (
                                <button
                                  type="button"
                                  onClick={() => openRejectDialog(product)}
                                  className={classes.reject}
                                  disabled={saving}
                                >
                                  Reject
                                </button>
                              )}
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSelectProduct(product)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product._id)}
                            className={classes.danger}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!products.length && (
                    <tr>
                      <td colSpan={6} className={classes.emptyState}>
                        No listings yet. Use the form to create your first product.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <form className={classes.form} onSubmit={handleSubmit}>
            <div className={classes.formHeader}>
              <h2>{editingId ? "Edit listing" : "Create listing"}</h2>
              {message && <span className={classes.success}>{message}</span>}
              {error && <span className={classes.error}>{error}</span>}
            </div>

            <label>
              Product name
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </label>

            <div className={classes.inlineGroup}>
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(e) =>
                    handleChange("category", e.target.value || "")
                  }
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Subcategory
                <select
                  value={form.subCategory}
                  onChange={(e) =>
                    handleChange("subCategory", e.target.value || "")
                  }
                  disabled={!form.category}
                  required
                >
                  <option value="">Select subcategory</option>
                  {subcategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={classes.inlineGroup}>
              <label>
                Price
                <input
                  type="text"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  required
                />
              </label>

              <label>
                Creator
                <input
                  type="text"
                  value={form.creator}
                  onChange={(e) => handleChange("creator", e.target.value)}
                  required
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                required
              />
            </label>

            <div className={classes.colorsFieldset}>
              <span>Colors</span>
              <div className={classes.colorInputRow}>
                <input
                  type="text"
                  value={colorInput}
                  placeholder="Add color name or hex code"
                  onChange={(event) => setColorInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddColor();
                    }
                  }}
                />
                <button type="button" onClick={handleAddColor}>
                  Add
                </button>
              </div>
              {form.colors.length > 0 && (
                <div className={classes.colorChips}>
                  {form.colors.map((color, index) => (
                    <span key={`${color}-${index}`} className={classes.colorChip}>
                      <span
                        className={classes.colorSwatch}
                        style={{ backgroundColor: color || "#1c3d27" }}
                      />
                      {color}
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(index)}
                        aria-label={`Remove ${color}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={classes.imagesSection}>
              <span>Images</span>
              <div className={classes.imagePreviewGrid}>
                {form.images?.map((img, idx) => (
                  <div key={`${img}-${idx}`} className={classes.imagePreview}>
                    <img src={img} alt={`preview-${idx}`} />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(idx)}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {!form.images?.length && (
                  <p className={classes.muted}>No images added yet.</p>
                )}
              </div>
              <DragAndDrop
                onChange={(images) => handleImagesAdd(images)}
                text="Choose images or drag them here:"
              />
            </div>

            {editingId && (
              <div>
                <label>
                  Status
                  <select
                    value={form.status || 'live'}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="live">Live</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {(form.status === 'pending_review' || form.status === 'draft' || !form.status || form.status === 'rejected') && (
                    <button
                      type="button"
                      onClick={() => handleApprove(form._id)}
                      className={classes.approve}
                      disabled={saving}
                    >
                      Approve & Make Live
                    </button>
                  )}
                  {form.status === 'pending_review' && (
                    <button
                      type="button"
                      onClick={() => openRejectDialog({ _id: form._id, name: form.name })}
                      className={classes.reject}
                      disabled={saving}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className={classes.formActions}>
              <button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Create listing"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className={classes.ghost}
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel editing
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Reject Dialog */}
        {rejectDialogOpen && (
          <div className={classes.dialogOverlay} onClick={() => setRejectDialogOpen(false)}>
            <div className={classes.dialog} onClick={(e) => e.stopPropagation()}>
              <h3>Reject Product</h3>
              <p>Please provide a reason for rejecting this product:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Rejection reason..."
                rows={4}
                className={classes.textarea}
              />
              <div className={classes.dialogActions}>
                <button
                  type="button"
                  onClick={() => {
                    setRejectDialogOpen(false);
                    setProductToReject(null);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className={classes.danger}
                  disabled={!rejectionReason.trim() || saving}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminListings;

