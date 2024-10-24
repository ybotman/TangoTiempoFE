import PropTypes from 'prop-types';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SiteMenuBarRegionDrawer = ({
  regionDrawerOpen,
  setRegionDrawerOpen,
  regions,
  selectionLevel,
  setSelectionLevel,
  localSelectedRegion,
  setLocalSelectedRegion,
  localSelectedDivision,
  setLocalSelectedDivision,
  setSelectedRegion,
  setSelectedAbbreviation,
}) => {
  return (
    <Drawer
      anchor="top"
      open={regionDrawerOpen}
      onClose={() => {
        setRegionDrawerOpen(false);
        setSelectionLevel(1);
        setLocalSelectedRegion(null);
        setLocalSelectedDivision(null);
      }}
    >
      <Box sx={{ width: '100%', padding: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {selectionLevel > 1 && (
            <IconButton
              onClick={() => {
                if (selectionLevel === 2) {
                  setSelectionLevel(1);
                  setLocalSelectedRegion(null);
                } else if (selectionLevel === 3) {
                  setSelectionLevel(2);
                  setLocalSelectedDivision(null);
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            {selectionLevel === 1 && 'Select Region'}
            {selectionLevel === 2 && 'Select Division'}
            {selectionLevel === 3 && 'Select City'}
          </Typography>
        </Box>

        {selectionLevel === 1 && (
          <List>
            {regions.map((region) => (
              <ListItem
                component="button"
                key={region.regionCode}
                onClick={() => {
                  setLocalSelectedRegion(region);
                  setSelectedAbbreviation(region.regionCode);
                  setSelectedRegion(region.regionName);
                  setSelectionLevel(2);
                }}
              >
                <ListItemText primary={region.regionName} />
              </ListItem>
            ))}
          </List>
        )}
        {selectionLevel === 2 && localSelectedRegion && (
          <List>
            {localSelectedRegion.divisions.map((division) => (
              <ListItem
                component="button"
                key={division.divisionCode}
                onClick={() => {
                  setLocalSelectedDivision(division);
                  setSelectedAbbreviation(division.divisionCode);
                  setSelectionLevel(3);
                }}
              >
                <ListItemText primary={division.divisionName} />
              </ListItem>
            ))}
          </List>
        )}
        {selectionLevel === 3 && localSelectedDivision && (
          <List>
            {localSelectedDivision.majorCities.map((city) => (
              <ListItem
                component="button"
                key={city.cityCode}
                onClick={() => {
                  setSelectedAbbreviation(city.cityCode);
                  setSelectionLevel(1);
                  setRegionDrawerOpen(false);
                }}
              >
                <ListItemText primary={city.cityName} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

// Adding prop-types for validation
SiteMenuBarRegionDrawer.propTypes = {
  regionDrawerOpen: PropTypes.bool.isRequired,
  setRegionDrawerOpen: PropTypes.func.isRequired,
  regions: PropTypes.array.isRequired,
  selectionLevel: PropTypes.number.isRequired,
  setSelectionLevel: PropTypes.func.isRequired,
  localSelectedRegion: PropTypes.object,
  setLocalSelectedRegion: PropTypes.func.isRequired,
  localSelectedDivision: PropTypes.object,
  setLocalSelectedDivision: PropTypes.func.isRequired,
  setSelectedRegion: PropTypes.func.isRequired,
  setSelectedAbbreviation: PropTypes.func.isRequired,
};

export default SiteMenuBarRegionDrawer;
