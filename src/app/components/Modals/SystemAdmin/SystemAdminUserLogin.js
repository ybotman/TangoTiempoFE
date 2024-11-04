// @/components/Modals/SystemAdmin/SystemAdminUserLogin.js
"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Button, CircularProgress, Grid } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_BE_URL;

export default function SystemAdminUserLogin() {
  const [userLogins, setUserLogins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLogins = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/userlogins/all`);
        setUserLogins(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user logins:", error);
      }
    };
    fetchUserLogins();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>User Logins</Typography>
      {Array.isArray(userLogins) && userLogins.length > 0 ? (
        userLogins.map((user) => (
          <Accordion key={user.firebaseUserId}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {`${user.localUserInfo.firstName} ${user.localUserInfo.lastName} (${user.localUserInfo.loginUserName})`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">First Name:</Typography>
                  <Typography>{user.localUserInfo.firstName}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">Last Name:</Typography>
                  <Typography>{user.localUserInfo.lastName}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="textSecondary">Username:</Typography>
                  <Typography>{user.localUserInfo.loginUserName}</Typography>
                </Grid>
              </Grid>

              <Accordion sx={{ mt: 2 }} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2" color="textSecondary">Roles</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {user.roleIds.map((role, index) => (
                      <Typography key={index} variant="body2" sx={{ marginBottom: 1 }}>
                        {role.roleName}
                      </Typography>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Typography variant="body2" sx={{ mt: 2 }}>Organizer: {user.regionalOrganizerInfo?.organizerId?.name || "N/A"}</Typography>
              <Typography variant="body2">Enabled: {user.localUserInfo.isEnabled ? "Yes" : "No"}</Typography>

              <Button variant="outlined" sx={{ mt: 2 }} disabled>Edit</Button>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>No user data available</Typography>
      )}
    </Box>
  );
}