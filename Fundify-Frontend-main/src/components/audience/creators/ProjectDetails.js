import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  LinearProgress, 
  Box, 
  Divider, 
  Grid, 
  Container,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from "@mui/material";
import { SERVER_URL } from "../../../constant/serverUrl";
import { formatImageUrl } from "../../../services/api";
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoneyIcon from '@mui/icons-material/Money';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ProjectDetails() {
  const { projectId, campaignId } = useParams();
  const history = useHistory();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);
  
  // Use whichever ID is available
  const id = campaignId || projectId;
  
  // Pledge dialog
  const [openPledgeDialog, setOpenPledgeDialog] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Get user type on component mount
  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    setUserType(storedUserType);
  }, []);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching project details for ID:", id);
        
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");
        
        if (!token) {
          history.push("/login");
          return;
        }
        
        let endpoint;
        if (userType === "creator") {
          endpoint = `${SERVER_URL}/api/campaigns/${id}`;
        } else {
          // Try the audience endpoint first
          endpoint = `${SERVER_URL}/api/audience/campaign/${id}`;
        }
        
        try {
          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log("Project response data:", response.data);
          setProject(userType === "creator" ? response.data : response.data.campaign);
        } catch (err) {
          // If audience endpoint fails, try the public endpoint as fallback
          if (userType !== "creator") {
            console.log("Trying public campaign endpoint as fallback");
            const publicResponse = await axios.get(`${SERVER_URL}/api/public/campaign/${id}`);
            setProject(publicResponse.data);
          } else {
            throw err;
          }
        }
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError(err.response?.data?.error || err.response?.data?.message || "Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProject();
    }
  }, [id, history]);

  const handlePledgeClick = () => {
    setOpenPledgeDialog(true);
  };

  const handleClosePledgeDialog = () => {
    setOpenPledgeDialog(false);
    setPledgeAmount("");
  };

  const handlePledgeAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setPledgeAmount(value);
    }
  };

  const handlePledgeSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Verify user is an audience member
      if (userType === "creator") {
        setError("Creators cannot pledge to campaigns");
        setIsSubmitting(false);
        return;
      }
      
      const amount = parseFloat(pledgeAmount);
      
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid contribution amount");
        setIsSubmitting(false);
        return;
      }
      
      // Here you'd make your API call to handle the pledge
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Authentication required. Please log in.");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Sending pledge request:", { id, amount });
      
      const response = await axios.post(
        `${SERVER_URL}/api/audience/back-campaign`,
        {
          campaignId: id,
          amount
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log("Pledge response:", response.data);
      
      // Update project with new data
      setProject(prev => ({
        ...prev,
        raisedAmount: response.data.campaign.raisedAmount,
        fundingPercentage: response.data.campaign.fundingPercentage,
        hasBacked: true
      }));
      
      setSuccessMessage(`Thank you for your pledge of ₹${amount}!`);
      handleClosePledgeDialog();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
    } catch (err) {
      console.error("Error pledging to project:", err);
      setError(err.response?.data?.message || "Failed to process your pledge");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '80vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    const dashboardUrl = userType === "creator" ? "/creatordashboard/projects" : "/audiencedashboard";
    
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => history.push(dashboardUrl)}
        >
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  if (!project) {
    const dashboardUrl = userType === "creator" ? "/creatordashboard/projects" : "/audiencedashboard";
    
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Project not found</Alert>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }}
          onClick={() => history.push(dashboardUrl)}
        >
          Return to Dashboard
        </Button>
      </Container>
    );
  }

  const totalAmount = project.amount;
  const raisedAmount = project.raisedAmount || 0;
  const progress = (raisedAmount / totalAmount) * 100;

  // Calculate days left
  const calculateDaysLeft = (targetDate) => {
    if (!targetDate) return null;
    const remaining = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    return remaining > 0 ? remaining : 0;
  };

  const daysLeft = calculateDaysLeft(project.targetDate);

  // Sort contributors by timestamp (latest first)
  const sortedAudience = project.audience ? 
    [...project.audience].sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)) 
    : [];

  // Make sure backerCount is properly displayed
  const backerCount = project.backerCount || (project.audience ? project.audience.length : 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSuccessMessage(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {successMessage}
        </Alert>
      )}
      
      {/* Back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => history.push(userType === "creator" ? "/creatordashboard/projects" : "/audiencedashboard")}
          variant="text"
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
      
      {/* Project Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        {project.title}
      </Typography>
      
      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left column - Project image and description */}
        <Grid item xs={12} md={7}>
          <Card 
            sx={{ 
              mb: 3, 
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <CardMedia
              component="img"
              height={300}
              image={formatImageUrl(project.imageUrl)}
              alt={project.title}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
          
          {/* Project Description */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
            <Typography variant="h6" gutterBottom>
              About This Project
            </Typography>
            <Typography variant="body1" paragraph>
              {project.description}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Right column - Project stats and support options */}
        <Grid item xs={12} md={5}>
          {/* Creator Info */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 56, 
                height: 56 
              }}
            >
              <PersonIcon sx={{ fontSize: 28 }} />
            </Avatar>
            
            <Box>
              <Typography variant="h6" gutterBottom>
                {project.creator?.name || project.pageName || "Project Creator"}
              </Typography>
            </Box>
          </Paper>
          
          {/* Project Stats */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  ₹ {raisedAmount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of ₹ {totalAmount} goal
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="h4" fontWeight="bold">
                  {backerCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  backers
                </Typography>
              </Grid>
            </Grid>
            
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                mb: 2,
                '& .MuiLinearProgress-bar': {
                  bgcolor: progress >= 100 ? 'success.main' : 'primary.main'
                }
              }} 
            />
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mb: 2 
              }}
            >
              <Typography 
                variant="body2" 
                fontWeight="bold"
                color={progress >= 100 ? 'success.main' : 'primary.main'}
              >
                {progress.toFixed(2)}% funded
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                <AccessTimeIcon 
                  fontSize="small" 
                  sx={{ 
                    verticalAlign: 'middle', 
                    mr: 0.5 
                  }} 
                />
                {daysLeft === 0 ? 'No days left' : `${daysLeft} days left`}
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="subtitle1">
                    {new Date(project.targetDate).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Support Box - Only show for audience members */}
          {userType !== "creator" && (
            <Paper sx={{ p: 3, borderRadius: '12px' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                onClick={handlePledgeClick}
                disabled={daysLeft === 0}
                sx={{ py: 1.5, mb: 2 }}
              >
                Pledge to this Project
              </Button>
              
              {daysLeft === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  This project has ended
                </Typography>
              )}
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<ShareIcon />}
                fullWidth
              >
                Share Project
              </Button>
            </Paper>
          )}

          {/* For creators, only show the share button */}
          {userType === "creator" && (
            <Paper sx={{ p: 3, borderRadius: '12px' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ShareIcon />}
                fullWidth
              >
                Share Project
              </Button>
            </Paper>
          )}
          
          {/* Contributors Section */}
          {sortedAudience.length > 0 && (
            <Paper sx={{ p: 3, mt: 3, borderRadius: '12px' }}>
              <Typography variant="h6" gutterBottom>
                Recent Contributors
              </Typography>
              
              <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                {sortedAudience.map((contributor, index) => {
                  const dateTime = new Date(contributor.date || contributor.timestamp).toLocaleString();
                  return (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem 0",
                        borderBottom: index < sortedAudience.length - 1 ? "1px solid #eee" : "none",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body1">
                          {contributor.firstName || contributor.name || "Anonymous"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dateTime}
                        </Typography>
                      </Box>
                      <Typography variant="body1" color="primary" fontWeight="bold">
                        ₹ {contributor.amount}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Pledge Dialog */}
      <Dialog 
        open={openPledgeDialog} 
        onClose={handleClosePledgeDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Pledge to this Project</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Enter amount you would like to pledge to support this project.
            </Typography>
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            label="Pledge Amount (₹)"
            type="text"
            fullWidth
            variant="outlined"
            value={pledgeAmount}
            onChange={handlePledgeAmountChange}
            InputProps={{
              startAdornment: <MoneyIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
            helperText="Enter the amount you want to pledge"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePledgeDialog}>Cancel</Button>
          <Button 
            onClick={handlePledgeSubmit} 
            color="primary"
            variant="contained"
            disabled={!pledgeAmount || isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Pledge'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProjectDetails;
