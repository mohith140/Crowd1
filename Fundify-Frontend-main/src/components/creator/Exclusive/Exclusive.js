import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Paper, 
  Tabs, 
  Tab,
  Divider,
  useMediaQuery,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import View from "./View";
import New from "./New";
import { SERVER_URL } from "../../../constant/serverUrl";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import AddCircleIcon from "@mui/icons-material/AddCircle";

function Exclusive() {
  const [exclusiveData, setExclusiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [refresh, setRefresh] = useState(0); // Used to trigger refresh
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setLoading(true);
    axios
      .post(SERVER_URL + "/creator/exclusive/view", {
        pageName: localStorage.getItem("pageName"),
      })
      .then((response) => {
        setExclusiveData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching exclusive content:", err);
        setError(true);
        setLoading(false);
      });
  }, [refresh]);

  const handleViewExclusive = () => {
    setRefresh(prev => prev + 1); // Increment to trigger refresh
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const showAlert = (message, severity = "success") => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: '16px',
          background: 'linear-gradient(145deg, #6a1b9a 0%, #4a148c 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Exclusive Content Management
        </Typography>
        <Typography variant="body1">
          Create and manage premium content for your subscribers. Exclusive content helps build a deeper relationship with your supporters.
        </Typography>
      </Paper>
      
      {isMobile ? (
        // Mobile view - tabs navigation
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab icon={<LockOpenIcon />} label="View Content" />
              <Tab icon={<AddCircleIcon />} label="Add New" />
            </Tabs>
          </Box>
          
          {tabValue === 0 ? (
            <View 
              data={exclusiveData} 
              loading={loading} 
              error={error} 
              showAlert={showAlert} 
            />
          ) : (
            <New 
              handleViewExclusive={handleViewExclusive}
              showAlert={showAlert}
            />
          )}
        </Box>
      ) : (
        // Desktop view - side by side
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <View 
              data={exclusiveData} 
              loading={loading} 
              error={error} 
              showAlert={showAlert} 
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                height: '100%'
              }}
            >
              <New 
                handleViewExclusive={handleViewExclusive}
                showAlert={showAlert}
              />
            </Paper>
          </Grid>
        </Grid>
      )}
      
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

export default Exclusive;
