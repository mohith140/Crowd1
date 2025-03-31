import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Divider,
  Container,
  Paper,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LaunchIcon from "@mui/icons-material/Launch";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { SERVER_URL } from "../../../constant/serverUrl";
import { formatImageUrl } from "../../../services/api";

// Helper function to calculate the percentage of funds raised
const calculateProgress = (raised, target) => {
  const percentage = (raised / target) * 100;
  return Math.min(parseFloat(percentage.toFixed(2)), 100); // Cap at 100% and round to 2 decimal places
};

// Helper function to get the total raised amount
const getRaisedAmount = (audiences) => {
  let raisedAmount = 0;
  if (audiences && audiences.length > 0) {
    audiences.forEach((element) => {
      raisedAmount += parseInt(element.amount || 0);
    });
  }
  return raisedAmount;
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

// Status chip component
const StatusChip = ({ status }) => {
  let color = 'default';
  let label = 'Unknown';
  let bgColor = '#e0e0e0';
  let textColor = '#616161';
  
  switch (status) {
    case 'active':
      color = 'success';
      label = 'Active';
      bgColor = '#e8f5e9';
      textColor = '#2e7d32';
      break;
    case 'draft':
      color = 'warning';
      label = 'Draft';
      bgColor = '#fff8e1';
      textColor = '#ff8f00';
      break;
    case 'completed':
      color = 'info';
      label = 'Completed';
      bgColor = '#e1f5fe';
      textColor = '#0277bd';
      break;
    case 'paused':
      color = 'error';
      label = 'Paused';
      bgColor = '#ffebee';
      textColor = '#c62828';
      break;
    default:
      break;
  }
  
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 'bold',
        backgroundColor: bgColor,
        color: textColor
      }}
    />
  );
};

function ProjectsView({ data }) {
  const history = useHistory();
  const [projects, setProjects] = useState([]);
  const [launchDialogOpen, setLaunchDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  
  useEffect(() => {
    if (data && data.length > 0) {
      // Sort projects by newest first
      setProjects([...data].reverse());
    } else {
      // Fetch projects if not provided as props
      fetchProjects();
    }
  }, [data]);
  
  const fetchProjects = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${SERVER_URL}/api/campaigns`, 
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      setProjects([...response.data].reverse()); // newest first
    } catch (error) {
      console.error("Error fetching projects:", error);
      showAlert("Error loading campaigns", "error");
    }
  };
  
  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) {
      return;
    }
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      
      await axios.delete(
        `${SERVER_URL}/api/campaigns/${projectId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      setProjects(projects.filter(project => project._id !== projectId));
      showAlert("Campaign deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting campaign:", error);
      const errorMessage = error.response?.data?.error || "Error deleting campaign";
      showAlert(errorMessage, "error");
    }
  };
  
  const handleLaunchClick = (project) => {
    setCurrentProject(project);
    setLaunchDialogOpen(true);
  };
  
  const handleLaunchConfirm = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      
      await axios.post(
        `${SERVER_URL}/api/campaigns/${currentProject._id}/launch`, 
        {},
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      // Update project status in local state
      setProjects(projects.map(p => {
        if (p._id === currentProject._id) {
          return { ...p, status: "active", launchDate: new Date() };
        }
        return p;
      }));
      
      setLaunchDialogOpen(false);
      showAlert("Campaign launched successfully! It's now visible to the public.", "success");
    } catch (error) {
      console.error("Error launching campaign:", error);
      const errorMessage = error.response?.data?.error || "Error launching campaign";
      showAlert(errorMessage, "error");
    }
  };
  
  const handleLaunchCancel = () => {
    setLaunchDialogOpen(false);
    setCurrentProject(null);
  };
  
  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  const handleAlertClose = () => {
    setAlertOpen(false);
  };
  
  const handleViewCampaign = (projectId) => {
    // Make sure userType is set in local storage
    if (!localStorage.getItem("userType")) {
      localStorage.setItem("userType", "creator");
    }
    
    // Navigate to campaign details in the current window
    history.push(`/campaign/${projectId}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Your Campaigns
          </Typography>
        </Box>
        
        {projects.length === 0 ? (
          <Paper
            elevation={2}
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: '16px',
              backgroundColor: '#f5f5f5',
            }}
          >
            <Typography variant="h6" color="textSecondary">
              You haven't created any campaigns yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 3 }}>
              Use the "Create Campaign" option in the navigation menu to get started.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => {
              const raisedAmount = getRaisedAmount(project.audience);
              const targetAmount = parseInt(project.amount);
              const progressPercentage = calculateProgress(raisedAmount, targetAmount);
              const status = project.status || "draft";
              
              return (
                <Grid item xs={12} sm={6} md={4} key={project._id}>
                  <Card 
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '12px',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
                      },
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={formatImageUrl(project.imageUrl) || "https://source.unsplash.com/random?fundraising"}
                        alt={project.title}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10, 
                          display: 'flex', 
                          gap: 1 
                        }}
                      >
                        <StatusChip status={status} />
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          label={project.category || "General"}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2'
                          }}
                        />
                        
                        {project.target_date && (
                          <Chip
                            label={`Ends: ${formatDate(project.target_date)}`}
                            size="small"
                            sx={{
                              ml: 1,
                              backgroundColor: '#fff3e0',
                              color: '#e65100'
                            }}
                          />
                        )}
                      </Box>
                      
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {project.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2, 
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 3,
                        }}
                      >
                        {project.description}
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Raised: 
                            <Typography 
                              component="span" 
                              sx={{ fontWeight: 'bold', color: 'success.main', ml: 1 }}
                            >
                              ₹{raisedAmount.toLocaleString()}
                            </Typography>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Goal: 
                            <Typography 
                              component="span" 
                              sx={{ fontWeight: 'bold', ml: 1 }}
                            >
                              ₹{targetAmount.toLocaleString()}
                            </Typography>
                          </Typography>
                        </Box>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={progressPercentage} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: progressPercentage >= 100 ? '#4caf50' : '#1976d2',
                            }
                          }}
                        />
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mt: 0.5, 
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: progressPercentage >= 100 ? 'success.main' : 'primary.main'
                          }}
                        >
                          {Math.round(progressPercentage)}% Funded
                        </Typography>
                      </Box>
                    </CardContent>
                    
                    <Divider />
                    
                    <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                      {status === 'draft' ? (
                        <Button 
                          size="small" 
                          variant="contained"
                          color="warning"
                          startIcon={<LaunchIcon />}
                          onClick={() => handleLaunchClick(project)}
                        >
                          Launch
                        </Button>
                      ) : (
                        <Button 
                          size="small" 
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewCampaign(project._id)}
                        >
                          View
                        </Button>
                      )}
                      
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            sx={{ ml: 1 }}
                            onClick={() => {/* Edit functionality would go here */}}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error" 
                            sx={{ ml: 1 }}
                            onClick={() => handleDelete(project._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
      
      {/* Launch Confirmation Dialog */}
      <Dialog
        open={launchDialogOpen}
        onClose={handleLaunchCancel}
        aria-labelledby="launch-dialog-title"
        aria-describedby="launch-dialog-description"
      >
        <DialogTitle id="launch-dialog-title">
          {"Launch Campaign"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="launch-dialog-description">
            Are you sure you want to launch this campaign? Once launched, it will be visible to the public and can receive funds.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLaunchCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLaunchConfirm} color="warning" variant="contained" startIcon={<LaunchIcon />} autoFocus>
            Launch Now
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert Snackbar */}
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={5000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alertSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProjectsView; 