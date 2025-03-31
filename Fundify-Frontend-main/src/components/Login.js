import * as React from "react";
import axios from "axios";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { SERVER_URL } from "../constant/serverUrl";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { blueGrey } from "@mui/material/colors";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { CircularProgress } from '@mui/material';

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >

      {/* Fundify © {new Date().getFullYear()} */}
    </Typography>
  );
}

const theme = createTheme();

export default function LoginAudience() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [userType, setUserType] = React.useState('audience');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', { email, userType });
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password,
        userType
      });
      
      const { token, user } = response.data;
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('email', user.email);
      localStorage.setItem('userType', user.userType);
      localStorage.setItem('firstName', user.firstName);
      localStorage.setItem('lastName', user.lastName);
      
      console.log('Login successful:', user);
      
      // Determine redirect path based on user type
      const redirectPath = user.userType === 'creator' 
        ? '/creatordashboard'
        : '/audiencedashboard';
      
      console.log(`Redirecting to ${redirectPath}`);
      
      // Use standard browser navigation for consistent behavior
      window.location.href = redirectPath;
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={ {backgroundImage: 'url("https://th.bing.com/th?id=OIP.pkEgMQ-w4ODluEniaf1DngHaEK&w=333&h=187&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2")'}}>
    <ThemeProvider theme={theme}>
      <Container
        component="main"
        maxWidth="sm"
        sx={{
         // backgroundImage: 'url("https://th.bing.com/th?id=OIP.pkEgMQ-w4ODluEniaf1DngHaEK&w=333&h=187&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2")',
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CssBaseline />
        <Card sx={{ maxWidth: 500, padding: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
              </Avatar>
              {error && (
                  <Typography color="error" sx={{ mt: 2 }} >
                    {error}
                  </Typography>
                )}
              <Typography component="h1" variant="h5">
                Login
              </Typography>
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ mt: 3 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Grid>
                </Grid>
                <FormControl
                  component="fieldset"
                  style={{
                    marginTop: ".75rem",
                    marginBottom: ".25rem",
                  }}
                >
                  <RadioGroup
                    row
                    aria-label="user"
                    name="userType"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                  >
                    <FormControlLabel
                      value="creator"
                      control={<Radio />}
                      label="Creator"
                    />
                    <FormControlLabel
                      value="audience"
                      control={<Radio />}
                      label="Audience"
                    />
                  </RadioGroup>
                </FormControl>
               
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 1,
                    mb: 2,
                    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                    color: "white",
                  }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Login'}
                </Button>

                <Grid
                  container
                  justifyContent="flex-end"
                  style={{ marginBottom: ".25rem" }}
                >
                  <Grid item>
                    <small>
                      Create new account as{" "}
                      <Link
                        href="#"
                        onClick={() => {
                          window.location.href = "/signupcreator";
                        }}
                        style={{ color: "black" }}
                        underline="hover"
                      >
                        creator
                      </Link>{" "}
                      or{" "}
                      <Link
                        href="#"
                        onClick={() => {
                          window.location.href = "/signupaudience";
                        }}
                        style={{ color: "black" }}
                        underline="hover"
                      >
                        audience
                      </Link>
                    </small>
                  </Grid>
                  
                </Grid>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider></div>

  );
}
