import React from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { SERVER_URL } from "../constant/serverUrl";
import { useHistory } from "react-router-dom";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";

function Projects() {
  const history = useHistory();
  const [projects, setProjects] = React.useState([]);
  const [filteredProjects, setFilteredProjects] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false); // State for modal visibility
  const [currentProject, setCurrentProject] = React.useState(null); // State for the project clicked
  const [modalMessage, setModalMessage] = React.useState(""); // State for modal message
  const amountRef = React.useRef();
  const searchRef = React.useRef();

  React.useEffect(() => {
    axios
      .get(SERVER_URL + "/projects")
      .then((response) => {
        setProjects([...response.data.slice(0, 10)].reverse());
        setFilteredProjects([...response.data.slice(0, 10)].reverse()); // Initialize filteredProjects
      })
      .catch((err) => {});
      
  }, []);

  const handlePledge = (pageName, projectTitle) => {
    setModalMessage("Please login to contribute to this project."); // Set the message for Pledge
    setIsModalOpen(true); // Show the modal
  };

  const getRaisedAmount = (audience) => {
    return audience.reduce((total, element) => total + (parseInt(element.amount) || 0), 0);
  };

  const getFundingPercentage = (raisedAmount, totalAmount) => {
    if (!totalAmount || totalAmount <= 0) return 0;
    return Math.min(Math.round((raisedAmount / totalAmount) * 100), 100);
  };

  const handleSearch = () => {
    const searchQuery = searchRef.current.value.toLowerCase();
    const filtered = projects.filter((project) =>
      project.title.toLowerCase().includes(searchQuery) || project.description.toLowerCase().includes(searchQuery)
    );
    setFilteredProjects(filtered);
  };

  const openModal = (project) => {
    setCurrentProject(project);
    setModalMessage("You need to login to view the details of this project."); // Set the message for clicking on image
    setIsModalOpen(true); // Show the modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProject(null);
  };

  return (
    <div>
      {/* Search Box */}
      <Grid container justifyContent="center" style={{ marginBottom: "1rem", marginTop: "6rem" }}>
        <Grid item xs={12} sm={8} md={6}>
          <TextField
            inputRef={searchRef}
            type="text"
            variant="outlined"
            size="small"
            fullWidth
            placeholder="Search Projects"
            onChange={handleSearch}
            sx={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              input: { color: "black" },
            }}
          />
        </Grid>
      </Grid>

      {/* Projects Grid */}
      <Grid container style={{ top: "3px", padding: "3rem", backgroundColor: "#fff" }} spacing={4}>
        {filteredProjects.map((element, index) => (
          <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                borderRadius: "16px",
                backgroundColor: "#1e1e1e",
                color: "white",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 6px 12px rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={element.projectURL}
                alt={element.title}
                style={{ borderRadius: "16px 16px 0 0", cursor: "pointer" }}
                onClick={() => openModal(element)} // Open the modal when clicking on the image
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div" style={{ color: "#00e676" }}>
                  {element.title}
                </Typography>
                <Typography variant="body2" color="red">
                  {element.description}
                </Typography>
              </CardContent>
              <CardActions style={{ paddingInline: "1rem", paddingBottom: "1rem" }}>
                <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="body1" color="orange" fontWeight="bold">
                      Required: ₹ {element.amount}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="body1" color="blue" fontWeight="bold">
                      Raised: ₹ {getRaisedAmount(element.audience)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardActions>
              
              {/* Funding Progress */}
              <Box sx={{ px: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="white">
                    Progress
                  </Typography>
                  <Typography variant="body2" color="white">
                    {parseFloat(getFundingPercentage(getRaisedAmount(element.audience), element.amount)).toFixed(2)}% Funded
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={getFundingPercentage(getRaisedAmount(element.audience), element.amount)} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    mb: 1,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#00e676',
                    }
                  }} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Chip 
                    label={`${getRaisedAmount(element.audience) > 0 ? getRaisedAmount(element.audience) : 0} raised`} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                  />
                  <Chip 
                    label={`of ${element.amount}`} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </Box>
              </Box>
              
              <CardActions style={{ paddingInline: "1rem", paddingBottom: "1rem" }}>
                <TextField
                  inputRef={amountRef}
                  type="number"
                  variant="outlined"
                  size="small"
                  placeholder="Amount (₹)"
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    input: { color: "black" },
                    width: "100%",
                  }}
                />
              </CardActions>
              <CardActions>
                <Button
                  fullWidth
                  sx={{
                    backgroundColor: "#00e676",
                    color: "black",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "#00c853",
                    },
                  }}
                  onClick={() => handlePledge(element.pageName, element.title)}
                >
                  Pledge
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal for login prompt */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(5px)", // This blurs the background behind the modal
        }}
      >
        <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.9)", // Slightly opaque box to contrast the blurred background
            padding: "2rem",
            borderRadius: "8px",
            maxWidth: "400px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            position: "relative",
          }}
        >
          <Typography variant="h6" style={{ marginBottom: "1rem" }}>
            {modalMessage} {/* Display the appropriate message */}
          </Typography>
          <Grid container spacing={2} justifyContent="center" style={{ marginBottom: "1rem" }}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => history.push("/login")}
                sx={{
                  backgroundColor: "#00e676",
                  color: "black",
                  "&:hover": {
                    backgroundColor: "#00c853",
                  },
                }}
              >
                Login
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="secondary"
                onClick={closeModal}
                sx={{
                  backgroundColor: "#fff",
                  color: "#00e676",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
}

export default Projects;
