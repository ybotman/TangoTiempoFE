'use client';

import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import RegionManagement from './RegionManagement';
import LocationManagement from './LocationManagement';
import OrganizerManagement from './OrganizerManagement';
import UserLoginManagement from './UserLoginManagement';

function AdminPage() {
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={activeTab} onChange={handleChange} centered>
        <Tab label="Manage Regions" />
        <Tab label="Manage Organizers" />
        <Tab label="Manage Locations" />
        <Tab label="Manage User Logins" />
      </Tabs>
      <Box sx={{ padding: 2 }}>
        {activeTab === 0 && <RegionManagement />}
        {activeTab === 1 && <OrganizerManagement />}
        {activeTab === 2 && <LocationManagement />}
        {activeTab === 3 && <UserLoginManagement />}
      </Box>
    </Box>
  );
}

export default AdminPage;
