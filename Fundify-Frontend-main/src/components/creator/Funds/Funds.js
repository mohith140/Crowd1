import * as React from "react";
import axios from "axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { 
  Grid, 
  Typography, 
  Box, 
  Container, 
  Card, 
  CardContent, 
  Divider, 
  Chip,
  Avatar,
  LinearProgress,
  Tooltip,
  CircularProgress
} from "@mui/material";
import { SERVER_URL } from "../../../constant/serverUrl";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function Funds() {
  const [supporters, setSupporters] = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [totalFunds, setTotalFunds] = React.useState(0);
  const [followerCount, setFollowerCount] = React.useState(0);
  const [activeCampaigns, setActiveCampaigns] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const dashboardResponse = await axios.get(SERVER_URL + "/api/creator/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        // Set state from dashboard response
        setTotalFunds(dashboardResponse.data.totalRaised || 0);
        setFollowerCount(dashboardResponse.data.followerCount || 0);
        setActiveCampaigns(dashboardResponse.data.activeCampaigns || 0);
        
        // Continue with existing API calls for detailed supporter and project data
        const supportersResponse = await axios.post(SERVER_URL + "/api/creator/funds/audience", {
          pageName: localStorage.getItem("pageName"),
        });
        
        const projectsResponse = await axios.post(SERVER_URL + "/api/creator/funds/projects", {
          pageName: localStorage.getItem("pageName"),
        });
        
        setSupporters(supportersResponse.data.audience || []);
        setProjects(projectsResponse.data || []);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Get supporter count (fallback if API doesn't provide it)
  const supporterCount = React.useMemo(() => {
    // Use the follower count from API if available
    if (followerCount > 0) return followerCount;
    
    // Otherwise calculate from projects data as fallback
    const uniqueEmails = new Set();
    projects.forEach(project => {
      project.audience.forEach(person => {
        uniqueEmails.add(person.email);
      });
    });
    return uniqueEmails.size;
  }, [projects, followerCount]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 4, pb: 6 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Funds & Supporters
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Summary Cards */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      borderRadius: '16px',
                      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          Total Supporters
                        </Typography>
                        <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                          <PeopleAltIcon />
                        </Avatar>
                      </Box>
                      <Typography variant="h3" sx={{ mb: 1 }}>
                        {supporterCount}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        People who funded your projects
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      borderRadius: '16px', 
                      backgroundImage: 'linear-gradient(135deg, #43c6ac 0%, #191654 100%)',
                      color: 'white',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          Total Funds Raised
                        </Typography>
                        <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                          <AccountBalanceWalletIcon />
                        </Avatar>
                      </Box>
                      <Typography variant="h3" sx={{ mb: 1 }}>
                        ₹{totalFunds.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Across all projects
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      borderRadius: '16px', 
                      backgroundImage: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
                      color: 'white',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          Active Projects
                        </Typography>
                        <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                          <AssignmentIcon />
                        </Avatar>
                      </Box>
                      <Typography variant="h3" sx={{ mb: 1 }}>
                        {activeCampaigns}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Campaigns receiving funds
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
            
            <Grid container spacing={4}>
              {/* Monthly Supporters Table */}
              <Grid item xs={12} md={5}>
                <Card elevation={2} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 3, bgcolor: '#f5f5f5' }}>
                    <PeopleAltIcon sx={{ mr: 2, color: '#3f51b5' }} />
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
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <EmailIcon fontSize="small" sx={{ mr: 1, color: '#757575' }} />
                              Email
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <LocalAtmIcon fontSize="small" sx={{ mr: 1, color: '#757575' }} />
                              Amount
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {supporters.length > 0 ? (
                          supporters.map((row) => (
                            <TableRow
                              key={row.email}
                              sx={{ 
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                                transition: 'background-color 0.2s'
                              }}
                            >
                              <TableCell component="th" scope="row">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar 
                                    sx={{ 
                                      width: 32, 
                                      height: 32, 
                                      mr: 1,
                                      bgcolor: 'primary.main'
                                    }}
                                  >
                                    {row.firstName?.charAt(0) || 'U'}
                                  </Avatar>
                                  {row.firstName + " " + row.lastName}
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title={row.email}>
                                  <Typography
                                    sx={{
                                      maxWidth: 150,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'inline-block',
                                    }}
                                  >
                                    {row.email}
                                  </Typography>
                                </Tooltip>
                              </TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`₹${row.amount || 0}`} 
                                  color="primary" 
                                  variant="outlined"
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                              <Typography color="text.secondary">
                                No monthly supporters yet
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
              
              {/* Project Funding Table */}
              <Grid item xs={12} md={7}>
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
                              <LocalAtmIcon fontSize="small" sx={{ mr: 1, color: '#757575' }} />
                              Amount
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {projects.length > 0 ? (
                          projects.flatMap((project) =>
                            project.audience.map((supporter, idx) => (
                              <TableRow
                                key={`${project._id}_${supporter.email}_${idx}`}
                                sx={{ 
                                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                <TableCell>
                                  <Chip
                                    label={new Date(supporter.timestamp).toLocaleDateString()}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: 'primary.dark' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={project.title}>
                                    <Typography
                                      sx={{
                                        fontWeight: 'medium',
                                        maxWidth: 150,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {project.title}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar 
                                      sx={{ 
                                        width: 28, 
                                        height: 28, 
                                        mr: 1,
                                        bgcolor: 'success.main',
                                        fontSize: '0.875rem'
                                      }}
                                    >
                                      {supporter.firstName?.charAt(0) || 'U'}
                                    </Avatar>
                                    <Tooltip title={`${supporter.firstName} ${supporter.lastName}`}>
                                      <Typography
                                        sx={{
                                          maxWidth: 100,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {supporter.firstName} {supporter.lastName}
                                      </Typography>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Chip 
                                    label={`₹${supporter.amount || 0}`} 
                                    color="success" 
                                    variant="outlined"
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))
                          )
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
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
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Container>
  );
}
