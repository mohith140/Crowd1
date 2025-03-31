import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Container,
  Divider,
  LinearProgress,
  Chip,
  Paper,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  Skeleton,
  FormGroup,
  FormControlLabel,
  Switch,
  CircularProgress,
  CardActionArea
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import SortIcon from "@mui/icons-material/Sort";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { SERVER_URL } from "../../../constant/serverUrl";
import { useHistory } from "react-router-dom";
import { formatImageUrl } from "../../../services/api";

// Helper function to calculate the percentage of funds raised
const calculateProgress = (raised, target) => {
  if (!target || target <= 0) return 0;
  const percentage = (raised / target) * 100;
  return Math.min(parseFloat(percentage.toFixed(2)), 100); // Cap at 100% and round to 2 decimal places
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "No deadline";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get timeAgo function
const getTimeAgo = (timestamp) => {
  if (!timestamp) return "";
  
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now - then) / 1000);
  
  if (seconds < 60) return "just now";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

// Get raised amount from audience
const getRaisedAmount = (audiences) => {
  if (!audiences || !Array.isArray(audiences)) return 0;
  
  return audiences.reduce((total, audience) => {
    return total + (parseInt(audience.amount) || 0);
  }, 0);
};

// Get backers count
const getBackersCount = (audiences) => {
  if (!audiences || !Array.isArray(audiences)) return 0;
  
  const uniqueBackers = new Set();
  audiences.forEach(audience => {
    if (audience.email) uniqueBackers.add(audience.email);
  });
  
  return uniqueBackers.size;
};

// Get time left
const getTimeLeft = (targetDate) => {
  if (!targetDate) return "No deadline";
  
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target - now;
  
  if (diffTime <= 0) return "No days left"; // Changed from "Ended" to "No days left"
  
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return "1 day left";
  if (diffDays < 30) return `${diffDays} days left`;
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "1 month left";
  return `${diffMonths} months left`;
};

function Projects() {
  const history = useHistory();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [pledgeDialogOpen, setPledgeDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [pledgeAmount, setPledgeAmount] = useState("");
  
  // Filter states
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortMethod, setSortMethod] = useState("newest");
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Get active campaigns from the API
      const response = await axios.get(`${SERVER_URL}/api/public/campaigns`);
      
      // Set projects and filtered projects
      setProjects(response.data.campaigns || []);
      setFilteredProjects(response.data.campaigns || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.campaigns.map(project => project.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showAlert("Error loading campaigns", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    applyFilters(term, selectedCategory, sortMethod);
  };

  const handleCategoryMenuOpen = (event) => {
    setCategoryAnchorEl(event.currentTarget);
  };

  const handleCategoryMenuClose = () => {
    setCategoryAnchorEl(null);
  };

  const handleSortMenuOpen = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortAnchorEl(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    handleCategoryMenuClose();
    
    applyFilters(searchTerm, category, sortMethod);
  };

  const handleSortSelect = (sortBy) => {
    setSortMethod(sortBy);
    handleSortMenuClose();
    
    applyFilters(searchTerm, selectedCategory, sortBy);
  };

  const applyFilters = (search, category, sort) => {
    let filtered = [...projects];
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(search) ||
        project.description.toLowerCase().includes(search) ||
        project.pageName.toLowerCase().includes(search)
      );
    }
    
    // Apply category filter
    if (category !== "All") {
      filtered = filtered.filter(project => 
        project.category && project.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply active only filter
    if (showActiveOnly) {
      filtered = filtered.filter(project => project.status === "active");
    }
    
    // Apply sorting
    switch (sort) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "mostFunded":
        filtered.sort((a, b) => getRaisedAmount(b.audience) - getRaisedAmount(a.audience));
        break;
      case "endingSoon":
        filtered.sort((a, b) => {
          if (!a.targetDate) return 1;
          if (!b.targetDate) return -1;
          return new Date(a.targetDate) - new Date(b.targetDate);
        });
        break;
      default:
        break;
    }
    
    setFilteredProjects(filtered);
  };

  const handleOpenPledgeDialog = (project) => {
    setCurrentProject(project);
    setPledgeDialogOpen(true);
  };

  const handlePledgeDialogClose = () => {
    setPledgeDialogOpen(false);
    setCurrentProject(null);
    setPledgeAmount("");
  };

  const handlePledgeSubmit = async () => {
    if (!currentProject) return;
    
    const amount = parseInt(pledgeAmount);
    if (!amount || amount < 50) {
      showAlert("Please pledge with a minimum amount of 50", "error");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showAlert("Please login to back this project", "error");
        return;
      }
      
      // Get the project details
      const projectId = currentProject.id;
      
      // Send the pledge to the server using the audience back-campaign endpoint
      const response = await axios.post(
        `${SERVER_URL}/api/audience/back-campaign`,
        {
          campaignId: projectId,
          amount: amount
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Close the dialog and show success message
      handlePledgeDialogClose();
      showAlert(`Thank you for pledging ₹${amount}!`, "success");
      
      // Refresh projects to update the data
      fetchProjects();
    } catch (error) {
      console.error("Error pledging:", error);
      showAlert(error.response?.data?.message || "Failed to process your pledge. Please try again.", "error");
    }
  };
  
  const handlePledgeAmountChange = (event) => {
    setPledgeAmount(event.target.value);
  };

  const handleViewDetails = (projectId) => {
    history.push(`/project-details/${projectId}`);
  };

  const showAlert = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const getCategoryChipColor = (category) => {
    const categoryColors = {
      "Education": { bg: "#e3f2fd", color: "#1565c0" },
      "Technology": { bg: "#e8f5e9", color: "#2e7d32" },
      "Donation": { bg: "#f3e5f5", color: "#7b1fa2" },
      "Healthcare": { bg: "#e8eaf6", color: "#3949ab" },
      "Environment": { bg: "#e0f2f1", color: "#00796b" },
      "Arts": { bg: "#fff3e0", color: "#e65100" },
      "Community": { bg: "#fce4ec", color: "#c2185b" },
      "Other": { bg: "#f5f5f5", color: "#616161" }
    };
    
    return categoryColors[category] || { bg: "#f5f5f5", color: "#616161" };
  };

  // Categories for the filter menu
  const categoryOptions = [
    "All",
    "Education",
    "Technology",
    "Donation",
    "Healthcare",
    "Environment",
    "Arts",
    "Community",
    "Other"
  ];

  // Sort options
  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "mostFunded", label: "Most Funded" },
    { value: "endingSoon", label: "Ending Soon" }
  ];

  const handleActiveToggle = (event) => {
    setShowActiveOnly(event.target.checked);
  };

  // Card renderer based on the selected view
  const renderProjectCards = () => {
    return filteredProjects.map((project) => {
      const progress = calculateProgress(project.raisedAmount, project.amount);
      const daysLeft = getTimeLeft(project.targetDate);
      const backerCount = project.backerCount || 0;
      
      return (
        <Grid item xs={12} sm={6} md={4} key={project.id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              },
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <CardMedia
              component="img"
              height="180"
              image={formatImageUrl(project.imageUrl) || "https://via.placeholder.com/300x180?text=Project"}
              alt={project.title}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleViewDetails(project.id)}
            />
            
            <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  size="small" 
                  label={project.category || 'Donation'} 
                  sx={{ mb: 1, bgcolor: 'rgba(0,0,0,0.05)' }} 
                />
                
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.3,
                    height: '2.6em',
                    mb: 1
                  }}
                >
                  {project.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {project.pageName}
                </Typography>
              </Box>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  height: '3em',
                  mb: 2
                }}
              >
                {project.description}
              </Typography>
              
              <Box sx={{ mt: 'auto' }}>
                <Box sx={{ mb: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(0,0,0,0.05)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: progress >= 100 ? 'success.main' : 'primary.main'
                      }
                    }} 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    ₹{project.raisedAmount || 0}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      of ₹{project.amount}
                    </Typography>
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={progress >= 100 ? 'success.main' : 'primary.main'}
                  >
                    {progress.toFixed(2)}% Funded
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    {backerCount} backers
                  </Typography>
                  
                  {project.targetDate && (
                    <Typography variant="body2" color="text.secondary">
                      <AccessTimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {daysLeft}
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleOpenPledgeDialog(project)}
                    disabled={false} // Always enabled to allow backing the project
                  >
                    BACK THIS PROJECT
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => handleViewDetails(project.id)}
                  >
                    DETAILS
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      );
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box 
        sx={{
          py: 5,
          textAlign: 'center',
          borderRadius: '16px',
          mb: 4,
          background: 'linear-gradient(45deg, #3b82f6 0%, #93c5fd 100%)',
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Discover Active Campaigns
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, maxWidth: '700px', mx: 'auto', opacity: 0.9 }}>
          Support innovative projects and contribute to your favorite creators
        </Typography>
      </Box>
      
      {/* Filters and Search */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}
      >
        {/* Search Box */}
        <TextField
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search campaigns"
          sx={{
            flexGrow: 1,
            minWidth: { xs: '100%', md: '200px' },
            maxWidth: { md: '400px' },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Category Filter */}
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleCategoryMenuOpen}
            color="primary"
            size="medium"
          >
            {selectedCategory}
          </Button>
          
          <Menu
            anchorEl={categoryAnchorEl}
            open={Boolean(categoryAnchorEl)}
            onClose={handleCategoryMenuClose}
          >
            {categoryOptions.map((category) => (
              <MenuItem
                key={category}
                onClick={() => handleCategorySelect(category)}
                selected={category === selectedCategory}
              >
                {category}
              </MenuItem>
            ))}
          </Menu>
          
          {/* Sort Options */}
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={handleSortMenuOpen}
            color="primary"
            size="medium"
          >
            Sort: {sortOptions.find(opt => opt.value === sortMethod)?.label}
          </Button>
          
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortMenuClose}
          >
            {sortOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                selected={option.value === sortMethod}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
          
          <FormGroup>
            <FormControlLabel
              control={
                <Switch 
                  checked={showActiveOnly} 
                  onChange={handleActiveToggle} 
                  color="primary" 
                />
              }
              label="Show active campaigns only"
            />
          </FormGroup>
        </Box>
      </Paper>

      {/* Project Cards */}
      {loading ? (
        // Loading skeletons
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card sx={{ height: '100%', borderRadius: '12px' }}>
                <Skeleton variant="rectangular" height={200} animation="wave" />
                <CardContent>
                  <Skeleton animation="wave" height={32} width="80%" sx={{ mb: 1 }} />
                  <Skeleton animation="wave" height={20} width="40%" sx={{ mb: 2 }} />
                  <Skeleton animation="wave" height={60} />
                  <Box sx={{ mt: 2 }}>
                    <Skeleton animation="wave" height={40} />
                    <Skeleton animation="wave" height={30} width="60%" sx={{ mt: 1 }} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Skeleton animation="wave" height={36} width={100} />
                  <Box sx={{ flexGrow: 1 }} />
                  <Skeleton animation="wave" height={36} width={80} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredProjects.length === 0 ? (
        // No projects found
        <Paper
          elevation={2}
          sx={{
            p: 5,
            textAlign: 'center',
            borderRadius: '16px',
            backgroundColor: '#f9fafb',
          }}
        >
          <Typography variant="h6" color="textSecondary">
            No campaigns found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Try adjusting your search or filters to find what you're looking for.
          </Typography>
        </Paper>
      ) : (
        // Project cards grid
        <Grid container spacing={3}>
          {renderProjectCards()}
        </Grid>
      )}

      {/* Pledge Dialog */}
      <Dialog open={pledgeDialogOpen} onClose={handlePledgeDialogClose} maxWidth="sm">
        <DialogTitle>
          Support this Campaign
        </DialogTitle>
        <DialogContent>
          {currentProject && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {currentProject.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  by {currentProject.pageName}
                </Typography>
              </Box>
              <DialogContentText sx={{ mb: 3 }}>
                Enter the amount you would like to pledge. The minimum pledge amount is ₹50.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Pledge Amount (₹)"
                type="number"
                fullWidth
                variant="outlined"
                value={pledgeAmount}
                onChange={handlePledgeAmountChange}
                InputProps={{ 
                  inputProps: { min: 50 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <MonetizationOnIcon />
                    </InputAdornment>
                  )
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Your support helps bring creative projects to life.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handlePledgeDialogClose}>Cancel</Button>
          <Button 
            onClick={handlePledgeSubmit} 
            variant="contained" 
            color="primary"
            disabled={!pledgeAmount || parseInt(pledgeAmount) < 50}
          >
            Confirm Pledge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Projects;
