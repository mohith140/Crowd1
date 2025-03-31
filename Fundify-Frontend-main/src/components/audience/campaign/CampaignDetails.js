import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  IconButton,
  useMediaQuery
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import axios from "axios";
import { SERVER_URL } from "../../../constant/serverUrl";
import { formatImageUrl } from "../../../services/api";

// Icons
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import MoneyIcon from '@mui/icons-material/Money';
import FlagIcon from '@mui/icons-material/Flag';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import UpdateIcon from '@mui/icons-material/Update';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import InfoIcon from '@mui/icons-material/Info';
import ShareIcon from '@mui/icons-material/Share';

function CampaignDetails() {
  const { campaignId } = useParams();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Support dialog
  const [openSupportDialog, setOpenSupportDialog] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Video dialog
  const [openVideoDialog, setOpenVideoDialog] = useState(false);
  
  // Format dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate days left
  const calculateDaysLeft = (targetDate) => {
    if (!targetDate) return null;
    const remaining = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    return remaining > 0 ? remaining : 0;
  };
  
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");
        
        if (!token) {
          history.push("/login");
          return;
        }
        
        let response;
        
        // Choose endpoint based on user type
        if (userType === "creator") {
          // If user is a creator, use the creator endpoint
          response = await axios.get(
            `${SERVER_URL}/api/campaigns/${campaignId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setCampaign(response.data);
        } else {
          // If user is audience, use the audience endpoint
          response = await axios.get(
            `${SERVER_URL}/api/audience/campaign/${campaignId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setCampaign(response.data.campaign);
        }
      } catch (err) {
        console.error("Error fetching campaign details:", err);
        setError(err.response?.data?.message || err.response?.data?.error || "Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaignDetails();
  }, [campaignId, history]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenSupportDialog = () => {
    setOpenSupportDialog(true);
  };
  
  const handleCloseSupportDialog = () => {
    setOpenSupportDialog(false);
    setContributionAmount("");
  };
  
  const handleContributionChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setContributionAmount(value);
    }
  };
  
  const handleSupportCampaign = async () => {
    try {
      setIsSubmitting(true);
      
      const amount = parseFloat(contributionAmount);
      
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid amount");
        setIsSubmitting(false);
        return;
      }
      
      const token = localStorage.getItem("token");
      
      // Simple API call to update campaign funds without payment integration
      const response = await axios.post(
        `${SERVER_URL}/api/audience/back-campaign`,
        {
          campaignId,
          amount
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update campaign with new data
      setCampaign(prev => ({
        ...prev,
        raisedAmount: response.data.campaign.raisedAmount,
        fundingPercentage: response.data.campaign.fundingPercentage,
        hasBacked: true,
        contribution: (prev.contribution || 0) + amount,
        backerCount: prev.backerCount + (prev.hasBacked ? 0 : 1)
      }));
      
      setSuccessMessage(`Thank you for pledging $${amount}!`);
      handleCloseSupportDialog();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
    } catch (err) {
      console.error("Error pledging to campaign:", err);
      const errorMessage = err.response?.data?.message || "Failed to process your pledge";
      setError(errorMessage);
      // Close dialog if there was an error
      handleCloseSupportDialog();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOpenVideoDialog = () => {
    setOpenVideoDialog(true);
  };
  
  const handleCloseVideoDialog = () => {
    setOpenVideoDialog(false);
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
    const userType = localStorage.getItem("userType");
    const dashboardUrl = userType === "creator" ? '/creatordashboard/projects' : '/dashboard';
    
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
  
  if (!campaign) {
    const userType = localStorage.getItem("userType");
    const dashboardUrl = userType === "creator" ? '/creatordashboard/projects' : '/dashboard';
    
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Campaign not found</Alert>
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
  
  const daysLeft = calculateDaysLeft(campaign.targetDate);
  
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
      
      <Grid container spacing={4}>
        {/* Left column - Campaign image/video and creator info */}
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
              height={isMobile ? 200 : 400}
              image={formatImageUrl(campaign.imageUrl) || 'https://via.placeholder.com/800x400?text=Campaign+Image'}
              alt={campaign.title}
              sx={{ objectFit: 'cover' }}
            />
            
            {campaign.videoUrl && (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.9)',
                  }
                }}
                onClick={handleOpenVideoDialog}
              >
                Play Video
              </Button>
            )}
          </Card>
          
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
                width: 64, 
                height: 64 
              }}
            >
              <PersonIcon sx={{ fontSize: 32 }} />
            </Avatar>
            
            <Box>
              <Typography variant="h6" gutterBottom>
                {campaign.pageName}
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => history.push(`/creator/${campaign.pageName}`)}
              >
                View Creator
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right column - Campaign details and support options */}
        <Grid item xs={12} md={5}>
          <Typography variant="h4" component="h1" gutterBottom>
            {campaign.title}
          </Typography>
          
          <Typography 
            variant="body1" 
            paragraph
            sx={{ mb: 3 }}
          >
            {campaign.description}
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  ${campaign.raisedAmount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of ${campaign.amount} goal
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="h4" fontWeight="bold">
                  {campaign.backerCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  backers
                </Typography>
              </Grid>
            </Grid>
            
            <LinearProgress 
              variant="determinate" 
              value={campaign.fundingPercentage} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                mb: 2,
                '& .MuiLinearProgress-bar': {
                  bgcolor: campaign.fundingPercentage >= 100 ? 'success.main' : 'primary.main'
                }
              }} 
            />
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mb: 3 
              }}
            >
              <Typography 
                variant="body2" 
                fontWeight="bold"
                color={campaign.fundingPercentage >= 100 ? 'success.main' : 'primary.main'}
              >
                {parseFloat(campaign.fundingPercentage).toFixed(2)}% funded
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
            
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Chip 
                    label={campaign.category}
                    icon={<CategoryIcon />}
                    sx={{ width: '100%' }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <Chip 
                    label={`Launched: ${formatDate(campaign.launchDate)}`}
                    icon={<FlagIcon />}
                    variant="outlined"
                    sx={{ width: '100%' }}
                  />
                </Grid>
              </Grid>
            </Box>
            
            {campaign.hasBacked && (
              <Alert 
                severity="success" 
                sx={{ mb: 3 }}
              >
                You've supported this campaign with ${campaign.contribution}
              </Alert>
            )}
            
            <Box sx={{ mb: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                onClick={handleOpenSupportDialog}
                disabled={campaign.status !== 'active' || daysLeft === 0}
                sx={{ py: 1.5 }}
              >
                Pledge
              </Button>
              
              {(campaign.status !== 'active' || daysLeft === 0) && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  {campaign.status !== 'active' 
                    ? 'This campaign is no longer accepting pledges' 
                    : 'This campaign has ended'}
                </Typography>
              )}
            </Box>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShareIcon />}
              fullWidth
              sx={{ mt: 1 }}
            >
              Share Campaign
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* Tabs section for Updates, Rewards, and Details */}
      <Box sx={{ width: '100%', mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="campaign tabs"
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : undefined}
          >
            <Tab icon={<InfoIcon />} iconPosition="start" label="Details" />
            <Tab icon={<UpdateIcon />} iconPosition="start" label="Updates" />
            <Tab icon={<CardGiftcardIcon />} iconPosition="start" label="Rewards" />
          </Tabs>
        </Box>
        
        {/* Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            About This Campaign
          </Typography>
          
          <Typography variant="body1" paragraph>
            {campaign.description}
          </Typography>
          
          {campaign.tags && campaign.tags.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {campaign.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Campaign Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Target Goal
                  </Typography>
                  <Typography variant="h6">
                    ${campaign.amount}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="h6">
                    {formatDate(campaign.targetDate)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Updates Tab */}
        <TabPanel value={tabValue} index={1}>
          {campaign.updates && campaign.updates.length > 0 ? (
            <List sx={{ width: '100%' }}>
              {campaign.updates.map((update, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'secondary.main' 
                        }}
                      >
                        <UpdateIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" component="div">
                          {update.title}
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            — {formatDate(update.date)}
                          </Typography>
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ mt: 1 }}
                        >
                          {update.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < campaign.updates.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 4
              }}
            >
              <UpdateIcon 
                sx={{ 
                  fontSize: 60, 
                  color: 'text.secondary', 
                  opacity: 0.5 
                }} 
              />
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ mt: 2 }}
              >
                No updates yet
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 1 }}
              >
                Check back later for updates from the creator
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        {/* Rewards Tab */}
        <TabPanel value={tabValue} index={2}>
          {campaign.rewards && campaign.rewards.length > 0 ? (
            <Grid container spacing={3}>
              {campaign.rewards.map((reward, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '12px'
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        color="primary"
                      >
                        ${reward.amount} or more
                      </Typography>
                      
                      <Typography variant="subtitle1" gutterBottom>
                        {reward.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {reward.description}
                      </Typography>
                      
                      {reward.estimatedDelivery && (
                        <Typography 
                          variant="caption" 
                          display="block"
                          sx={{ mt: 'auto' }}
                        >
                          Estimated delivery: {formatDate(reward.estimatedDelivery)}
                        </Typography>
                      )}
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => {
                          setContributionAmount(reward.amount.toString());
                          handleOpenSupportDialog();
                        }}
                        disabled={campaign.status !== 'active' || daysLeft === 0}
                      >
                        Pledge ${reward.amount}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 4
              }}
            >
              <CardGiftcardIcon 
                sx={{ 
                  fontSize: 60, 
                  color: 'text.secondary', 
                  opacity: 0.5 
                }} 
              />
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ mt: 2 }}
              >
                No reward tiers available
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 1 }}
              >
                This campaign doesn't have specific reward tiers
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Box>
      
      {/* Support Dialog */}
      <Dialog 
        open={openSupportDialog} 
        onClose={handleCloseSupportDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Support this Campaign</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {campaign.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              by {campaign.pageName}
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the amount you would like to pledge. The minimum pledge amount is $50.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            label="Pledge Amount ($)"
            type="text"
            fullWidth
            variant="outlined"
            value={contributionAmount}
            onChange={handleContributionChange}
            InputProps={{
              startAdornment: <MoneyIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
            sx={{ mt: 1 }}
            helperText="Your support helps bring creative projects to life."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSupportDialog}>Cancel</Button>
          <Button 
            onClick={handleSupportCampaign} 
            color="primary"
            variant="contained"
            disabled={!contributionAmount || isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Confirm Pledge'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Video Dialog */}
      {campaign.videoUrl && (
        <Dialog
          open={openVideoDialog}
          onClose={handleCloseVideoDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogContent sx={{ p: 0 }}>
            <IconButton
              aria-label="close"
              onClick={handleCloseVideoDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'common.white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                },
                zIndex: 1
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box
              component="iframe"
              src={campaign.videoUrl}
              title={campaign.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sx={{
                width: '100%',
                height: isMobile ? '300px' : '500px',
                display: 'block',
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default CampaignDetails;