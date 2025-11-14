import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, CardContent, Typography, Button, Grid } from "@mui/material";
import classes from "./AdminDashboard.module.css";
import translate from "../components/translate";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { status: authStatus, user } = useSelector((state) => state.auth);

  if (authStatus === "unauthenticated" || !user?.isAdmin) {
    navigate("/", { replace: true });
    return null;
  }

  const adminSections = [
    {
      title: translate("adminDashboard.orders.title") || "Orders",
      description: translate("adminDashboard.orders.description") || "Manage and track customer orders",
      icon: "📦",
      path: "/admin/orders",
      color: "#4f9c6b",
    },
    {
      title: translate("adminDashboard.listings.title") || "Product Listings",
      description: translate("adminDashboard.listings.description") || "Create, edit, and manage marketplace products",
      icon: "📋",
      path: "/admin/listings",
      color: "#2f6f46",
    },
    {
      title: translate("adminDashboard.applications.title") || "Maker Applications",
      description: translate("adminDashboard.applications.description") || "Review and approve maker applications",
      icon: "👤",
      path: "/admin/applications",
      color: "#5a8c6b",
    },
    {
      title: translate("adminDashboard.productReview.title") || "Product Review",
      description: translate("adminDashboard.productReview.description") || "Review and approve maker products",
      icon: "✅",
      path: "/admin/products/review",
      color: "#3d7a52",
    },
    {
      title: translate("adminDashboard.payments.title") || "Maker Payments",
      description: translate("adminDashboard.payments.description") || "Process payments to makers",
      icon: "💰",
      path: "/admin/payments",
      color: "#4a8c5f",
    },
  ];

  return (
    <div className={classes.page}>
      <div className={classes.container}>
        <div className={classes.header}>
          <h1>{translate("adminDashboard.title") || "Admin Dashboard"}</h1>
          <p>{translate("adminDashboard.subtitle") || "Manage your marketplace and makers"}</p>
        </div>

        <div className={classes.grid}>
          {adminSections.map((section, index) => (
            <Card
              key={index}
              className={classes.card}
              onClick={() => navigate(section.path)}
              style={{ cursor: "pointer" }}
            >
              <CardContent className={classes.cardContent}>
                <div className={classes.icon} style={{ backgroundColor: `${section.color}20`, color: section.color }}>
                  {section.icon}
                </div>
                <Typography variant="h5" className={classes.cardTitle}>
                  {section.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" className={classes.cardDescription}>
                  {section.description}
                </Typography>
                <Button
                  variant="contained"
                  className={classes.cardButton}
                  style={{ backgroundColor: section.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(section.path);
                  }}
                >
                  {translate("adminDashboard.open") || "Open"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

