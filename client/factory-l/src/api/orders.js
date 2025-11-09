import { apiRequest } from "./http";

export const getOrders = (params = {}) => {
  const query = new URLSearchParams();
  if (params.limit) {
    query.append("limit", params.limit);
  }

  const queryString = query.toString();
  return apiRequest(`/api/orders${queryString ? `?${queryString}` : ""}`);
};

export const createOrder = (orderPayload) =>
  apiRequest("/api/orders", {
    method: "POST",
    body: JSON.stringify(orderPayload),
  });

export const listAllOrders = (params = {}) => {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") {
    query.append("status", params.status);
  }
  if (params.limit) {
    query.append("limit", params.limit);
  }
  const queryString = query.toString();
  return apiRequest(`/api/orders/admin/all${queryString ? `?${queryString}` : ""}`);
};

export const updateOrderStatus = (orderId, payload) =>
  apiRequest(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

