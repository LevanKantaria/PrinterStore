import React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import MuiLink from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import GoogleIcon from "@mui/icons-material/Google";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useSelector } from "react-redux";
import { auth, googleProvider } from "../../firebase";
import classes from "./SignUp.module.css";

const theme = createTheme();

const SignUp = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);
  const [googleSubmitting, setGoogleSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const { user, status } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (status === "authenticated" && user) {
      navigate("/", { replace: true });
    }
  }, [status, user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const firstName = data.get("firstName")?.toString().trim();
    const lastName = data.get("lastName")?.toString().trim();
    const email = data.get("email")?.toString().trim();
    const password = data.get("password")?.toString();

    if (!firstName || !lastName || !email || !password) {
      setErrorMessage("Please fill in your name, email, and password.");
      setSuccessMessage("");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Passwords need at least 8 characters.");
      setSuccessMessage("");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });
      setSuccessMessage("Account created! Redirecting…");
      navigate("/", { replace: true });
    } catch (error) {
      const errorCode = error instanceof FirebaseError ? error.code : "unknown";
      switch (errorCode) {
        case "auth/email-already-in-use":
          setErrorMessage("An account with this email already exists. Try signing in instead.");
          break;
        case "auth/weak-password":
          setErrorMessage("That password is too weak. Try adding more characters and numbers.");
          break;
        default:
          setErrorMessage("We couldn’t create your account right now. Please try again.");
          break;
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setGoogleSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMessage("Signed in with Google. Redirecting…");
      navigate("/", { replace: true });
    } catch (error) {
      const errorCode = error instanceof FirebaseError ? error.code : "unknown";
      setErrorMessage(
        errorCode === "auth/popup-closed-by-user"
          ? "The Google popup was closed before finishing."
          : "Google sign-up failed. Please try again."
      );
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box component="section" className={classes.card}>
            <Avatar className={classes.avatar}>
              <PersonAddAltIcon />
            </Avatar>
            <Typography component="h1" variant="h5" className={classes.title}>
              Create your account
            </Typography>
            <Typography variant="body2" className={classes.subtitle}>
              Join Factory L to prototype faster, manufacture smarter, and track every idea along the journey.
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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField name="firstName" required fullWidth id="firstName" label="First name" autoComplete="given-name" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField name="lastName" required fullWidth id="lastName" label="Last name" autoComplete="family-name" />
                </Grid>
                <Grid item xs={12}>
                  <TextField name="email" required fullWidth id="email" label="Email address" autoComplete="email" />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="password"
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    helperText="Use at least 8 characters."
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                className={classes.primaryButton}
                disabled={submitting || googleSubmitting}
                startIcon={submitting ? <CircularProgress size={18} thickness={5} /> : <LockOpenIcon />}
              >
                {submitting ? "Creating account…" : "Create account"}
              </Button>

              <Button
                type="button"
                fullWidth
                variant="outlined"
                className={classes.googleButton}
                startIcon={googleSubmitting ? <CircularProgress size={18} thickness={5} /> : <GoogleIcon />}
                onClick={handleGoogleSignUp}
                disabled={googleSubmitting || submitting}
              >
                {googleSubmitting ? "Connecting…" : "Sign up with Google"}
              </Button>

              <Grid container justifyContent="flex-end">
                <Grid item>
                  <MuiLink component={RouterLink} to="/sign-in" variant="body2">
                    Already have an account? Sign in
                  </MuiLink>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </div>
  );
};

export default SignUp;

