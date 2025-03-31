import { Card, Typography, IconButton } from "@mui/material";
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios"; // or any other library to make API calls
import { SERVER_URL } from "../../../constant/serverUrl";
const getRaisedAmount = (audiences) => {
  let raisedAmount = 0;
  audiences.forEach((element) => {
    raisedAmount += parseInt(element.amount);
  });
  return raisedAmount;
};

function ViewProjects({ data, setData }) {
  // Reverse data to show the latest project first
  const [data1,setData1]=useState([...data].reverse())
  data=([...data].reverse())

  // Function to handle the deletion of a project
  const handleDelete = async (index, projectId) => {
   
    try {
      // API call to delete the project from the database
      console.log(""+projectId)
      await axios.delete(SERVER_URL+`/api/campaigns/${projectId}`); // Updated to match the backend route
      console.log("kl1")
      // If successful, update the local state to remove the project from the UI
      const updatedData = [...data];
      updatedData.splice(index, 1);
     setData1(updatedData);
    } catch (error) {
      console.error("Error deleting project:", error);
     // alert("An serror occurred while deleting the project.");
    }
  };

  return (
    <div>
      <Typography variant="h5">View Projects</Typography>
      <Grid container xs={12} sm={8} md={10}  spacing={3} direction="column"> {/* Change to a single column layout */}
        {data.map((element, index) => {
          return (
            <Grid item xs={12} sm={8} md={8} key={index}> {/* Each item takes the full width */}
              <Card style={{ padding: "1rem", backgroundColor: "#e0e0e0", position: "relative" }}>
                {/* Delete Button */}
                <IconButton
                  onClick={() => handleDelete(index, element._id)} // Pass project ID to the delete function
                  style={{
                    position: "absolute",
                    top: 8, // Position from top of the card
                    right: 8, // Position from right of the card
                    backgroundColor: "#FFA500", // Light orange color
                    color: "white",
                    padding: "4px", // Adjust padding to leave space around the icon
                  }}
                >
                  <DeleteIcon />
                </IconButton>

                <Typography variant="h6">Title: {element.title}</Typography>
                <Typography variant="body2" style={{ marginTop: ".25rem" }}>
                  Description: {element.description}
                </Typography>
                <Typography variant="body2" style={{ marginTop: ".25rem", color: "orange" }}>
                  Category: {element.category ? element.category : "Not Specified"}
                </Typography>
                <Typography variant="body2" color="primary" style={{ marginTop: ".5rem" }}>
                  Funds Required: ₹ {element.amount}
                </Typography>
                <Typography variant="body2" style={{ color: "green", marginTop: ".25rem" }}>
                  Funds Collected: ₹ {getRaisedAmount(element.audience)}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}

export default ViewProjects;



// import { Card, Typography } from "@mui/material";
// import React from "react";
// import Paper from "@mui/material/Paper";
// import Grid from "@mui/material/Grid";
// import CardActions from "@mui/material/CardActions";
// import CardContent from "@mui/material/CardContent";
// import CardMedia from "@mui/material/CardMedia";

// const getRaisedAmount = (audiences) => {
//   let raisedAmount = 0;
//   audiences.forEach((element) => {
//     raisedAmount += parseInt(element.amount);
//   });
//   return raisedAmount;
// };

// function ViewProjects({ data }) {
//   data=data.reverse();
//   return (
//     <div>
//       <Typography variant="h5">View Projects</Typography>
//       <Grid container>
//         {data.map((element) => {
//           return (
//             <Grid item xs={7} style={{ marginTop: "1rem" }}>
//               <Card style={{ padding: "1rem", backgroundColor: "#e0e0e0" }}>
//                 <Typography variant="h6">Title: {element.title}</Typography>
//                 <Typography variant="body2" style={{ marginTop: ".25rem" }} s>
//                   Description: {element.description}
//                 </Typography>
//                 <Typography variant="body2" style={{ marginTop: ".25rem",color:"orange" }} s>
//                   Category: {element.category?element.category:"Not Specified"}
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   color="primary"
//                   style={{ marginTop: ".5rem" }}
//                 >
//                   Funds Required: ₹ {element.amount}
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   style={{ color: "green", marginTop: ".25rem" }}
//                 >
//                   Funds Collected: ₹ {getRaisedAmount(element.audience)}
//                 </Typography>
//               </Card>
//             </Grid>
//           );
//         })}
//       </Grid>
//     </div>
//   );
// }

// export default ViewProjects;
