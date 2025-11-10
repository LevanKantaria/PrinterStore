import { apiRequest } from "./http";

export const getProducts = (params = {}) => {
  const query = new URLSearchParams();
  if (params.category) {
    query.append("category", params.category);
  }
  if (params.subCategory) {
    query.append("subCategory", params.subCategory);
  }
  if (params.id) {
    query.append("id", params.id);
  }
  const queryString = query.toString();
  return apiRequest(`/api/products${queryString ? `?${queryString}` : ""}`);
};

export const getAllProductsForAdmin = () =>
  apiRequest("/api/products/admin/all");

export const createProduct = (payload) =>
  apiRequest("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateProduct = (id, payload) =>
  apiRequest(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteProduct = (id) =>
  apiRequest(`/api/products/${id}`, {
    method: "DELETE",
  });

