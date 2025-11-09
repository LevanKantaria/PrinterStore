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

