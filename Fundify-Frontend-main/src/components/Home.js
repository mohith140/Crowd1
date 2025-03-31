import React from "react";
import { AppBar, Box, Toolbar, Typography, Button, Grid, Container } from "@mui/material";
import { useHistory } from "react-router-dom";
import Creators from "./Creators";
import Projects from "./Projects";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const HeroSection = () => (
  <Box
    sx={{
      backgroundImage: "url(https://source.unsplash.com/1600x900/?startup,innovation)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "400px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      textAlign: "center",
      padding: "20px",
    }}
  >
    <Container>
      <Typography variant="h3" sx={{ fontWeight: "bold" }}>
        Empower Ideas Through Crowdfunding
      </Typography>
      <Typography variant="h6" sx={{ marginTop: "10px" }}>
        Connect with investors, bring innovations to life, and make an impact.
      </Typography>
    </Container>
  </Box>
);

const Footer = () => (
  <Box sx={{ backgroundColor: "#222", color: "white", padding: "20px", textAlign: "center", marginTop: "40px" }}>
    <Typography variant="body1">&copy; 2025 Crowd Funding. All rights reserved.</Typography>
  </Box>
);

export default function Home() {
  let history = useHistory();

  return (
    <React.Fragment>
      {/* Navigation Bar */}
      <AppBar position="fixed" sx={{ backgroundColor: "#1a237e", padding: "10px 0" }}>
        <Toolbar>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6" sx={{ fontWeight: "bold", marginLeft: "20px", color: "#ffeb3b" }}>
                Crowd Funding
              </Typography>
            </Grid>
            <Grid item>
              <Button variant="contained" sx={{ backgroundColor: "#ffeb3b", color: "black", marginRight: "10px" }} onClick={() => history.push("/signupcreator")}>
                Sign up
              </Button>
              <Button variant="contained" sx={{ backgroundColor: "#ffeb3b", color: "black" }} onClick={() => history.push("/login")}>
                Login
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <HeroSection />

      {/* About Crowdfunding */}
      <Container sx={{ marginTop: "40px", marginBottom: "40px" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}>
          What is Crowdfunding?
        </Typography>
        <Typography variant="body1" textAlign="center">
          Crowdfunding is a way of raising funds for a project or venture by collecting small amounts of money from a large number of people, typically via the internet. 
          It enables entrepreneurs, artists, and innovators to gain financial support and bring their ideas to reality without relying on traditional investors.
        </Typography>
      </Container>

      {/* Routes */}
     
      {/* Footer */}
      <Footer />
    </React.Fragment>
  );
}
