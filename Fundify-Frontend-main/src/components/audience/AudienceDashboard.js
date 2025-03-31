import React, { useState, useEffect } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Paper,
  Chip,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import axios from "axios";
import { SERVER_URL } from "../../constant/serverUrl";
import { useHistory } from "react-router-dom";
import { formatImageUrl } from "../../services/api";
import CreatorsTab from "./creators/CreatorsTab";

// Icons
import CampaignIcon from '@mui/icons-material/Campaign';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';

function AudienceDashboard() {
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [backedCampaigns, setBackedCampaigns] = useState([]);
  const [followedCampaigns, setFollowedCampaigns] = useState([]);
  const [exclusiveContent, setExclusiveContent] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [fundingHistory, setFundingHistory] = useState([]);
  const [monthlySupporters, setMonthlySupporters] = useState([]);
  
  // Support dialog state
  const [openSupportDialog, setOpenSupportDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [contributionAmount, setContributionAmount] = useState("50");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pledgeError, setPledgeError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch audience information
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");
        
        if (!token || !email) {
          // Not logged in, redirect to login
          history.push("/login");
          return;
        }
        
        // Get campaigns data
        const campaignsResponse = await axios.get(
          `${SERVER_URL}/api/audience/campaigns`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Process campaign data to ensure percentage is calculated correctly
        const backedCampaignsData = campaignsResponse.data.backedCampaigns || [];
        const followedCampaignsData = campaignsResponse.data.followedCampaigns || [];
        
        // Set the processed campaign data
        setBackedCampaigns(backedCampaignsData);
        setFollowedCampaigns(followedCampaignsData);
        
        // Get exclusive content
        const contentResponse = await axios.get(
          `${SERVER_URL}/api/audience/content`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setExclusiveContent(contentResponse.data.content || []);
        
        // Get user info
        const userResponse = await axios.post(
          `${SERVER_URL}/audience/info`,
          { email }
        );
        
        setUserInfo(userResponse.data || {});
        
        // Get funding history
        const fundingHistoryResponse = await axios.get(
          `${SERVER_URL}/api/audience/funding-history`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setFundingHistory(fundingHistoryResponse.data.fundingHistory || []);
        
        // Get monthly supporters
        const supportersResponse = await axios.get(
          `${SERVER_URL}/api/audience/monthly-supporters`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setMonthlySupporters(supportersResponse.data.monthlySupporters || []);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [history]);
  
  // Function to refresh campaign data without the full loading state
  const fetchCampaignData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        history.push("/login");
        return;
      }
      
      // Get campaigns data
      const campaignsResponse = await axios.get(
        `${SERVER_URL}/api/audience/campaigns`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Process campaign data to ensure percentage is calculated correctly
      const backedCampaignsData = campaignsResponse.data.backedCampaigns || [];
      const followedCampaignsData = campaignsResponse.data.followedCampaigns || [];
      
      // Set the processed campaign data
      setBackedCampaigns(backedCampaignsData);
      setFollowedCampaigns(followedCampaignsData);
      
    } catch (error) {
      console.error("Error refreshing campaign data:", error);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleViewCampaign = (campaignId) => {
    if (!campaignId) {
      console.error("Invalid campaign ID:", campaignId);
      return;
    }
    
    // Make sure userType is set in local storage
    if (!localStorage.getItem("userType")) {
      localStorage.setItem("userType", "audience");
    }
    
    console.log("Navigating to campaign with ID:", campaignId);
    history.push(`/campaign/${campaignId}`);
  };
  
  const handleViewExclusiveContent = (contentId) => {
    history.push(`/exclusive-content/${contentId}`);
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const calculateDaysLeft = (targetDate) => {
    if (!targetDate) return null;
    const remaining = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    return remaining > 0 ? remaining : 0;
  };
  
  // Handle opening the support dialog
  const handleOpenSupportDialog = (campaign) => {
    setSelectedCampaign(campaign);
    setOpenSupportDialog(true);
    setContributionAmount("50");
    setPledgeError(null);
  };
  
  // Handle closing the support dialog
  const handleCloseSupportDialog = () => {
    setOpenSupportDialog(false);
    setSelectedCampaign(null);
    setContributionAmount("50");
    setPledgeError(null);
  };
  
  // Handle contribution amount change
  const handleContributionChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setContributionAmount(value);
    }
  };
  
  // Handle pledge submission
  const handleSupportCampaign = async () => {
    try {
      setIsSubmitting(true);
      setPledgeError(null);
      
      const amount = parseFloat(contributionAmount);
      
      if (isNaN(amount) || amount <= 0) {
        setPledgeError("Please enter a valid amount");
        setIsSubmitting(false);
        return;
      }
      
      if (amount < 50) {
        setPledgeError("Minimum pledge amount is $50");
        setIsSubmitting(false);
        return;
      }
      
      const token = localStorage.getItem("token");
      
      // Call the API to back the campaign
      const response = await axios.post(
        `${SERVER_URL}/api/audience/back-campaign`,
        {
          campaignId: selectedCampaign.id,
          amount
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Calculate proper funding percentage
      const newRaisedAmount = response.data.campaign.raisedAmount;
      const fundingPercentage = selectedCampaign.amount > 0 
        ? Math.min(Math.round((newRaisedAmount / selectedCampaign.amount) * 100), 100)
        : 0;
      
      // Update campaign with new data
      const updatedBackedCampaigns = [...backedCampaigns];
      const existingIndex = updatedBackedCampaigns.findIndex(c => c.id === selectedCampaign.id);
      
      if (existingIndex >= 0) {
        // Update existing backed campaign
        updatedBackedCampaigns[existingIndex] = {
          ...updatedBackedCampaigns[existingIndex],
          raisedAmount: newRaisedAmount,
          fundingPercentage: fundingPercentage,
          contribution: (updatedBackedCampaigns[existingIndex].contribution || 0) + amount,
          backerCount: (updatedBackedCampaigns[existingIndex].backerCount || 0) + 1
        };
      } else {
        // Add newly backed campaign to the list
        const newlyBackedCampaign = {
          ...selectedCampaign,
          raisedAmount: newRaisedAmount,
          fundingPercentage: fundingPercentage,
          contribution: amount,
          hasBacked: true,
          backerCount: (selectedCampaign.backerCount || 0) + 1
        };
        
        updatedBackedCampaigns.push(newlyBackedCampaign);
        
        // Remove from followed campaigns if it exists there
        const updatedFollowedCampaigns = followedCampaigns.filter(c => c.id !== selectedCampaign.id);
        setFollowedCampaigns(updatedFollowedCampaigns);
      }
      
      setBackedCampaigns(updatedBackedCampaigns);
      setSuccessMessage(`Thank you for pledging $${amount} to ${selectedCampaign.title}!`);
      handleCloseSupportDialog();
      
      // Refresh campaign data
      fetchCampaignData();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
    } catch (err) {
      console.error("Error pledging to campaign:", err);
      setPledgeError(err.response?.data?.message || "Failed to process your pledge");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Dashboard header section with summary metrics
  const DashboardHeader = () => (
    <Box
      sx={{
        background: 'linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)',
        color: 'white',
        borderRadius: '16px',
        p: 3,
        mb: 4
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {userInfo.firstName || 'Supporter'}!
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
        Your dashboard for tracking campaigns, exclusive content, and creators you support.
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{ 
              p: 2, 
              textAlign: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              {backedCampaigns.length}
            </Typography>
            <Typography variant="body2">Campaigns Backed</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{ 
              p: 2, 
              textAlign: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              {userInfo.creators?.length || 0}
            </Typography>
            <Typography variant="body2">Creators Supported</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{ 
              p: 2, 
              textAlign: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              {exclusiveContent.length}
            </Typography>
            <Typography variant="body2">Exclusive Content</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{ 
              p: 2, 
              textAlign: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(5px)'
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              ${backedCampaigns.reduce((total, c) => total + (c.contribution || 0), 0)}
            </Typography>
            <Typography variant="body2">Total Contributed</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Campaign card component to show campaign details
  const CampaignCard = ({ campaign, isBacked = false }) => {
    const daysLeft = calculateDaysLeft(campaign.targetDate);
    
    // Calculate proper percentage based on raised amount and target amount
    const fundingPercentage = campaign.amount > 0 
      ? Math.min(parseFloat(((campaign.raisedAmount / campaign.amount) * 100).toFixed(2)), 100)
      : 0;
    
    return (
      <Card
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }
        }}
      >
        <CardMedia
          component="img"
          height="160"
          image={formatImageUrl(campaign.imageUrl) || 'https://via.placeholder.com/300x160?text=Campaign'}
          alt={campaign.title}
        />
        
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            component="div"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              height: '2.4em'
            }}
          >
            {campaign.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              height: '2.6em'
            }}
          >
            {campaign.description}
          </Typography>
          
          <Box sx={{ mt: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                {campaign.pageName}
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={fundingPercentage || 0} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                mb: 1,
                bgcolor: 'rgba(0,0,0,0.05)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: fundingPercentage >= 100 ? 'success.main' : 'primary.main'
                }
              }} 
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                ${campaign.raisedAmount || 0}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  of ${campaign.amount}
                </Typography>
              </Typography>
              
              <Typography 
                variant="body2" 
                fontWeight="bold"
                color={fundingPercentage >= 100 ? 'success.main' : 'primary.main'}
              >
                {fundingPercentage.toFixed(2)}% Funded
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                {campaign.backerCount || 0} backers
              </Typography>
              
              {campaign.targetDate && (
                <Typography variant="body2" color="text.secondary">
                  <AccessTimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  {daysLeft === 0 ? 'No days left' : `${daysLeft} days left`}
                </Typography>
              )}
            </Box>
            
            {isBacked && (
              <Box sx={{ mb: 1 }}>
                <Chip 
                  label={`You backed: $${campaign.contribution}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            )}
            
            <Button 
              variant="contained" 
              fullWidth
              color={isBacked ? "primary" : "secondary"}
              onClick={() => isBacked ? handleViewCampaign(campaign.id) : handleOpenSupportDialog(campaign)}
              sx={{ mt: 1 }}
              disabled={false}
            >
              {isBacked ? "View Details" : "Back This Project"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  // Exclusive content card
  const ContentCard = ({ content }) => (
    <Card
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box
        sx={{
          height: 160,
          bgcolor: 'primary.dark',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <LockIcon sx={{ fontSize: 40, mb: 1, opacity: 0.7 }} />
        <Typography variant="body2" fontWeight="bold">
          {content.contentType.toUpperCase()}
        </Typography>
        <Chip
          label="Exclusive"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'error.main',
            color: 'white'
          }}
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {content.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {content.description}
        </Typography>
        
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              {content.creatorPageName}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {formatDate(content.createdAt)}
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            fullWidth
            color="primary"
            onClick={() => handleViewExclusiveContent(content.id)}
            startIcon={<LockIcon />}
            sx={{ mt: 1 }}
          >
            View Content
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
  
  // Funding History Tab component
  const FundingHistoryTab = () => {
    // Calculate summary statistics
    const totalContributed = fundingHistory.reduce((sum, item) => sum + item.amount, 0);
    const uniqueProjects = [...new Set(fundingHistory.map(item => item.campaignId))].length;
    const averageContribution = fundingHistory.length > 0 
      ? (totalContributed / fundingHistory.length).toFixed(2) 
      : 0;
    
    return (
      <>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card 
              sx={{ 
                p: 2, 
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: '12px'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total Contributed</Typography>
                <MonetizationOnIcon fontSize="large" />
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>${totalContributed}</Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card 
              sx={{ 
                p: 2, 
                bgcolor: 'secondary.main',
                color: 'white',
                borderRadius: '12px'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Projects Backed</Typography>
                <CampaignIcon fontSize="large" />
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>{uniqueProjects}</Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card 
              sx={{ 
                p: 2, 
                bgcolor: 'success.main',
                color: 'white',
                borderRadius: '12px'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Average Contribution</Typography>
                <AttachMoneyIcon fontSize="large" />
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>${averageContribution}</Typography>
            </Card>
          </Grid>
        </Grid>
      
        <Card elevation={2} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: '#f5f5f5' }}>
            <MonetizationOnIcon sx={{ mr: 2, color: '#43a047' }} />
            <Typography variant="h6" fontWeight="bold">
              Projects Funding History
            </Typography>
          </Box>
          <Divider />
          
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader aria-label="funding table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: '#757575' }} />
                      Date
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon fontSize="small" sx={{ mr: 1, color: '#757575' }} />
                      Project
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: '#757575' }} />
                      Supporter
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <MonetizationOnIcon fontSize="small" sx={{ mr: 1, color: '#757575' }} />
                      Amount
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fundingHistory.length > 0 ? (
                  fundingHistory.map((transaction, index) => (
                    <TableRow
                      key={`transaction_${index}`}
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={new Date(transaction.date).toLocaleDateString()}
                          size="small"
                          sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: 'primary.dark' }}
                        />
                      </TableCell>
                      <TableCell>{transaction.campaignTitle}</TableCell>
                      <TableCell>You</TableCell>
                      <TableCell align="right">
                        <Box sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          ${transaction.amount}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        No funding history available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </>
    );
  };
  
  // Monthly Supporters Tab component
  const MonthlySupportersTab = () => (
    <>
      {/* Summary Cards for Monthly Supporters */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              p: 2, 
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: '12px'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total Supporters</Typography>
              <PersonIcon fontSize="large" />
            </Box>
            <Typography variant="h4" sx={{ mt: 2 }}>{monthlySupporters.length}</Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              p: 2, 
              bgcolor: 'secondary.main',
              color: 'white',
              borderRadius: '12px'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Monthly Income</Typography>
              <MonetizationOnIcon fontSize="large" />
            </Box>
            <Typography variant="h4" sx={{ mt: 2 }}>
              ${monthlySupporters.reduce((sum, item) => sum + item.amount, 0)}
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card 
            sx={{ 
              p: 2, 
              bgcolor: 'success.main',
              color: 'white',
              borderRadius: '12px'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Average Support</Typography>
              <AttachMoneyIcon fontSize="large" />
            </Box>
            <Typography variant="h4" sx={{ mt: 2 }}>
              ${monthlySupporters.length > 0 
                ? (monthlySupporters.reduce((sum, item) => sum + item.amount, 0) / monthlySupporters.length).toFixed(2) 
                : 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    
      <Card elevation={2} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: '#f5f5f5' }}>
          <PersonIcon sx={{ mr: 2, color: '#5c6bc0' }} />
          <Typography variant="h6" fontWeight="bold">
            Monthly Supporters
          </Typography>
        </Box>
        <Divider />
        
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader aria-label="supporters table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" sx={{ mr: 1, color: '#757575' }} />
                    Supporter
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: '#757575' }} />
                    Email
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <MonetizationOnIcon fontSize="small" sx={{ mr: 1, color: '#757575' }} />
                    Amount
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlySupporters.length > 0 ? (
                monthlySupporters.map((supporter, index) => (
                  <TableRow
                    key={`supporter_${index}`}
                    sx={{ 
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <TableCell>{`${supporter.firstName} ${supporter.lastName}`}</TableCell>
                    <TableCell>{supporter.email}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        ${supporter.amount}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No monthly supporters yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 500, textAlign: 'center' }}>
                        Monthly supporters are people who back your work on a recurring basis.
                        This feature isn't available yet but will be coming soon!
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
  
  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '16px', mb: 4 }} />
        
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: '8px', mb: 2 }} />
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }
  
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
      
      <DashboardHeader />
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="dashboard tabs"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            centered={!isMobile}
          >
            <Tab icon={<CampaignIcon />} iconPosition="start" label="Backed Campaigns" />
            <Tab icon={<NewReleasesIcon />} iconPosition="start" label="Recommended Campaigns" />
            <Tab icon={<LockIcon />} iconPosition="start" label="Exclusive Content" />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Creators" />
            <Tab icon={<AttachMoneyIcon />} iconPosition="start" label="Funding History" />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Monthly Supporters" />
          </Tabs>
        </Box>
        
        {/* Backed Campaigns Tab */}
        <Box role="tabpanel" hidden={tabValue !== 0} sx={{ mt: 3 }}>
          {tabValue === 0 && (
            <>
              {backedCampaigns.length === 0 ? (
                <Paper
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderRadius: '12px'
                  }}
                >
                  <CampaignIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                    You haven't backed any campaigns yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                    Support creators by backing their campaigns
                  </Typography>
                  <Button 
                    variant="contained"
                    onClick={() => setTabValue(1)}
                  >
                    Discover Campaigns
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {backedCampaigns.map((campaign) => (
                    <Grid item xs={12} sm={6} md={4} key={campaign.id}>
                      <CampaignCard campaign={campaign} isBacked={true} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
        
        {/* Recommended Campaigns Tab */}
        <Box role="tabpanel" hidden={tabValue !== 1} sx={{ mt: 3 }}>
          {tabValue === 1 && (
            <>
              {followedCampaigns.length === 0 ? (
                <Paper
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderRadius: '12px'
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                    No recommended campaigns found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Subscribe to more creators to see their campaigns here
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {followedCampaigns.map((campaign) => (
                    <Grid item xs={12} sm={6} md={4} key={campaign.id}>
                      <CampaignCard campaign={campaign} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
        
        {/* Exclusive Content Tab */}
        <Box role="tabpanel" hidden={tabValue !== 2} sx={{ mt: 3 }}>
          {tabValue === 2 && (
            <>
              {exclusiveContent.length === 0 ? (
                <Paper
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderRadius: '12px'
                  }}
                >
                  <LockIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                    No exclusive content yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Subscribe to creators to access their exclusive content
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {exclusiveContent.map((content) => (
                    <Grid item xs={12} sm={6} md={4} key={content.id}>
                      <ContentCard content={content} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
        
        {/* Creators Tab */}
        <Box role="tabpanel" hidden={tabValue !== 3} sx={{ mt: 3 }}>
          {tabValue === 3 && (
            <CreatorsTab 
              userInfo={userInfo} 
              onViewCreator={(pageName) => history.push(`/viewcreator/${pageName}`)} 
            />
          )}
        </Box>
        
        {/* Funding History Tab */}
        <Box role="tabpanel" hidden={tabValue !== 4} sx={{ mt: 3 }}>
          {tabValue === 4 && <FundingHistoryTab />}
        </Box>
        
        {/* Monthly Supporters Tab */}
        <Box role="tabpanel" hidden={tabValue !== 5} sx={{ mt: 3 }}>
          {tabValue === 5 && <MonthlySupportersTab />}
        </Box>
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
          {selectedCampaign && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedCampaign.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  by {selectedCampaign.pageName}
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <MonetizationOnIcon />
                    </InputAdornment>
                  )
                }}
                error={!!pledgeError}
                helperText={pledgeError || "Your support helps bring creative projects to life."}
              />
            </>
          )}
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
    </Container>
  );
}

export default AudienceDashboard; 