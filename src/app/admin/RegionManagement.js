'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Switch, CircularProgress } from '@mui/material';
import axios from 'axios';

function RegionManagement() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegions() {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BE_URL}/api/regions`
        );
        console.log('API Response:', response.data); // Check if it's an array
        setRegions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching regions:', error);
        setLoading(false);
      }
    }

    fetchRegions();
  }, []);

  const handleToggleRegionActive = async (regionId) => {
    try {
      const region = regions.find((region) => region._id === regionId);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/regions/region/${regionId}/active`,
        { active: !region.active }
      );
      setRegions(response.data);
    } catch (error) {
      console.error('Error updating region active flag:', error);
    }
  };

  const handleToggleDivisionActive = async (regionId, divisionId) => {
    try {
      const region = regions.find((region) => region._id === regionId);
      const division = region.divisions.find(
        (division) => division._id === divisionId
      );
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/regions/region/${regionId}/division/${divisionId}/active`,
        { active: !division.active }
      );
      setRegions(response.data);
    } catch (error) {
      console.error('Error updating division active flag:', error);
    }
  };

  const handleToggleCityActive = async (regionId, divisionId, cityId) => {
    try {
      const region = regions.find((region) => region._id === regionId);
      const division = region.divisions.find(
        (division) => division._id === divisionId
      );
      const city = division.majorCities.find((city) => city._id === cityId);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/regions/region/${regionId}/division/${divisionId}/city/${cityId}/active`,
        { active: !city.active }
      );
      setRegions(response.data);
    } catch (error) {
      console.error('Error updating city active flag:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">Manage Regions</Typography>
      {Array.isArray(regions) && regions.length > 0 ? (
        regions.map((region) => (
          <Box key={region._id} sx={{ marginBottom: 4 }}>
            <Typography variant="h6">
              {region.regionName} - Active:
              <Switch
                checked={region.active}
                onChange={() => handleToggleRegionActive(region._id)}
              />
            </Typography>
            {region.divisions.map((division) => (
              <Box key={division._id} sx={{ paddingLeft: 4, marginBottom: 2 }}>
                <Typography variant="subtitle1">
                  Division: {division.divisionName} - Active:
                  <Switch
                    checked={division.active}
                    onChange={() =>
                      handleToggleDivisionActive(region._id, division._id)
                    }
                  />
                </Typography>
                {division.majorCities.map((city) => (
                  <Box key={city._id} sx={{ paddingLeft: 8 }}>
                    <Typography variant="body1">
                      City: {city.cityName} - Active:
                      <Switch
                        checked={city.active}
                        onChange={() =>
                          handleToggleCityActive(
                            region._id,
                            division._id,
                            city._id
                          )
                        }
                      />
                    </Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        ))
      ) : (
        <Typography variant="body1">No regions available.</Typography>
      )}
    </Box>
  );
}
export default RegionManagement;
