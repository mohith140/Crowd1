import * as React from "react";
import axios from "axios";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useHistory } from "react-router-dom";
import { SERVER_URL } from "../constant/serverUrl";

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

export default function SignUpAudience() {
  let history = useHistory();
  const [errorMessage, setErrorMessage] = React.useState("");
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    axios
      .post(SERVER_URL + "/api/auth/register/audience", {
        userType: "audience",
        firstName: data.get("firstName"),
        lastName: data.get("lastName"),
        email: data.get("email"),
        password: data.get("password"),
      })
      .then((response) => {
        localStorage.setItem("email", response.data.email);
        localStorage.setItem("userType", response.data.userType);
        localStorage.setItem("firstName", response.data.firstName);
        localStorage.setItem("lastName", response.data.lastName);
        history.replace("/audiencedashboard/creators");
      })
      .catch((err) => {
        setErrorMessage("An account with this email already exists.");
      });
  };

  return (
    <div style={ {
      backgroundImage: 'url("https://th.bing.com/th?id=OIP.pkEgMQ-w4ODluEniaf1DngHaEK&w=333&h=187&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2")',
      // backgroundSize: "cover",
       backgroundPosition: "center",
       backgroundAttachment: "fixed", 
       minHeight: "100vh"
    }}>
  
    <ThemeProvider theme={theme}>
      <Grid container justifyContent="flex-end">
        <Grid item>
          <IconButton
            aria-label="close"
            onClick={() => {
              history.push("/home/creators");
            }}
          >
            <CloseIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Container
        component="main"
        maxWidth="sm"
        sx={{
         // backgroundImage: 'url("https://th.bing.com/th/id/OIP.iQUclIUtqQuXoJhGMLQorgHaE7?w=229&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7")',
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundAttachment: "fixed",
          position:"webkit-sticky",

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
              <Typography component="h1" variant="h5">
                Sign Up - Audience
              </Typography>
              {errorMessage && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {errorMessage}
                  </Typography>
                )}
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ mt: 3 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      autoComplete="firstName"
                      name="firstName"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="lastName"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
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
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                    color: "white",
                  }}
                >
                  Sign Up
                </Button>
                <Grid container justifyContent="flex-end">
                  <Grid item>
                    <Link
                      href="#"
                      variant="body2"
                      onClick={() => history.push("/login")}
                      style={{ color: "black" }}
                      underline="hover"
                    >
                      Already have an account? Sign in
                    </Link>
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


// import * as React from "react";
// import axios from "axios";
// import Avatar from "@mui/material/Avatar";
// import Button from "@mui/material/Button";
// import CssBaseline from "@mui/material/CssBaseline";
// import TextField from "@mui/material/TextField";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import Checkbox from "@mui/material/Checkbox";
// import Link from "@mui/material/Link";
// import Grid from "@mui/material/Grid";
// import Box from "@mui/material/Box";
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import Typography from "@mui/material/Typography";
// import Container from "@mui/material/Container";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
// import CloseIcon from "@mui/icons-material/Close";
// import IconButton from "@mui/material/IconButton";
// import { useHistory } from "react-router-dom";
// import { SERVER_URL } from "../constant/serverUrl";

// function Copyright(props) {
//   return (
//     <Typography
//       variant="body2"
//       color="text.secondary"
//       align="center"
//       {...props}
//     >
//       Fundify © {new Date().getFullYear()}
//     </Typography>
//   );
// }

// const theme = createTheme();

// export default function SignUpAudience() {
//   let history = useHistory();

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     const data = new FormData(event.currentTarget);
//     // eslint-disable-next-line no-console
//     console.log({
//       firstName: data.get("firstName"),
//       lastName: data.get("lastName"),
//       email: data.get("email"),
//       password: data.get("password"),
//     });

//     axios
//       .post(SERVER_URL + "/users/new", {
//         userType: "audience",
//         firstName: data.get("firstName"),
//         lastName: data.get("lastName"),
//         email: data.get("email"),
//         password: data.get("password"),
//       })
//       .then((response) => {
//         localStorage.setItem("email", response.data.email);
//         localStorage.setItem("userType", response.data.userType);
//         localStorage.setItem("firstName", response.data.firstName);
//         localStorage.setItem("lastName", response.data.lastName);
//         history.replace("/audiencedashboard/creators");
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <Grid container justifyContent="flex-end">
//         <Grid item>
//           <IconButton
//             aria-label="close"
//             onClick={() => {
//               history.push("/home/creators");
//             }}
//           >
//             <CloseIcon />
//           </IconButton>
//         </Grid>
//       </Grid>
//       <Container component="main" maxWidth="xs">
//         <CssBaseline />
//         <Box
//           sx={{
//             marginTop: 8,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
//             <LockOutlinedIcon />
//           </Avatar>
//           <Typography component="h1" variant="h5">
//             Sign Up - Audience/ User
//           </Typography>
//           <Box
//             component="form"
//             noValidate
//             onSubmit={handleSubmit}
//             sx={{ mt: 3 }}
//           >
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   autoComplete="fname"
//                   name="firstName"
//                   required
//                   fullWidth
//                   id="firstName"
//                   label="First Name"
//                   autoFocus
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <TextField
//                   required
//                   fullWidth
//                   id="lastName"
//                   label="Last Name"
//                   name="lastName"
//                   autoComplete="lname"
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   required
//                   fullWidth
//                   id="email"
//                   label="Email Address"
//                   name="email"
//                   autoComplete="email"
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   required
//                   fullWidth
//                   name="password"
//                   label="Password"
//                   type="password"
//                   id="password"
//                   autoComplete="new-password"
//                 />
//               </Grid>
//             </Grid>
//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               sx={{ mt: 3, mb: 2 }}
//               style={{ backgroundColor: "black" }}
//             >
//               Sign Up
//             </Button>
//             <Grid container justifyContent="flex-end">
//               <Grid item>
//                 <Link
//                   href="#"
//                   variant="body2"
//                   onClick={() => {
//                     history.push("/login");
//                   }}
//                   style={{ color: "black" }}
//                   underline="hover"
//                 >
//                   Already have an account? Sign in
//                 </Link>
//               </Grid>
//             </Grid>
//           </Box>
//         </Box>
//         <Copyright sx={{ mt: 5 }} />
//       </Container>
//     </ThemeProvider>
//   );
// }
