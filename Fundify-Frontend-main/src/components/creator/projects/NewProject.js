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
import Paper from "@mui/material/Paper"; // For wrapping the form and adding border

export default function NewProject({ handleViewProjects }) {
  const [category, setCategory] = React.useState(""); // State to store selected category

  const handleCategoryChange = (event) => {
    setCategory(event.target.value); // Update category based on selection
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const pageName = localStorage.getItem("pageName");
    const email = localStorage.getItem("email");
    const projectName = data.get("title");

    const projectData = {
      email: email,
      pageName: pageName,
      title: projectName,
      description: data.get("description"),
      amount: data.get("amount"),
      category: category, // Add category here
      imageUrl: "",
      n1: "",
    };

    // Check if an image URL is provided
    const imageUrl = data.get("imageUrl");
    if (imageUrl) {
      projectData.projectURL = imageUrl;
      projectData.imageUrl = imageUrl;
    } else {
      // If no image URL, process image file upload
      
      return; // exit the function early if we are uploading an image file
    }

    // If an image URL is provided, create project without file upload
    axios
      .post(SERVER_URL + "/api/campaigns", projectData)
      .then((response) => {
        handleViewProjects(projectName, email);
      });
  };

  return (
    <Container component="main">
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh", // To center the form vertically
        }}
      >
        <Paper
          sx={{
            padding: 3,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: 600,
            backgroundColor: "#fafafa",
            border: "1px solid #ddd", // Light border
          }}
        >
          <Typography variant="h5" align="center" sx={{ marginBottom: 3 }}>
            New Project
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="title"
                  label="Title"
                  name="title"
                  autoComplete="title"
                  sx={{ borderRadius: "8px", backgroundColor: "#fff" }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="description"
                  label="Description"
                  type="text"
                  id="description"
                  autoComplete="description"
                  sx={{ borderRadius: "8px", backgroundColor: "#fff" }}
                />
              </Grid>
              <Grid item xs={12} style={{ marginBottom: ".25rem" }}>
                <label htmlFor="projectImage">Project image:&ensp;</label>
                <input
                  type="file"
                  id="projectImage"
                  name="projectImage"
                  accept=".jpg"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="imageUrl"
                  label="Image URL (optional)"
                  type="url"
                  id="imageUrl"
                  autoComplete="imageUrl"
                  sx={{ borderRadius: "8px", backgroundColor: "#fff" }}
                />
              </Grid>

              {/* Category Selector */}
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ borderRadius: "8px" }}>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    value={category}
                    label="Category"
                    onChange={handleCategoryChange}
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <MenuItem value="Education">Education</MenuItem>
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Donation">Donation</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="amount"
                  label="Funds required (₹)"
                  type="number"
                  id="amount"
                  autoComplete="amount"
                  sx={{ borderRadius: "8px", backgroundColor: "#fff" }}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: "#1976d2",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              CREATE
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}


// // import * as React from "react";
// // import axios from "axios";
// // import Avatar from "@mui/material/Avatar";
// // import Button from "@mui/material/Button";
// // import CssBaseline from "@mui/material/CssBaseline";
// // import TextField from "@mui/material/TextField";
// // import FormControlLabel from "@mui/material/FormControlLabel";
// // import Checkbox from "@mui/material/Checkbox";
// // import Link from "@mui/material/Link";
// // import Grid from "@mui/material/Grid";
// // import Box from "@mui/material/Box";
// // import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// // import Typography from "@mui/material/Typography";
// // import Container from "@mui/material/Container";
// // import { createTheme, ThemeProvider } from "@mui/material/styles";
// // import CloseIcon from "@mui/icons-material/Close";
// // import IconButton from "@mui/material/IconButton";
// // import { useHistory } from "react-router-dom";
// // import { SERVER_URL } from "../../../constant/serverUrl";
// // import TextareaAutosize from "@mui/material/TextareaAutosize";

// // export default function LoginAudience({ handleViewProjects }) {
// //   const handleSubmit = (event) => {
// //     event.preventDefault();
// //     const data = new FormData(event.currentTarget);
// //     // eslint-disable-next-line no-console

// //     const pageName = localStorage.getItem("pageName");
// //     const email = localStorage.getItem("email");
// //     const projectName = data.get("title");

// //     axios
// //       .post(SERVER_URL + "/projects/new", {
// //         email: email,
// //         pageName: pageName,
// //         title: projectName,
// //         description: data.get("description"),
// //         amount: data.get("amount"),
// //       })
// //       .then((response) => {
// //         let formData = new FormData();
// //         let imageFile = document.querySelector("#projectImage");
// //         formData.append("projectImage", imageFile.files[0]);

// //         axios
// //           .post(SERVER_URL + "/projects/upload/" + pageName, formData, {
// //             params: { projectName: projectName },
// //           })
// //           .then((response) => {
// //             handleViewProjects(projectName, email);
// //           });
// //       });
// //   };

// //   return (
// //     <Container component="main">
// //       <CssBaseline />
// //       <Box
// //         sx={{
// //           marginTop: 0,
// //           display: "flex",
// //           flexDirection: "column",
// //           alignItems: "center",
// //         }}
// //       >
// //         <Typography variant="h5">New Project</Typography>
// //         <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
// //           <Grid container spacing={2}>
// //             <Grid item xs={12}>
// //               <TextField
// //                 required
// //                 fullWidth
// //                 id="title"
// //                 label="Title"
// //                 name="title"
// //                 autoComplete="title"
// //               />
// //             </Grid>
// //             <Grid item xs={12}>
// //               <TextField
// //                 required
// //                 fullWidth
// //                 name="description"
// //                 label="Description"
// //                 type="text"
// //                 id="description"
// //                 autoComplete="description"
// //               />
// //             </Grid>
// //             <Grid item xs={12} style={{ marginBottom: ".25rem" }}>
// //               <label for="projectImage">Project image:&ensp;</label>
// //               <input
// //                 type="file"
// //                 id="projectImage"
// //                 name="projectImage"
// //                 accept=".jpg"
// //               />
// //             </Grid>
// //             <Grid item xs={12}>
// //               <TextField
// //                 required
// //                 fullWidth
// //                 name="amount"
// //                 label="Funds required (₹)"
// //                 type="number"
// //                 id="amount"
// //                 autoComplete="amount"
// //               />
// //             </Grid>
// //           </Grid>
// //           <Button
// //             type="submit"
// //             fullWidth
// //             variant="contained"
// //             sx={{ mt: 3, mb: 2, backgroundColor: "#212121" }}
// //           >
// //             CREATE
// //           </Button>
// //         </Box>
// //       </Box>
// //     </Container>
// //   );
// // }
// import * as React from "react";
// import axios from "axios";
// import Avatar from "@mui/material/Avatar";
// import Button from "@mui/material/Button";
// import CssBaseline from "@mui/material/CssBaseline";
// import TextField from "@mui/material/TextField";
// import Grid from "@mui/material/Grid";
// import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
// import Container from "@mui/material/Container";
// import { SERVER_URL } from "../../../constant/serverUrl";

// export default function LoginAudience({ handleViewProjects }) {
//   const handleSubmit = (event) => {
//     event.preventDefault();
//     const data = new FormData(event.currentTarget);

//     const pageName = localStorage.getItem("pageName");
//     const email = localStorage.getItem("email");
//     const projectName = data.get("title");

//     const projectData = {
//       email: email,
//       pageName: pageName,
//       title: projectName,
//       description: data.get("description"),
//       amount: data.get("amount"),
//       imageUrl:"",
//       n1:""
//     };
//    // projectData.amount = 5;
//     // Check if an image URL is provided
//     const imageUrl = data.get("imageUrl");
//   console.log(imageUrl)
//     // If image URL is provided, add it to project data
//     projectData.projectURL = imageUrl;
//     if (imageUrl) {
//       projectData.imageUrl = ""+imageUrl;
//       console.log(imageUrl)
//     } else {
//       // If no image URL, process image file upload
//       const formData = new FormData();
//       const imageFile = document.querySelector("#projectImage");
//       formData.append("projectImage", imageFile.files[0]);

//       // Post project data to create the project
//       axios
//         .post(SERVER_URL + "/projects/new", projectData)
//         .then((response) => {
//           // Upload the image file after creating project
//           axios
//             .post(SERVER_URL + "/projects/upload/" + pageName, formData, {
//               params: { projectName: projectName },
//             })
//             .then((response) => {
//               handleViewProjects(projectName, email);
//             });
//         });
//       return; // exit the function early if we are uploading an image file
//     }

//     // If an image URL is provided, create project without file upload
//     axios
//       .post(SERVER_URL + "/projects/new", projectData)
//       .then((response) => {
//         handleViewProjects(projectName, email);
//       });
//   };

//   return (
//     <Container component="main">
//       <CssBaseline />
//       <Box
//         sx={{
//           marginTop: 0,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//       >
//         <Typography variant="h5">New Project</Typography>
//         <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
//           <Grid container spacing={2}>
//             <Grid item xs={12}>
//               <TextField
//                 required
//                 fullWidth
//                 id="title"
//                 label="Title"
//                 name="title"
//                 autoComplete="title"
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 required
//                 fullWidth
//                 name="description"
//                 label="Description"
//                 type="text"
//                 id="description"
//                 autoComplete="description"
//               />
//             </Grid>
//             <Grid item xs={12} style={{ marginBottom: ".25rem" }}>
//               <label for="projectImage">Project image:&ensp;</label>
//               <input
//                 type="file"
//                 id="projectImage"
//                 name="projectImage"
//                 accept=".jpg"
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 name="imageUrl"
//                 label="Image URL (optional)"
//                 type="url"
//                 id="imageUrl"
//                 autoComplete="imageUrl"
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 required
//                 fullWidth
//                 name="amount"
//                 label="Funds required (₹)"
//                 type="number"
//                 id="amount"
//                 autoComplete="amount"
//               />
//             </Grid>
//           </Grid>
//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{ mt: 3, mb: 2, backgroundColor: "#212121" }}
//           >
//             CREATE
//           </Button>
//         </Box>
//       </Box>
//     </Container>
//   );
// }
