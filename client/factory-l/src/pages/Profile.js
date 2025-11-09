import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { signOut } from "firebase/auth";
import classes from "./Profile.module.css";
import { auth } from "../firebase";
import OrderHistory from "../components/profile/OrderHistory";
import { getProfile } from "../api/profile";
import { getOrders } from "../api/orders";
import { ApiError } from "../api/http";

const Profile = () => {
  const navigate = useNavigate();
  const { user, status } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (status !== "loading" && !user) {
      navigate("/sign-in", { replace: true });
    }
  }, [status, user, navigate]);

  const loadProfileAndOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [profileResponse, ordersResponse] = await Promise.allSettled([
        getProfile(),
        getOrders({ limit: 20 }),
      ]);

      if (profileResponse.status === "fulfilled") {
        setProfileData(profileResponse.value);
      } else {
        throw profileResponse.reason;
      }

      if (ordersResponse.status === "fulfilled") {
        setOrders(ordersResponse.value || []);
      } else if (ordersResponse.reason instanceof ApiError && ordersResponse.reason.status === 404) {
        setOrders([]);
      } else if (ordersResponse.status === "rejected") {
        throw ordersResponse.reason;
      }
    } catch (err) {
      console.error("[profile] loadProfileAndOrders failed", err);
      setError(err.message || "Unable to load profile data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (status === "authenticated" && user) {
      loadProfileAndOrders();
    }
  }, [status, user, loadProfileAndOrders]);

  const displayName = useMemo(() => {
    if (!user) return "";
    if (user.displayName) {
      return user.displayName;
    }
    return user.email || "";
  }, [user]);

  const initials = useMemo(() => {
    if (!displayName) return "?";
    return displayName
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [displayName]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/sign-in", { replace: true });
    } catch (err) {
      console.error("Sign-out failed", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className={classes.page}>
        <div className={classes.loader}>
          <CircularProgress size={36} thickness={4} />
          <span>Loading your profile…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const accountCreated =
    profileData?.createdAt ||
    user.metadata?.creationTime ||
    user.createdAt ||
    null;

  const provider =
    user.providerData?.[0]?.providerId || user.providerId || "email/password";

  return (
    <div className={classes.page}>
      <section className={classes.card}>
        <header className={classes.header}>
          <div className={classes.avatar}>
            {user.photoURL ? <img src={user.photoURL} alt={displayName} /> : <span>{initials}</span>}
          </div>
          <div className={classes.headerText}>
            <h1>Your profile</h1>
            <p>Manage how Factory L personalizes your experience.</p>
          </div>
        </header>

        {error && <Alert severity="error">{error}</Alert>}

        <div className={classes.infoGroup}>
          <div>
            <span className={classes.label}>Name</span>
            <p>{displayName || profileData?.displayName || "—"}</p>
          </div>
          <div>
            <span className={classes.label}>Email</span>
            <p>{user.email || profileData?.email || "—"}</p>
          </div>
          <div>
            <span className={classes.label}>Account created</span>
            <p>{accountCreated ? new Date(accountCreated).toLocaleString() : "—"}</p>
          </div>
          <div>
            <span className={classes.label}>Auth provider</span>
            <p>{provider}</p>
          </div>
        </div>

        <div className={classes.actions}>
          <Button variant="contained" color="success" disableElevation onClick={() => navigate("/upload")}>
            Start a new project
          </Button>
          <Button variant="outlined" color="success" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>

        <OrderHistory orders={orders} />
      </section>
    </div>
  );
};

export default Profile;
