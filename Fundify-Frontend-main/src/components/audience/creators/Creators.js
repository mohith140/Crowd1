import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid, 
  Box,
  Container,
  Avatar,
  TextField,
  InputAdornment,
  Paper,
  Divider,
  Chip,
  Skeleton,
  CardMedia,
  IconButton,
  Tooltip,
  CircularProgress
} from "@mui/material";
import { SERVER_URL } from "../../../constant/serverUrl";
import { useHistory } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import LanguageIcon from "@mui/icons-material/Language";
import CategoryIcon from "@mui/icons-material/Category";
import VerifiedIcon from "@mui/icons-material/Verified";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";

// Get random background image based on category
const getCategoryBackground = (category) => {
  const backgrounds = {
    "Education": "https://source.unsplash.com/random?education",
    "Technology": "https://source.unsplash.com/random?technology",
    "Donation": "https://source.unsplash.com/random?charity",
    "Healthcare": "https://source.unsplash.com/random?healthcare",
    "Environment": "https://source.unsplash.com/random?environment",
    "Arts": "https://source.unsplash.com/random?art",
    "Community": "https://source.unsplash.com/random?community",
    "Other": "https://source.unsplash.com/random?creative"
  };
  
  return backgrounds[category] || "https://source.unsplash.com/random?creator";
};

// Get avatar color based on name
const getAvatarColor = (name) => {
  const colors = [
    "#ef5350", "#ec407a", "#ab47bc", "#7e57c2", 
    "#5c6bc0", "#42a5f5", "#29b6f6", "#26c6da",
    "#26a69a", "#66bb6a", "#9ccc65", "#d4e157",
    "#ffee58", "#ffca28", "#ffa726", "#ff7043"
  ];
  
  if (!name) return colors[0];
  
  // Simple hash function to generate consistent color for same name
  const hash = name.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return colors[hash % colors.length];
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

function Creators() {
  const history = useHistory();
  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    console.log("Creators component mounted");
    fetchCreators();
    
    // Debug current route
    console.log("Current path:", window.location.pathname);
    
    return () => {
      console.log("Creators component unmounted");
    };
  }, []);
  
  const fetchCreators = async () => {
    setLoading(true);
    try {
      // Fetch all creators from the API
      console.log("Fetching creators from:", SERVER_URL + "/creators");
      const response = await axios.get(SERVER_URL + "/api/creators");
      console.log("Fetched creators:", response.data);
      console.log("Response status:", response.status);
      
      if (Array.isArray(response.data)) {
        console.log("Setting creators array, length:", response.data.length);
        setCreators(response.data);
        setFilteredCreators(response.data);
      } else {
        console.error("Invalid response format for creators:", response.data);
        setCreators([]);
        setFilteredCreators([]);
      }
    } catch (error) {
      console.error("Error fetching creators:", error);
      console.error("Error details:", error.response?.data || error.message);
      setCreators([]);
      setFilteredCreators([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    // Filter creators by name or category
    if (term) {
      const filtered = creators.filter((creator) =>
        creator.pageName.toLowerCase().includes(term) ||
        (creator.category && creator.category.toLowerCase().includes(term)) ||
        (creator.bio && creator.bio.toLowerCase().includes(term))
      );
      setFilteredCreators(filtered);
    } else {
      setFilteredCreators(creators);
    }
  };
  
  const handleCreatorClick = (pageName) => {
    console.log("Navigating to creator page:", pageName);
    history.push(`/viewcreator/${pageName}`);
  };
  
  // Get shortened bio
  const getShortenedBio = (bio, maxLength = 120) => {
    if (!bio) return "No bio available";
    
    if (bio.length <= maxLength) return bio;
    
    return bio.substring(0, maxLength) + "...";
  };
  
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
          All Creators
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, maxWidth: '700px', mx: 'auto', opacity: 0.9 }}>
          Browse and discover all the creative minds on Fundify
        </Typography>
      </Box>
      
      {/* Search Section */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 'medium', minWidth: '100px' }}>
          Search:
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search by name, category or bio..."
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

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* No Results */}
      {!loading && filteredCreators.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px' }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No creators found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm ? "Try different search terms" : "Be the first to create a profile!"}
          </Typography>
        </Paper>
      )}

      {/* Creators List */}
      {!loading && filteredCreators.length > 0 && (
        <Grid container spacing={3}>
          {filteredCreators.map((creator) => (
            <Grid item xs={12} sm={6} md={4} key={creator._id || creator.pageName}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px -8px rgba(0, 0, 0, 0.2)',
                  },
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={creator.profileImage || `https://avatars.dicebear.com/api/initials/${encodeURIComponent(creator.pageName)}.svg`}
                  alt={creator.pageName}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mr: 1 }}>
                      {creator.firstName} {creator.lastName || creator.pageName}
                    </Typography>
                    {(creator.isVerified || creator.verified) && (
                      <VerifiedIcon sx={{ color: 'primary.main', fontSize: '1rem' }} />
                    )}
                  </Box>
                  {creator.category && (
                    <Chip 
                      label={creator.category} 
                      size="small" 
                      sx={{ mb: 2, backgroundColor: 'primary.light', color: 'primary.dark' }} 
                    />
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {creator.bio || "No bio available"}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {creator.followers ? (Array.isArray(creator.followers) ? creator.followers.length : creator.followers) : 0} followers
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={() => handleCreatorClick(creator.pageName)}
                  >
                    View Profile
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Creators;
