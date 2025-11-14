import { apiRequest } from "./http";

// Maker Payment APIs
export const getMyPayments = () =>
  apiRequest("/api/payments/my");

export const getMyPayoutSummary = () =>
  apiRequest("/api/payments/my/summary");

// Admin Payment APIs
export const getAllPendingPayments = () =>
  apiRequest("/api/payments/admin/pending");

export const processPayment = (orderId, makerId, paymentData) =>
  apiRequest(`/api/payments/admin/${orderId}/${makerId}/process`, {
    method: "POST",
    body: JSON.stringify(paymentData),
  });

