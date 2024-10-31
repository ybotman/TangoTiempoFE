// options/page.js
"use client";
import React from "react";
import { Box, Typography, Grid, Switch, FormControlLabel, Paper } from "@mui/material";

const eventTypes = [
  "Festivals",
  "Workshops",
  "DayWorkshops",
  "Milongas",
  "Practices",
  "Classes",
  "Concerts",
];

const eventLevels = [
  { level: "Favorites", label: "Favorites" },
  { level: "DefaultRegion", label: "My Defaulted Region" },
  { level: "ExtRegions", label: "External Regions" },
];

const NotificationOptions = () => {
  const [notifications, setNotifications] = React.useState(
    eventTypes.reduce((acc, type) => {
      acc[type] = {
        Favorites: { new: false, updates: false },
        DefaultRegion: { new: false, updates: false },
        ExtRegions: { new: false, updates: false },
      };
      return acc;
    }, {})
  );

  const handleSwitchChange = (type, level, option) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [level]: {
          ...prev[type][level],
          [option]: !prev[type][level][option],
        },
      },
    }));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Notification Settings
      </Typography>

      <Box mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="h6">Event Type</Typography>
          </Grid>
          {eventLevels.map(({ label }, index) => (
            <Grid item xs={3} key={index}>
              <Typography variant="h6" align="center">
                {label}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {eventTypes.map((type) => (
          <Box key={type} mb={3} component={Paper} elevation={2} p={2}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={3}>
                <Typography variant="h6">{type}</Typography>
              </Grid>
              {eventLevels.map(({ level }) => (
                <Grid item xs={3} key={level}>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications[type][level].new}
                          onChange={() => handleSwitchChange(type, level, "new")}
                          color="primary"
                        />
                      }
                      label="New"
                      labelPlacement="end"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications[type][level].updates}
                          onChange={() => handleSwitchChange(type, level, "updates")}
                          color="secondary"
                        />
                      }
                      label="Updates"
                      labelPlacement="end"
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default NotificationOptions;