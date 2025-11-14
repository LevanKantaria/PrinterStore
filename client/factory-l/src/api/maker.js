import { apiRequest } from "./http";

// Maker Application APIs
export const submitMakerApplication = (applicationData) =>
  apiRequest("/api/maker/application", {
    method: "POST",
    body: JSON.stringify(applicationData),
  });

export const getMyApplication = () =>
  apiRequest("/api/maker/application/my");

// Admin Application APIs
export const listAllApplications = (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) {
    query.append("status", params.status);
  }
  if (params.limit) {
    query.append("limit", params.limit);
  }
  const queryString = query.toString();
  return apiRequest(`/api/maker/application/admin/all${queryString ? `?${queryString}` : ""}`);
};

export const getApplicationById = (id) =>
  apiRequest(`/api/maker/application/admin/${id}`);

export const approveApplication = (id) =>
  apiRequest(`/api/maker/application/admin/${id}/approve`, {
    method: "POST",
  });

export const rejectApplication = (id, rejectionReason) =>
  apiRequest(`/api/maker/application/admin/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ rejectionReason }),
  });

// Maker Product APIs
export const getMyProducts = () =>
  apiRequest("/api/maker/products/my");

export const createMakerProduct = (productData) =>
  apiRequest("/api/maker/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });

export const updateMyProduct = (id, productData) =>
  apiRequest(`/api/maker/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });

export const deleteMyProduct = (id) =>
  apiRequest(`/api/maker/products/${id}`, {
    method: "DELETE",
  });

export const deleteMakerProduct = deleteMyProduct; // Alias for consistency

// Admin Product Review APIs
export const getPendingProducts = () =>
  apiRequest("/api/admin/products/pending");

export const getAllProductsAdmin = (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) {
    query.append("status", params.status);
  }
  if (params.makerId) {
    query.append("makerId", params.makerId);
  }
  const queryString = query.toString();
  return apiRequest(`/api/admin/products/all${queryString ? `?${queryString}` : ""}`);
};

export const approveProduct = (id) =>
  apiRequest(`/api/admin/products/${id}/approve`, {
    method: "POST",
  });

export const rejectProduct = (id, rejectionReason) =>
  apiRequest(`/api/admin/products/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ rejectionReason }),
  });

// Delivery APIs
export const generateDeliveryCode = (orderId) =>
  apiRequest(`/api/orders/${orderId}/delivery-code`, {
    method: "POST",
  });

export const confirmDeliveryWithCode = (orderId, code) =>
  apiRequest(`/api/orders/${orderId}/confirm-delivery`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });

export const getDeliveryCode = (orderId) =>
  apiRequest(`/api/orders/${orderId}/delivery-code`);

