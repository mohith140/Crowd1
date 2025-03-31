import * as React from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { SERVER_URL } from "../../../constant/serverUrl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Paper from "@mui/material/Paper";
import { useHistory } from "react-router-dom";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import LaunchIcon from "@mui/icons-material/Launch";
import Tooltip from "@mui/material/Tooltip";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

// Styled component for file input
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function CreateCampaign() {
  const [category, setCategory] = React.useState("");
  const [imageFile, setImageFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [launchImmediately, setLaunchImmediately] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertSeverity, setAlertSeverity] = React.useState("success");
  const [activeStep, setActiveStep] = React.useState(0);
  const history = useHistory();

  const steps = ['Enter Campaign Details', 'Review Campaign', 'Launch Campaign'];

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleLaunchChange = (event) => {
    setLaunchImmediately(event.target.checked);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    const data = new FormData(event.currentTarget);
    const pageName = localStorage.getItem("pageName");
    const email = localStorage.getItem("email");
    const projectName = data.get("title");

    // Validate form fields
    if (!projectName || !data.get("description") || !data.get("amount") || !category) {
      showAlert("Please fill all required fields", "error");
      setLoading(false);
      return;
    }

    // Prepare form data for API call
    const formData = new FormData();
    formData.append("title", projectName);
    formData.append("description", data.get("description"));
    formData.append("amount", data.get("amount"));
    formData.append("category", category);
    formData.append("targetDate", data.get("targetDate") || "");
    formData.append("launchImmediately", launchImmediately.toString());
    
    // Add tags if provided
    const tags = data.get("tags");
    if (tags) {
      formData.append("tags", tags);
    }
    
    // Add image file if selected
    if (imageFile) {
      formData.append("campaignImage", imageFile);
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      
      // Create the campaign using the campaigns API
      const response = await axios.post(
        `${SERVER_URL}/api/campaigns`, 
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      
      setLoading(false);
      
      if (launchImmediately) {
        showAlert("Campaign created and launched successfully!");
      } else {
        showAlert("Campaign saved as draft.");
      }
      
      // Redirect to projects view after 2 seconds
      setTimeout(() => {
        history.push("/creatordashboard/projects");
      }, 2000);
      
    } catch (error) {
      console.error("Error creating campaign:", error);
      const errorMessage = error.response?.data?.error || "Error creating campaign. Please try again.";
      showAlert(errorMessage, "error");
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <CssBaseline />
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => history.push("/creatordashboard/projects")}
            aria-label="back"
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Create New Campaign
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: "16px",
            backgroundColor: "#fafafa",
          }}
        >
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="title"
                  label="Campaign Title"
                  name="title"
                  autoComplete="title"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="description"
                  label="Campaign Description"
                  type="text"
                  id="description"
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    value={category}
                    label="Category"
                    onChange={handleCategoryChange}
                  >
                    <MenuItem value="Education">Education</MenuItem>
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Donation">Donation</MenuItem>
                    <MenuItem value="Healthcare">Healthcare</MenuItem>
                    <MenuItem value="Environment">Environment</MenuItem>
                    <MenuItem value="Arts">Arts & Culture</MenuItem>
                    <MenuItem value="Community">Community</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  name="amount"
                  label="Funding Goal (₹)"
                  type="number"
                  id="amount"
                  variant="outlined"
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="targetDate"
                  label="Target Date"
                  type="date"
                  id="targetDate"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="imageUrl"
                  label="Image URL (optional)"
                  type="url"
                  id="imageUrl"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                      backgroundColor: '#2e7d32',
                      '&:hover': { backgroundColor: '#1b5e20' } 
                    }}
                  >
                    Upload Campaign Image
                    <VisuallyHiddenInput 
                      type="file" 
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </Button>
                  
                  {previewUrl && (
                    <Box 
                      sx={{ 
                        mt: 2, 
                        width: '100%', 
                        maxHeight: '200px', 
                        overflow: 'hidden',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        style={{ width: '100%', objectFit: 'cover' }} 
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                  border: '1px dashed #1976d2',
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={launchImmediately} 
                        onChange={handleLaunchChange}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>Launch campaign immediately</Typography>
                        <Tooltip title="Your campaign will be visible to the public when launched">
                          <LaunchIcon sx={{ ml: 1, fontSize: '0.9rem', color: 'primary.main' }} />
                        </Tooltip>
                      </Box>
                    }
                  />
                </Box>
                {launchImmediately && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Your campaign will be publicly visible as soon as you submit.
                  </Alert>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => history.push("/creatordashboard/projects")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ 
                      backgroundColor: launchImmediately ? '#ff5722' : 'primary.main',
                      '&:hover': { 
                        backgroundColor: launchImmediately ? '#e64a19' : 'primary.dark'
                      }
                    }}
                    disabled={loading}
                    startIcon={launchImmediately ? <LaunchIcon /> : null}
                  >
                    {launchImmediately ? 'Create & Launch Campaign' : 'Save Campaign'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
      
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
      
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
} 