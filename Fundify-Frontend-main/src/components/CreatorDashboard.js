import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
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
import { Switch, Route, useHistory, Redirect } from "react-router-dom";
import ViewProjects from "./creator/projects/ViewProjects";
import NewProject from "./creator/projects/NewProject";
import ProjectsView from "./creator/projects/ProjectsView";
import CreateCampaign from "./creator/campaigns/CreateCampaign";
import axios from "axios";
import { SERVER_URL } from "../constant/serverUrl";
import Funds from "../components/creator/Funds/Funds";
import Exclusive from "./creator/Exclusive/Exclusive";
import AddCircleIcon from "@mui/icons-material/AddCircle";

// Logo component for navbar
const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '1px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem',
  },
}));

const user = JSON.parse(localStorage.getItem("user"));

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

export default function CreatorDashboard() {
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [fetchedProjects, setFetchedProjects] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [email, setEmail] = React.useState("");
  const [subscribeSuccess, setSubscribeSuccess] = React.useState(false);
  const profileMenuOpen = Boolean(anchorEl);
  
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
    localStorage.removeItem("email");
    localStorage.removeItem("pageName");
    history.replace("/login");
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubscribe = (event) => {
    event.preventDefault();
    // Here you would normally send this to your backend
    console.log(`Subscribing email: ${email}`);
    setSubscribeSuccess(true);
    setEmail("");
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSubscribeSuccess(false);
    }, 3000);
  };

  React.useEffect(() => {
    // Determine active tab based on current path
    const path = history.location.pathname;
    if (path.includes("projects")) {
      setActiveTab("projects");
    } else if (path.includes("funds")) {
      setActiveTab("funds");
    } else if (path.includes("exclusive")) {
      setActiveTab("exclusive");
    } else if (path.includes("campaigns")) {
      setActiveTab("campaigns");
    }
    
    // Fetch projects data
    axios
      .get(SERVER_URL + "/projects", {
        params: {
          email: localStorage.getItem("email"),
          pageName: localStorage.getItem("pageName"),
        },
      })
      .then((response) => {
        console.log(response.data);
        setFetchedProjects(response.data);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
      });
  }, [history.location.pathname]);

  const handleViewProjects = (projectName, email) => {
    axios
      .get(SERVER_URL + "/projects", {
        params: { 
          email: email,
          pageName: localStorage.getItem("pageName"),
        },
      })
      .then((response) => {
        console.log(response.data);
        setFetchedProjects(response.data);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
      });
  };

  // Navigation items
  const navItems = [
    { text: 'Projects', path: '/creatordashboard/projects', icon: <DashboardIcon /> },
    { text: 'Create Campaign', path: '/creatordashboard/campaigns/create', icon: <AddCircleIcon /> },
    { text: 'Funds / Supporters', path: '/creatordashboard/funds', icon: <AttachMoneyIcon /> },
    { text: 'Exclusive Content', path: '/creatordashboard/exclusive', icon: <LockIcon /> },
  ];

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
        {user.firstName || "Creator"}
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
              <TextField
                fullWidth
                value={email}
                onChange={handleEmailChange}
                placeholder="Your email"
                variant="outlined"
                size="small"
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        edge="end" 
                        type="submit"
                        sx={{ color: 'white' }}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
                    {user.firstName?.charAt(0) || "C"}
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
                      {user.firstName?.charAt(0) || "C"}
                    </Avatar>
                  }
                >
                  {user.firstName}
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
          <Route exact path="/creatordashboard">
            <Redirect to="/creatordashboard/projects" />
          </Route>
          
          <Route exact path="/creatordashboard/projects">
            <ProjectsView data={fetchedProjects} />
          </Route>
          
          <Route exact path="/creatordashboard/projects/legacy">
            <Grid
              container
              style={{ paddingInline: "2rem", paddingBlock: "1.5rem" }}
            >
              <Grid item xs={6}>
                <ViewProjects data={fetchedProjects} />
              </Grid>
              <Grid item xs={4}>
                <NewProject handleViewProjects={handleViewProjects} />
              </Grid>
            </Grid>
          </Route>
          
          <Route exact path="/creatordashboard/campaigns/create">
            <CreateCampaign />
          </Route>
          
          <Route path="/creatordashboard/funds">
            <Funds />
          </Route>
          
          <Route path="/creatordashboard/exclusive">
            <Exclusive />
          </Route>
        </Switch>
      </Box>
      
      {/* Footer */}
      {footer}
    </Box>
  );
}
