import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Divider,
  Button,
  Chip,
  Card,
  CardMedia,
  CardContent,
  LinearProgress,
  IconButton,
  CircularProgress,
  Alert,
  Link
} from "@mui/material";
import { SERVER_URL } from "../../../constant/serverUrl";
import { formatImageUrl } from "../../../services/api";

// Icons
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LanguageIcon from '@mui/icons-material/Language';
import CategoryIcon from '@mui/icons-material/Category';
import CampaignIcon from '@mui/icons-material/Campaign';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function ViewCreator() {
  const { pageName } = useParams();
  const history = useHistory();
  const [creator, setCreator] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching creator profile for: ${pageName}`);
        
        const response = await axios.get(`${SERVER_URL}/api/creator/${pageName}`);
        console.log("Creator response:", response.data);
        
        setCreator(response.data.creator);
        setCampaigns(response.data.campaigns || []);
      } catch (err) {
        console.error("Error fetching creator profile:", err);
        setError(err.response?.data?.message || "Failed to load creator profile");
      } finally {
        setLoading(false);
      }
    };
    
    if (pageName) {
      fetchCreator();
    }
  }, [pageName]);

  const handleCampaignClick = (campaignId) => {
    // Make sure userType is set in local storage
    if (!localStorage.getItem("userType")) {
      localStorage.setItem("userType", "audience");
    }
    
    history.push(`/campaign/${campaignId}`);
  };

  const calculateDaysLeft = (targetDate) => {
    if (!targetDate) return null;
    const remaining = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    return remaining > 0 ? remaining : 0;
  };

  const renderSocialLinks = (socialLinks) => {
    if (!socialLinks) return null;
    
    const icons = {
      facebook: <FacebookIcon />,
      twitter: <TwitterIcon />,
      instagram: <InstagramIcon />,
      youtube: <YouTubeIcon />,
      website: <LanguageIcon />
    };
    
    return (
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        {Object.entries(socialLinks).map(([platform, url]) => {
          if (!url) return null;
          return (
            <IconButton 
              key={platform} 
              color="primary" 
              component="a" 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {icons[platform] || <LanguageIcon />}
            </IconButton>
          );
        })}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '70vh' 
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => history.push('/audiencedashboard')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!creator) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="info">Creator not found</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={() => history.push('/audiencedashboard')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button */}
      <Box sx={{ display: 'flex', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => history.push('/audiencedashboard')}
        >
          Back to Dashboard
        </Button>
      </Box>
      
      {/* Creator profile header */}
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: '16px', 
          overflow: 'hidden',
          mb: 4
        }}
      >
        {/* Cover Image */}
        <Box 
          sx={{ 
            height: 200,
            bgcolor: 'primary.dark',
            position: 'relative',
            backgroundImage: creator.coverImage ? `url(${formatImageUrl(creator.coverImage)})` : 'linear-gradient(120deg, #3f51b5 0%, #2196f3 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Profile Info */}
        <Box sx={{ p: 3, position: 'relative' }}>
          <Avatar
            src={formatImageUrl(creator.profileImage)}
            alt={creator.name}
            sx={{ 
              width: 120, 
              height: 120, 
              border: '4px solid #fff',
              position: 'absolute',
              top: -60,
              left: 40,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {!creator.profileImage && <PersonIcon sx={{ fontSize: 80 }} />}
          </Avatar>
          
          <Box sx={{ pl: { xs: 0, sm: 20 }, pt: { xs: 8, sm: 1 }, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h4" component="h1">
                {creator.name}
              </Typography>
              
              {creator.isVerified && (
                <VerifiedIcon 
                  color="primary" 
                  fontSize="medium" 
                  titleAccess="Verified Creator"
                />
              )}
            </Box>
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              @{creator.pageName}
            </Typography>
            
            {creator.category && (
              <Chip 
                icon={<CategoryIcon />} 
                label={creator.category} 
                size="small" 
                sx={{ mt: 1, mr: 1 }} 
              />
            )}
            
            <Chip 
              icon={<PersonIcon />} 
              label={`${creator.followerCount || 0} Followers`} 
              size="small" 
              sx={{ mt: 1 }} 
            />
          </Box>
          
          {/* Bio */}
          <Box sx={{ pl: { xs: 0, sm: 20 }, mt: 1 }}>
            <Typography variant="body1" paragraph>
              {creator.bio || "No bio available"}
            </Typography>
            
            {/* Social Links */}
            {renderSocialLinks(creator.socialLinks)}
          </Box>
        </Box>
      </Paper>
      
      {/* Active Campaigns Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Active Campaigns
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {campaigns.length === 0 ? (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: '12px'
            }}
          >
            <CampaignIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              No active campaigns
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This creator doesn't have any active campaigns at the moment
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {campaigns.map((campaign) => {
              const daysLeft = calculateDaysLeft(campaign.targetDate);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={campaign.id}>
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
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          height: '3em'
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {campaign.backerCount} backers
                          </Typography>
                          
                          {campaign.targetDate && (
                            <Typography variant="body2" color="text.secondary">
                              <AccessTimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                              {daysLeft === 0 ? 'No days left' : `${daysLeft} days left`}
                            </Typography>
                          )}
                        </Box>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={campaign.fundingPercentage || 0} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            mb: 1,
                            bgcolor: 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: campaign.fundingPercentage >= 100 ? 'success.main' : 'primary.main'
                            }
                          }} 
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            ₹{campaign.raisedAmount || 0}
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                              of ₹{campaign.amount}
                            </Typography>
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={campaign.fundingPercentage >= 100 ? 'success.main' : 'primary.main'}
                          >
                            {campaign.fundingPercentage || 0}% funded
                          </Typography>
                        </Box>
                        
                        <Button 
                          variant="contained" 
                          fullWidth
                          color="secondary"
                          onClick={() => handleCampaignClick(campaign.id)}
                          sx={{ mt: 1 }}
                        >
                          Support Campaign
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Container>
  );
}

export default ViewCreator; 