import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';

const ViewEventDetailsBasic = ({ eventDetails }) => {
  const [showMore, setShowMore] = useState(false);
  const [needsShowMore, setNeedsShowMore] = useState(false);
  const descriptionRef = useRef(null);

  // Safely access event details with optional chaining
  const description = eventDetails?.extendedProps?.description || 'No description available';
  const cost = eventDetails?.extendedProps?.cost || 'No cost available';
  const eventTitle = eventDetails?.title || '';

  // Get venue information - using both new venueID and legacy locationID fields for backward compatibility
  const venueName = eventDetails?.extendedProps?.venueName ||
                   eventDetails?.extendedProps?.locationName ||
                   'Venue not specified';

  // Convert line breaks to HTML <br> tags for proper display
  const descriptionWithBreaks = description.replace(/\n/g, '<br>');
  
  // Sanitize the description using DOMPurify
  const sanitizedDescription = DOMPurify.sanitize(descriptionWithBreaks);

  // Function to toggle "Show More"
  const toggleShowMore = () => setShowMore(!showMore);

  // Check if content overflows
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const checkOverflow = () => {
      if (descriptionRef.current) {
        const element = descriptionRef.current;
        // Compare scrollHeight with the actual rendered height
        // Read computed maxHeight if needed for future logic
        
        // If showMore is false and content is clipped
        if (!showMore && element.scrollHeight > element.clientHeight) {
          setNeedsShowMore(true);
        } else if (showMore) {
          // Keep showing the button when expanded
          setNeedsShowMore(true);
        } else {
          setNeedsShowMore(false);
        }
      }
    };
    
    // Check immediately and after a short delay
    checkOverflow();
    const timer = setTimeout(checkOverflow, 100);
    
    return () => clearTimeout(timer);
  }, [sanitizedDescription, showMore, eventDetails]);

  return (
    <Box>
      {/* Event Title (in small letters above description) */}
      {eventTitle && (
        <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 2 }}>
          {eventTitle}
        </Typography>
      )}

      {/* Event Description - no header, just the content */}
      {/* Render sanitized description as HTML with line limitation */}
      <Box sx={{ position: 'relative', mt: 2 }}>
        <div
          ref={descriptionRef}
          style={{
            maxHeight: showMore ? 'none' : '10em',
            overflow: 'hidden',
            lineHeight: '1.5em',
            position: 'relative'
          }}
          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        />
        {/* Gradient fade effect when content is truncated */}
        {!showMore && needsShowMore && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3em',
              background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9), white)',
              pointerEvents: 'none'
            }}
          />
        )}
      </Box>

      {/* Show More / Show Less Button */}
      {needsShowMore && (
        <Button 
          onClick={toggleShowMore} 
          size="small"
          sx={{ mt: 1 }}
        >
          {showMore ? 'Show Less' : 'Show More'}
        </Button>
      )}

      {/* Venue Name */}
      <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
        Venue
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        {venueName}
      </Typography>

      {/* Event Cost */}
      <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
        Cost
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        {cost}
      </Typography>
    </Box>
  );
};
ViewEventDetailsBasic.propTypes = {
  eventDetails: PropTypes.shape({
    title: PropTypes.string,
    extendedProps: PropTypes.shape({
      description: PropTypes.string,
      cost: PropTypes.string,
      venueName: PropTypes.string,
      locationName: PropTypes.string, // Legacy field for backward compatibility
      venueID: PropTypes.string,
      locationID: PropTypes.string, // Legacy field for backward compatibility
    }),
  }),
};

export default ViewEventDetailsBasic;
