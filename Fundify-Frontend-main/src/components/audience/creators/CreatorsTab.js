import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Paper,
  TextField,
  InputAdornment
} from '@mui/material';
import { SERVER_URL } from '../../../constant/serverUrl';
import { formatImageUrl } from '../../../services/api';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import VerifiedIcon from '@mui/icons-material/Verified';

function CreatorsTab({ userInfo, onViewCreator }) {
  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_URL}/api/creators`);
      
      if (Array.isArray(response.data)) {
        setCreators(response.data);
        setFilteredCreators(response.data);
      } else {
        console.error('Invalid creators data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term) {
      const filtered = creators.filter((creator) =>
        creator.pageName.toLowerCase().includes(term) ||
        (creator.firstName && creator.firstName.toLowerCase().includes(term)) ||
        (creator.lastName && creator.lastName.toLowerCase().includes(term)) ||
        (creator.category && creator.category.toLowerCase().includes(term)) ||
        (creator.bio && creator.bio.toLowerCase().includes(term))
      );
      setFilteredCreators(filtered);
    } else {
      setFilteredCreators(creators);
    }
  };

  // Get category chip color
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

  // Get shortened bio
  const getShortenedBio = (bio, maxLength = 120) => {
    if (!bio) return "No bio available";
    
    if (bio.length <= maxLength) return bio;
    
    return bio.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search Bar */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search creators by name, category or bio..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* No Results */}
      {filteredCreators.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px' }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No creators found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm ? "Try different search terms" : "We couldn't find any creators"}
          </Typography>
        </Paper>
      )}

      {/* Creators Grid */}
      <Grid container spacing={3}>
        {filteredCreators.map((creator) => {
          // Get creator name
          const creatorName = creator.name || 
            (creator.firstName && creator.lastName 
              ? `${creator.firstName} ${creator.lastName}` 
              : creator.pageName);
              
          // Determine if following this creator
          const isFollowing = userInfo.creators && 
            userInfo.creators.includes(creator.pageName);

          return (
            <Grid item xs={12} sm={6} md={4} key={creator._id || creator.pageName}>
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
                {/* Cover Background */}
                <Box
                  sx={{
                    height: 100,
                    bgcolor: 'primary.main',
                    backgroundImage: creator.coverImage 
                      ? `url(${formatImageUrl(creator.coverImage)})` 
                      : 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                />
                
                {/* Avatar */}
                <Avatar
                  src={formatImageUrl(creator.profileImage)}
                  alt={creatorName}
                  sx={{
                    width: 80,
                    height: 80,
                    border: '4px solid #fff',
                    position: 'absolute',
                    top: 60,
                    left: 16,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {!creator.profileImage && <PersonIcon sx={{ fontSize: 40 }} />}
                </Avatar>
                
                <CardContent sx={{ pt: 5, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
                    <Typography variant="h6" gutterBottom>
                      {creatorName}
                    </Typography>
                    
                    {creator.isVerified && (
                      <VerifiedIcon 
                        color="primary" 
                        fontSize="small" 
                        titleAccess="Verified Creator" 
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    @{creator.pageName}
                  </Typography>
                  
                  {creator.category && (
                    <Chip
                      icon={<CategoryIcon />}
                      label={creator.category}
                      size="small"
                      sx={{
                        mb: 2,
                        bgcolor: getCategoryChipColor(creator.category).bg,
                        color: getCategoryChipColor(creator.category).color
                      }}
                    />
                  )}
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: '4.5em'
                    }}
                  >
                    {getShortenedBio(creator.bio)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="body2" color="text.secondary">
                      {creator.followerCount || 0} followers
                    </Typography>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => onViewCreator(creator.pageName)}
                    >
                      View Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default CreatorsTab; 