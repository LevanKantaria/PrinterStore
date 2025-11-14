import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, Typography, CircularProgress, Alert, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import classes from "./AdminApplications.module.css";
import translate from "../components/translate";
import { listAllApplications, approveApplication, rejectApplication, getApplicationById } from "../api/maker";

const AdminApplications = () => {
  const navigate = useNavigate();
  const { status: authStatus, user } = useSelector((state) => state.auth);
  const currentLang = useSelector((state) => state.lang.lang);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated" || !user?.isAdmin) {
      navigate("/", { replace: true });
      return;
    }

    loadApplications();
  }, [authStatus, user, navigate, filter]);

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const data = await listAllApplications(params);
      setApplications(data || []);
    } catch (err) {
      console.error("[adminApplications] load failed", err);
      setError(err.message || translate("adminApplications.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await approveApplication(id);
      await loadApplications();
      setSelectedApp(null);
    } catch (err) {
      setError(err.message || translate("adminApplications.approveError"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      await rejectApplication(selectedApp._id, rejectionReason);
      await loadApplications();
      setRejectDialogOpen(false);
      setSelectedApp(null);
      setRejectionReason("");
    } catch (err) {
      setError(err.message || translate("adminApplications.rejectError"));
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (app) => {
    setSelectedApp(app);
    setRejectDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
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
          <h1>{translate("adminApplications.title")}</h1>
          <div className={classes.filters}>
            <Button
              variant={filter === "all" ? "contained" : "outlined"}
              onClick={() => setFilter("all")}
            >
              {translate("adminApplications.all")}
            </Button>
            <Button
              variant={filter === "pending" ? "contained" : "outlined"}
              onClick={() => setFilter("pending")}
            >
              {translate("adminApplications.pending")}
            </Button>
            <Button
              variant={filter === "approved" ? "contained" : "outlined"}
              onClick={() => setFilter("approved")}
            >
              {translate("adminApplications.approved")}
            </Button>
            <Button
              variant={filter === "rejected" ? "contained" : "outlined"}
              onClick={() => setFilter("rejected")}
            >
              {translate("adminApplications.rejected")}
            </Button>
          </div>
        </div>

        {error && <Alert severity="error">{error}</Alert>}

        <div className={classes.stats}>
          <Card>
            <CardContent>
              <Typography variant="h6">{translate("adminApplications.total")}</Typography>
              <Typography variant="h4">{applications.length}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6">{translate("adminApplications.pending")}</Typography>
              <Typography variant="h4">
                {applications.filter((a) => a.status === "pending").length}
              </Typography>
            </CardContent>
          </Card>
        </div>

        <div className={classes.applicationsList}>
          {applications.length === 0 ? (
            <Typography>{translate("adminApplications.noApplications")}</Typography>
          ) : (
            applications.map((app) => (
              <Card key={app._id} className={classes.applicationCard}>
                <CardContent>
                  <div className={classes.cardHeader}>
                    <div>
                      <Typography variant="h6">
                        {app.user?.displayName || app.user?.email || "Unknown"}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </Typography>
                    </div>
                    <Chip
                      label={translate(`adminApplications.status.${app.status}`)}
                      color={getStatusColor(app.status)}
                    />
                  </div>

                  <div className={classes.details}>
                    <div>
                      <Typography variant="subtitle2">
                        {translate("adminApplications.whatToSell")}
                      </Typography>
                      <Typography>{app.answers?.whatToSell}</Typography>
                    </div>
                    <div>
                      <Typography variant="subtitle2">
                        {translate("adminApplications.location")}
                      </Typography>
                      <Typography>{app.answers?.location}</Typography>
                    </div>
                    <div>
                      <Typography variant="subtitle2">
                        {translate("adminApplications.machines")}
                      </Typography>
                      <Typography>
                        {app.answers?.machines?.map((m) => `${m.brand} ${m.model}`).join(", ")}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="subtitle2">
                        {translate("adminApplications.filamentBrands")}
                      </Typography>
                      <Typography>{app.answers?.filamentBrands?.join(", ")}</Typography>
                    </div>
                  </div>

                  {app.status === "pending" && (
                    <div className={classes.actions}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleApprove(app._id)}
                        disabled={actionLoading}
                      >
                        {translate("adminApplications.approve")}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => openRejectDialog(app)}
                        disabled={actionLoading}
                      >
                        {translate("adminApplications.reject")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
          <DialogTitle>{translate("adminApplications.rejectTitle")}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={translate("adminApplications.rejectPlaceholder")}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>
              {translate("adminApplications.cancel")}
            </Button>
            <Button
              onClick={handleReject}
              color="error"
              variant="contained"
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {translate("adminApplications.reject")}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminApplications;

