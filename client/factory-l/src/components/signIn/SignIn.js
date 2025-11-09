import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import MuiLink from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { FirebaseError } from "firebase/app";
import { useSelector } from "react-redux";
import classes from "./SignIn.module.css";

const defaultTheme = createTheme();

export default function SignIn() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [googleSubmitting, setGoogleSubmitting] = React.useState(false);
  const { user, status } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (status === "authenticated" && user) {
      navigate("/", { replace: true });
    }
  }, [status, user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email")?.toString().trim();
    const password = data.get("password")?.toString().trim();

    if (!email || !password) {
      setErrorMessage("Please fill in both your email address and password.");
      setSuccessMessage("");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMessage("Signed in successfully.");
    } catch (error) {
      const errorCode = error instanceof FirebaseError ? error.code : "unknown";
      setErrorMessage(
        errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password"
          ? "Invalid email or password. Please try again."
          : "We couldn’t sign you in just yet. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setGoogleSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMessage("Signed in with Google.");
    } catch (error) {
      const errorCode = error instanceof FirebaseError ? error.code : "unknown";
      setErrorMessage(
        errorCode === "auth/popup-closed-by-user"
          ? "The Google sign-in popup was closed before finishing."
          : "Google sign-in failed. Please try again."
      );
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box component="section" className={classes.card}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" className={classes.title}>
              Welcome back
            </Typography>
            <Typography variant="body2" className={classes.subtitle}>
              Sign in to keep shaping nature-forward experiences for your customers.
            </Typography>

            {errorMessage && (
              <Alert severity="error" className={classes.alert}>
                {errorMessage}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" className={classes.alert}>
                {successMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate className={classes.form}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />

              <FormControlLabel
                control={<Checkbox value="remember" color="success" size="small" />}
                label="Remember me"
                className={classes.rememberMe}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                className={classes.primaryButton}
                disabled={submitting || googleSubmitting}
              >
                {submitting ? (
                  <Box component="span" className={classes.loadingState}>
                    <CircularProgress size={18} thickness={5} />
                    <span>Signing in…</span>
                  </Box>
                ) : (
                  "Sign in"
                )}
              </Button>

              <Grid container className={classes.linksRow}>
                <Grid item xs>
                  <MuiLink component={RouterLink} to="/forgot-password" variant="body2">
                    Forgot password?
                  </MuiLink>
                </Grid>
                <Grid item>
                  <MuiLink component={RouterLink} to="/sign-up" variant="body2">
                    Need an account? Sign up
                  </MuiLink>
                </Grid>
              </Grid>

              <Divider className={classes.divider}>Or continue with</Divider>

              <Button
                type="button"
                fullWidth
                variant="outlined"
                startIcon={googleSubmitting ? <CircularProgress size={18} thickness={5} /> : <GoogleIcon />}
                className={classes.googleButton}
                onClick={handleGoogleSignIn}
                disabled={googleSubmitting || submitting}
              >
                {googleSubmitting ? "Connecting…" : "Sign in with Google"}
              </Button>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </div>
  );
}