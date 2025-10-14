import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import classes from './SignIn.module.css'




const defaultTheme = createTheme();

export default function SignIn() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };

  return (
    <div className={classes.wrapper}>
        <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
            sx={{
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor:'rgba(255,255,255,0.8)',
                borderRadius:3
            }}
            >
            <Typography component="h1" variant="h5">
                Sign in
            </Typography>
            
            <Typography component="h1" variant="subtitle1">
                Dont have account? Sign up
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
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
                {/* <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
                /> */}
                <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor:'#1E2C20' }}
                >
                Sign In
                </Button>
                <Grid container>
                <Grid item xs>
                    <Link href="#" variant="body2">
                    Forgot password?
                    </Link>
                </Grid>
                </Grid>
                <div className={classes.signInWith}>or  sign in with</div>
                <div className={classes.line}>
                  <div className={classes.left}></div>
                  <div className={classes.right}></div>
                </div>

                <div className={classes.google}>Google</div>
            </Box>
            </Box>
        </Container>
        </ThemeProvider>
    </div>
  );
}