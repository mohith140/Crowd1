import React, { useState } from "react";
import { 
  Card, 
  Typography, 
  Grid, 
  CardContent, 
  CardMedia, 
  CardActions,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Skeleton,
  Divider,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import LockIcon from "@mui/icons-material/Lock";
import { SERVER_URL } from "../../../constant/serverUrl";

const videoSrc = (author, name) => {
  return (
    SERVER_URL +
    "/file/creators/" +
    author +
    "/exclusive/" +
    name +
    "/" +
    name +
    ".mp4"
  );
};

function View({ data, loading, error, showAlert }) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  
  const handleMenuOpen = (event, content) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedContent(content);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleDelete = async (contentId, title) => {
    try {
      const pageName = localStorage.getItem("pageName");
      
      await axios.post(SERVER_URL + "/creator/exclusive/delete", {
        pageName: pageName,
        title: title,
      });
      
      showAlert("Content deleted successfully", "success");
      // Refresh the list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting content:", error);
      showAlert("Failed to delete content. Please try again.", "error");
    }
    handleMenuClose();
  };
  
  const handleShare = (title) => {
    const pageName = localStorage.getItem("pageName");
    const shareUrl = `${window.location.origin}/audience/${pageName}/exclusive/${title}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        showAlert("Link copied to clipboard!", "success");
      })
      .catch(() => {
        showAlert("Failed to copy link. Please try manually.", "error");
      });
    
    handleMenuClose();
  };

  // Display loading skeletons while fetching data
  if (loading) {
    return (
      <Box>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <VideoLibraryIcon sx={{ mr: 1 }} />
          Exclusive Content
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={6} key={item}>
              <Card elevation={1} sx={{ height: '100%', borderRadius: '12px' }}>
                <Skeleton variant="rectangular" height={200} animation="wave" />
                <CardContent>
                  <Skeleton variant="text" width="60%" height={30} animation="wave" />
                  <Skeleton variant="text" width="90%" animation="wave" />
                  <Skeleton variant="text" width="80%" animation="wave" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Display error message
  if (error) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          borderRadius: '12px',
          bgcolor: 'error.light',
          color: 'error.dark'
        }}
      >
        <Typography variant="h6">Error Loading Content</Typography>
        <Typography variant="body1">
          We couldn't load your exclusive content. Please try refreshing the page.
        </Typography>
      </Paper>
    );
  }

  // Display empty state when no content exists
  if (!data || data.length === 0) {
    return (
      <Box>
        <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <VideoLibraryIcon sx={{ mr: 1 }} />
          Exclusive Content
        </Typography>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: '12px',
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            mb: 3
          }}
        >
          <LockIcon sx={{ fontSize: 60, mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" gutterBottom>No Exclusive Content Yet</Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Create your first exclusive content to engage your supporters with premium material.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <VideoLibraryIcon sx={{ mr: 1 }} />
        Exclusive Content
      </Typography>
      
      <Grid container spacing={3}>
        {data.map((content, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Card 
              elevation={1} 
              sx={{ 
                height: '100%',
                borderRadius: '12px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia 
                  component="video"
                  height="200"
                  src={content.exclusiveURL}
                  controls
                  sx={{ 
                    objectFit: 'contain',
                    bgcolor: 'black' 
                  }}
                />
                <Chip 
                  label="Exclusive" 
                  color="primary" 
                  size="small"
                  icon={<LockIcon />}
                  sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    left: 10,
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
              
              <CardContent sx={{ pt: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" gutterBottom component="h3">
                    {content.title}
                  </Typography>
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, content)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {content.description}
                </Typography>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Tooltip title="Share content">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleShare(content.title)}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        elevation={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleShare(selectedContent?.title)}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share Link</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleDelete(selectedContent?.id, selectedContent?.title)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default View;
