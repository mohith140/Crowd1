import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import Avatar from "@mui/material/Avatar";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SendIcon from "@mui/icons-material/Send";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ExploreIcon from "@mui/icons-material/Explore";
import GroupIcon from "@mui/icons-material/Group";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import { useHistory } from "react-router-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Creators from "./audience/creators/Creators";
import Projects from "./audience/creators/Projects";
import ProjectDetails from "./audience/creators/ProjectDetails";
import Exclusive from "./audience/creators/Exclusive";
import CampaignDetails from "./audience/campaign/CampaignDetails";
import { useEffect } from "react";

// Logo component for navbar
const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #3b82f6 30%, #93c5fd 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '1px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem',
  },
}));

// Footer logo with different colors
const FooterLogo = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #64B5F6 30%, #81D4FA 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '1px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  },
}));

// Styled link for footer
const FooterLink = styled(Link)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  textDecoration: 'none',
  '&:hover': {
    color: 'white',
    textDecoration: 'none',
  },
  display: 'inline-flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

// Styled social icon button
const SocialButton = styled(IconButton)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover': {
    color: 'white',
    transform: 'translateY(-3px)',
    transition: 'all 0.3s',
  },
}));

// Search component
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function AudienceDashboard() {
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [email, setEmail] = React.useState("");
  const [subscribeSuccess, setSubscribeSuccess] = React.useState(false);
  const profileMenuOpen = Boolean(anchorEl);

  // Debug mount notification
  useEffect(() => {
    console.log('AudienceDashboard component mounted!');
    console.log('Current path:', window.location.pathname);
    
    // Set default active tab to creators
    setActiveTab("creators");
    
    // Check if we need to redirect to creators tab
    if (window.location.pathname === "/audiencedashboard") {
      console.log('Redirecting to creators tab');
      history.replace("/audiencedashboard/creators");
    }
    
    // Check localStorage for user data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('User data found in localStorage:', user);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    } else {
      console.log('No user data found in localStorage');
    }
  }, []);

  React.useEffect(() => {
    // Check for authentication data - either token or email
    const hasToken = localStorage.getItem("token");
    const hasEmail = localStorage.getItem("email");
    const userData = localStorage.getItem("user");
    
    console.log("Auth check:", { hasToken, hasEmail, userData });
    
    // If no authentication data is found, redirect to login
    if (!hasEmail && !hasToken) {
      console.log("No auth data found, redirecting to login");
      window.location.href = "/login";
      return;
    }
    
    // Determine active tab based on current path
    const path = window.location.pathname;
    if (path.includes("creators")) {
      setActiveTab("creators");
    } else if (path.includes("projects")) {
      setActiveTab("projects");
    } else if (path.includes("exclusive")) {
      setActiveTab("exclusive");
    } else {
      // If no specific tab in path, default to creators
      setActiveTab("creators");
    }
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    
    console.log("Logging out, clearing auth data");
    window.location.href = "/login";
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubscribe = (event) => {
    event.preventDefault();
    console.log(`Subscribing email: ${email}`);
    setSubscribeSuccess(true);
    setEmail("");
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSubscribeSuccess(false);
    }, 3000);
  };

  // Navigation items
  const navItems = [
    { text: 'Explore Projects', path: '/audiencedashboard/projects', icon: <ExploreIcon /> },
    { text: 'Creators', path: '/audiencedashboard/creators', icon: <GroupIcon /> },
    { text: 'Exclusive Content', path: '/audiencedashboard/exclusive', icon: <LockIcon /> },
  ];

  // Debug navigation
  useEffect(() => {
    console.log('Active tab is:', activeTab);
    console.log('Navigation items:', navItems);
  }, [activeTab]);

  // Set active tab based on path
  useEffect(() => {
    const path = window.location.pathname;
    console.log('Setting active tab based on path:', path);
    
    if (path.includes('/creators')) {
      setActiveTab('creators');
    } else if (path.includes('/projects')) {
      setActiveTab('projects');
    } else if (path.includes('/exclusive')) {
      setActiveTab('exclusive');
    } else {
      // Default to creators if path doesn't match
      setActiveTab('creators');
    }
  }, [window.location.pathname]);

  // Quick links for footer
  const quickLinks = [
    { text: 'Help Center', path: '/help' },
    { text: 'How It Works', path: '/how-it-works' },
    { text: 'Privacy Policy', path: '/privacy' },
    { text: 'Terms of Service', path: '/terms' },
  ];

  // Drawer content for mobile view
  const drawerContent = (
    <Box
      sx={{ width: 270 }}
      role="presentation"
      onClick={toggleDrawer}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
        <Logo variant="h6">FUNDIFY</Logo>
        <IconButton onClick={toggleDrawer}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => history.push(item.path)}
            selected={activeTab === item.text.toLowerCase().split(' ')[0]}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderLeft: '4px solid #1976d2',
              },
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ color: activeTab === item.text.toLowerCase().split(' ')[0] ? '#1976d2' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: activeTab === item.text.toLowerCase().split(' ')[0] ? 'bold' : 'normal' 
              }} 
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  // Profile menu items
  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={profileMenuOpen}
      onClose={handleProfileMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
          mt: 1.5,
          borderRadius: '8px',
          minWidth: 180,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem 
        sx={{ 
          py: 1,
          px: 2,
          fontWeight: 'bold',
          color: 'text.primary',
        }}
      >
        {localStorage.getItem("firstName")} {localStorage.getItem("lastName")}
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ py: 1, px: 2 }}>
        <LogoutIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
        Logout
      </MenuItem>
    </Menu>
  );

  // Footer component
  const footer = (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a237e',
        color: 'white',
        mt: 'auto',
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and About */}
          <Grid item xs={12} sm={6} md={4}>
            <FooterLogo variant="h4" gutterBottom>
              FUNDIFY
            </FooterLogo>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2, maxWidth: '90%' }}>
              Empowering creators and innovators to bring their ideas to life through community-driven fundraising.
            </Typography>
            <Stack direction="row" spacing={1}>
              <SocialButton aria-label="facebook" size="small">
                <FacebookIcon />
              </SocialButton>
              <SocialButton aria-label="twitter" size="small">
                <TwitterIcon />
              </SocialButton>
              <SocialButton aria-label="instagram" size="small">
                <InstagramIcon />
              </SocialButton>
              <SocialButton aria-label="linkedin" size="small">
                <LinkedInIcon />
              </SocialButton>
              <SocialButton aria-label="youtube" size="small">
                <YouTubeIcon />
              </SocialButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>Quick Links</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {quickLinks.map((link) => (
                <FooterLink key={link.text} href={link.path}>
                  {link.text}
                </FooterLink>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>Contact Us</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <FooterLink href="mailto:support@fundify.com">
                <EmailIcon sx={{ mr: 1, fontSize: '1rem' }} />
                support@fundify.com
              </FooterLink>
              <FooterLink href="tel:+1-800-FUNDIFY">
                <PhoneIcon sx={{ mr: 1, fontSize: '1rem' }} />
                +1-800-FUNDIFY
              </FooterLink>
              <FooterLink href="#">
                <LocationOnIcon sx={{ mr: 1, fontSize: '1rem' }} />
                123 Innovation St, Tech City
              </FooterLink>
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>Updates & News</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
              Subscribe to our newsletter for tips, trends, and fundraising insights.
            </Typography>
            <Box component="form" onSubmit={handleSubscribe}>
              <InputBase
                fullWidth
                value={email}
                onChange={handleEmailChange}
                placeholder="Your email"
                sx={{
                  mb: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
                endAdornment={
                  <IconButton 
                    edge="end" 
                    type="submit"
                    sx={{ color: 'white' }}
                  >
                    <SendIcon />
                  </IconButton>
                }
              />
              {subscribeSuccess && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1, 
                    bgcolor: 'rgba(76, 175, 80, 0.1)', 
                    color: '#81c784',
                    border: '1px solid #81c784',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="caption">Successfully subscribed!</Typography>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Divider and Copyright */}
        <Divider sx={{ mt: 4, mb: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
        <Box sx={{ display: 'flex', justifyContent: isTablet ? 'center' : 'space-between', flexDirection: isTablet ? 'column' : 'row', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: isTablet ? 'center' : 'left' }}>
            © {new Date().getFullYear()} Fundify. All rights reserved.
          </Typography>
          {!isTablet && (
            <Stack direction="row" spacing={2} sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              {quickLinks.slice(0, 2).map((link) => (
                <Link 
                  key={link.text} 
                  href={link.path} 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.5)', 
                    '&:hover': { color: 'white' },
                    textDecoration: 'none',
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          sx={{
            background: 'linear-gradient(90deg, #1a237e 0%, #283593 100%)',
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
          }}
        >
          <Toolbar>
            {isMobile ? (
              // Mobile view
              <>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Logo variant="h6">FUNDIFY</Logo>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="small"
                  sx={{ ml: 2 }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                    {localStorage.getItem("firstName")?.charAt(0) || "U"}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              // Desktop view
              <>
                <Logo variant="h5">FUNDIFY</Logo>
                <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
                  {navItems.map((item) => (
                    <Button
                      key={item.text}
                      color="inherit"
                      onClick={() => history.push(item.path)}
                      startIcon={item.icon}
                      sx={{ 
                        mx: 1,
                        fontWeight: activeTab === item.text.toLowerCase().split(' ')[0] ? 'bold' : 'normal',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          width: activeTab === item.text.toLowerCase().split(' ')[0] ? '100%' : '0',
                          height: '3px',
                          bottom: 0,
                          left: 0,
                          backgroundColor: 'white',
                          transition: 'width 0.3s ease',
                          borderRadius: '3px 3px 0 0',
                        },
                        '&:hover::after': {
                          width: '100%',
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                </Box>
                {!isTablet && (
                  <Search>
                    <SearchIconWrapper>
                      <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                      placeholder="Search..."
                      inputProps={{ 'aria-label': 'search' }}
                    />
                  </Search>
                )}
                <Button
                  onClick={handleProfileMenuOpen}
                  variant="text"
                  color="inherit"
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  startIcon={
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                      {localStorage.getItem("firstName")?.charAt(0) || "U"}
                    </Avatar>
                  }
                >
                  {localStorage.getItem("firstName")}
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        {drawerContent}
      </Drawer>

      {/* Profile menu */}
      {profileMenu}

      {/* Main content */}
      <Box sx={{ flexGrow: 1 }}>
        <Switch>
          <Route exact path="/audiencedashboard">
            <Redirect to="/audiencedashboard/creators" />
          </Route>
          <Route exact path="/audiencedashboard/creators">
            <Creators />
          </Route>
          <Route path="/audiencedashboard/projects">
            <Projects />
          </Route>
          <Route path="/audiencedashboard/exclusive">
            <Exclusive />
          </Route>
          <Route path="/project-details/:projectId">
            <ProjectDetails />
          </Route>
          <Route path="/campaign/:campaignId">
            <CampaignDetails />
          </Route>
          <Route path="/dashboard/:pageName">
            {({ match }) => {
              const { pageName } = match.params;
              return <Redirect to={`/viewcreator/${pageName}`} />;
            }}
          </Route>
        </Switch>
      </Box>
      
      {/* Footer */}
      {footer}
    </Box>
  );
}
