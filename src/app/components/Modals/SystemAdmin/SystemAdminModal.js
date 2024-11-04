// @/components/Modals/SystemAdmin/SystemAdminModal.js
"use client";

import PropTypes from "prop-types";
import { useState } from "react";
import { Box, Tabs, Tab, Typography, Modal, Button } from "@mui/material";
import SystemAdminUserLogin from "./SystemAdminUserLogin";
import SystemAdminRegionalOrganizer from "./SystemAdminRegionalOrganizer";
import SystemAdminRegionalAdmin from "./SystemAdminRegionalAdmin";

export default function SystemAdminModal({ open, onClose }) {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ width: 600, margin: "auto", padding: 4, mt: 10, backgroundColor: "white", borderRadius: 1 }}>
        <Typography variant="h4" align="center" gutterBottom>
          SYSTEM ADMINISTRATON
        </Typography>
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="UserLogin" />
          <Tab label="Regional Organizer Info" />
          <Tab label="Regional Admin" />
        </Tabs>

        {selectedTab === 0 && <SystemAdminUserLogin />}
        {selectedTab === 1 && <SystemAdminRegionalOrganizer />}
        {selectedTab === 2 && <SystemAdminRegionalAdmin />}

        <Box textAlign="center" mt={3}>
          <Button variant="outlined" onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
}

// PropTypes validation
SystemAdminModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};