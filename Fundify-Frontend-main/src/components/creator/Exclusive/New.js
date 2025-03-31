import * as React from "react";
import { useState } from "react";
import axios from "axios";
import { 
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Container,
  CssBaseline,
  FormHelperText,
  InputAdornment,
  CircularProgress,
  Paper,
  Alert
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import TitleIcon from "@mui/icons-material/Title";
import DescriptionIcon from "@mui/icons-material/Description";
import { SERVER_URL } from "../../../constant/serverUrl";

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

export default function NewExclusiveContent({ handleViewExclusive, showAlert }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null
  });
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.file) newErrors.file = "Content file is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      setFileName(file.name);
      
      // Clear file error
      if (errors.file) {
        setErrors(prev => ({
          ...prev,
          file: null
        }));
      }
      
      // Create file preview for videos
      if (file.type.startsWith('video/')) {
        const videoUrl = URL.createObjectURL(file);
        setFilePreview(videoUrl);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const pageName = localStorage.getItem("pageName");
      const email = localStorage.getItem("email");
      
      // First create the content metadata
      await axios.post(SERVER_URL + "/creator/exclusive/new", {
        email: email,
        pageName: pageName,
        title: formData.title,
        description: formData.description,
      });
      
      // Then upload the file
      const formDataToSend = new FormData();
      formDataToSend.append("contentFile", formData.file);
      
      await axios.post(
        SERVER_URL + "/exclusive/upload/" + pageName, 
        formDataToSend, 
        { params: { title: formData.title } }
      );
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        file: null
      });
      setFileName("");
      setFilePreview(null);
      
      // Show success message
      if (showAlert) {
        showAlert("Content created successfully!", "success");
      }
      
      // Refresh the view
      handleViewExclusive(pageName);
    } catch (error) {
      console.error("Error creating content:", error);
      if (showAlert) {
        showAlert("Failed to create content. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main">
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2" fontWeight="bold" color="primary" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <AddCircleOutlineIcon sx={{ mr: 1 }} />
          Create New Content
        </Typography>
        
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                label="Content Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                name="description"
                label="Content Description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  py: 1.5,
                  borderStyle: errors.file ? 'solid' : 'dashed',
                  borderColor: errors.file ? 'error.main' : 'primary.main'
                }}
              >
                {fileName ? `Selected: ${fileName}` : "Upload Content File (.mp4)"}
                <VisuallyHiddenInput 
                  type="file"
                  id="contentFile"
                  name="contentFile"
                  accept=".mp4"
                  onChange={handleFileChange}
                />
              </Button>
              {errors.file && (
                <FormHelperText error>{errors.file}</FormHelperText>
              )}
            </Grid>
            
            {filePreview && (
              <Grid item xs={12}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    borderColor: 'primary.light'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Preview:</Typography>
                  <video 
                    width="100%" 
                    controls 
                    src={filePreview}
                    style={{ borderRadius: '8px' }}
                  />
                </Paper>
              </Grid>
            )}
          </Grid>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              mt: 4, 
              mb: 2, 
              py: 1.5,
              borderRadius: '8px', 
              position: 'relative'
            }}
          >
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
            {loading ? 'UPLOADING...' : 'CREATE CONTENT'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
