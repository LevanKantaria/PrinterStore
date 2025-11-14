import { apiRequest } from "./http";

export const submitReview = (orderId, reviewData) =>
  apiRequest(`/api/reviews/order/${orderId}`, {
    method: "POST",
    body: JSON.stringify(reviewData),
  });

export const getMyReviews = () =>
  apiRequest("/api/reviews/my");

export const getMakerReviews = (makerId) =>
  apiRequest(`/api/reviews/maker/${makerId}`);

