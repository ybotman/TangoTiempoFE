// @/components/Modals/SystemAdmin/SystemAdminUserLogin.js
"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Button, CircularProgress } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

const apiBaseUrl = process.env.NEXT_PUBLIC_BE_URL;

export default function SystemAdminUserLogin() {
  const [userLogins, setUserLogins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLogins = async () => {
      try {
        console.log("--> Fetching user logins");
        const response = await axios.get(`${apiBaseUrl}/api/userlogins/all`);
        console.log("--> Response:", response);
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
              <Typography>{`${user.localUserInfo.firstName} ${user.localUserInfo.lastName} (${user.localUserInfo.loginUserName})`}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Firebase ID: {user.firebaseUserId}</Typography>
              <Typography>Roles: {user.roleIds.map((role) => role.roleName).join(", ")}</Typography>
              <Typography>Organizer: {user.regionalOrganizerInfo?.organizerId?.name || "N/A"}</Typography>
              <Typography>Enabled: {user.localUserInfo.isEnabled ? "Yes" : "No"}</Typography>
              <Button variant="outlined" disabled>Edit</Button>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>No user data available</Typography>
      )}
    </Box>
  );
}