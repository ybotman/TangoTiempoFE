import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Link, Divider } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import FacebookIcon from '@mui/icons-material/Facebook';

const ViewAIEventDetailsTab = ({ eventDetails }) => {
  const [imageError, setImageError] = useState(false);

  if (!eventDetails) return null;

  const formatDateRange = (start, end) => {
    // TIEMPO-246: Format dates without timezone conversion
    const formatFullDate = (dateStr) => {
      if (dateStr instanceof Date) dateStr = dateStr.toISOString();
      const [datePart] = (dateStr || '').split('T');
      if (!datePart) return '';
      const [year, month, day] = datePart.split('-');
      const date = new Date(year, month - 1, day);
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
      const weekday = weekdays[date.getDay()];
      return `${weekday}, ${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
    };

    const startStr = formatFullDate(start);
    const endStr = end ? formatFullDate(end) : startStr;

    // Same day event
    if (startStr === endStr) {
      return startStr;
    }

    // Multi-day event
    return `${startStr} - ${endStr}`;
  };

  const ext = eventDetails.extendedProps || {};

  // Build location line: State, Nearest City, Actual City
  const locationParts = [];
  if (ext.masteredDivisionName) locationParts.push(ext.masteredDivisionName);
  if (ext.masteredCityName) locationParts.push(`Nearest: ${ext.masteredCityName}`);
  // venueCityName is the actual city from the venue, fall back to city if available
  const actualCity = ext.venueCityName || ext.city;
  if (actualCity && actualCity !== ext.masteredCityName) {
    locationParts.push(`City: ${actualCity}`);
  }

  // Get venue coordinates for map
  const venueCoords = ext.venueGeolocation?.coordinates;
  const hasValidCoords = venueCoords && venueCoords.length === 2 &&
    typeof venueCoords[0] === 'number' && typeof venueCoords[1] === 'number';

  // Parse hosts (may be array or need parsing)
  let hosts = ext.discoveredHosts || [];
  if (typeof hosts === 'string') {
    try { hosts = JSON.parse(hosts); } catch { hosts = []; }
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* RED AI Disclaimer */}
      <Box sx={{
        backgroundColor: '#ffebee',
        border: '1px solid #f44336',
        borderRadius: 1,
        p: 2,
        mb: ext.isExtrapolated ? 1 : 3
      }}>
        <Typography
          variant="body2"
          sx={{
            color: '#c62828',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          This event was discovered from public information, analyzed, and loaded periodically by AI. Details may be inaccurate.
        </Typography>
      </Box>

      {/* ORANGE Extrapolation Disclaimer - shown for AI-projected recurring events */}
      {ext.isExtrapolated && (
        <Box sx={{
          backgroundColor: '#fff3e0',
          border: '1px solid #ff9800',
          borderRadius: 1,
          p: 2,
          mb: 3
        }}>
          <Typography
            variant="body2"
            sx={{
              color: '#e65100',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            This appears to be a recurring event. This specific date was extrapolated by AI based on the detected pattern. The organizer did not post this instance individually. Date and details may change or be cancelled.
          </Typography>
        </Box>
      )}

      {/* Category */}
      {ext.categoryFirst && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon sx={{ color: '#1976d2', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
              Category
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ ml: 3.5 }}>
            {ext.categoryFirst}
            {ext.categorySecond && ` / ${ext.categorySecond}`}
          </Typography>
        </Box>
      )}

      {/* Location: State, Nearest City, Actual City */}
      {locationParts.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon sx={{ color: '#666', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
              Location
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ ml: 3.5 }}>
            {locationParts.join(' • ')}
          </Typography>
        </Box>
      )}

      {/* Venue Name + Mini Map */}
      {ext.venueName && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ ml: 3.5, fontWeight: 'medium' }}>
            Venue: {ext.venueName}
          </Typography>
          {ext.venueCityName && (
            <Typography variant="body2" sx={{ ml: 3.5, color: '#666' }}>
              {ext.venueCityName}{ext.masteredDivisionName ? `, ${ext.masteredDivisionName}` : ''}
            </Typography>
          )}
          <Typography variant="caption" sx={{ ml: 3.5, color: '#d32f2f', fontStyle: 'italic', display: 'block', mt: 0.5 }}>
            ⚠️ Location researched by AI - verify before visiting
          </Typography>

          {/* Mini Map - Using MapBox Static Images (free tier) */}
          {hasValidCoords && process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
            <Box sx={{ ml: 3.5, mt: 1 }}>
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${venueCoords[1]},${venueCoords[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'block' }}
              >
                <Box
                  component="img"
                  src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+e74c3c(${venueCoords[0]},${venueCoords[1]})/${venueCoords[0]},${venueCoords[1]},12,0/280x150@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
                  alt={`Map of ${ext.venueName}`}
                  sx={{
                    borderRadius: 1,
                    border: '1px solid #ddd',
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </Link>
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
                Click map to open in Google Maps
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Date Range */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventIcon sx={{ color: '#666', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
            Event Date
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ ml: 3.5 }}>
          {formatDateRange(eventDetails.start, eventDetails.end)}
        </Typography>
      </Box>

      {/* Title */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        {eventDetails.title || 'Untitled Event'}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* Event Image - with error handling for broken images */}
      {ext.eventImage && !imageError && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Box
            component="img"
            src={ext.eventImage}
            alt={eventDetails.title || 'Event image'}
            sx={{
              maxWidth: '100%',
              maxHeight: 300,
              borderRadius: 1,
              objectFit: 'contain',
            }}
            onError={() => setImageError(true)}
          />
        </Box>
      )}

      {/* Description */}
      {ext.eventDescription && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666', mb: 1 }}>
            Description
          </Typography>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
            }}
          >
            {ext.eventDescription}
          </Typography>
        </Box>
      )}

      {/* Meet the Hosts Section */}
      {hosts.length > 0 && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PeopleIcon sx={{ color: '#1976d2', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
                Meet the Hosts
              </Typography>
            </Box>
            <Box sx={{ ml: 3.5 }}>
              {hosts.map((host, idx) => (
                <Box key={idx} sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <FacebookIcon sx={{ color: '#1877f2', fontSize: 18, mt: 0.3 }} />
                  <Box>
                    {host.fbUrl ? (
                      <Link
                        href={host.fbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: '#1877f2',
                          textDecoration: 'none',
                          fontWeight: 'medium',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {host.name || 'Host'}
                      </Link>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {host.name || 'Host'}
                      </Typography>
                    )}
                    {host.pageType && (
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                        {host.pageType}
                      </Typography>
                    )}
                    {host.description && (
                      <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
                        {host.description.slice(0, 100)}{host.description.length > 100 ? '...' : ''}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Links Section: Source + Host Links */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Source Link */}
        {ext.sourceLink && (
          <Box>
            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
              For accurate details, check the official source:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinkIcon sx={{ color: '#1976d2', fontSize: 18 }} />
              <Link
                href={ext.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                🔗 Go to Live Event Page
              </Link>
            </Box>
          </Box>
        )}

        {/* Host Links (compact, near source) */}
        {hosts.length > 0 && hosts.filter(h => h.fbUrl).length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <FacebookIcon sx={{ color: '#1877f2', fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: '#666', mr: 0.5 }}>
              Hosts:
            </Typography>
            {hosts.filter(h => h.fbUrl).map((host, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <Typography variant="body2" sx={{ color: '#666' }}>,</Typography>}
                <Link
                  href={host.fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#1877f2',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {host.name || 'Host'}
                </Link>
              </React.Fragment>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

ViewAIEventDetailsTab.propTypes = {
  eventDetails: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    extendedProps: PropTypes.shape({
      eventDescription: PropTypes.string,
      discoveryDate: PropTypes.string,
      sourceLink: PropTypes.string,
      categoryFirst: PropTypes.string,
      categorySecond: PropTypes.string,
      venueName: PropTypes.string,
      venueCityName: PropTypes.string,
      city: PropTypes.string,
      masteredCityName: PropTypes.string,
      masteredDivisionName: PropTypes.string,
      eventImage: PropTypes.string,
      isExtrapolated: PropTypes.bool,
      venueGeolocation: PropTypes.shape({
        coordinates: PropTypes.arrayOf(PropTypes.number),
      }),
      discoveredHosts: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.shape({
          name: PropTypes.string,
          fbUrl: PropTypes.string,
          pageType: PropTypes.string,
          description: PropTypes.string,
        })),
      ]),
    }),
  }),
};

export default ViewAIEventDetailsTab;
