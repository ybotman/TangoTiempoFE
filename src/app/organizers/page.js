'use client';

import { useState, useEffect } from 'react';
import { Typography, List, ListItem, Link } from '@mui/material';

const OrganizerLinks = () => {
  const [organizers, setOrganizers] = useState([]);

  useEffect(() => {
    // Fetch the JSON data from the public folder
    const fetchData = async () => {
      try {
        const response = await fetch('/organizersList.json');
        const data = await response.json();
        setOrganizers(data); // Set the list of organizers
      } catch (error) {
        console.error('Error fetching organizers:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Organizer Links
      </Typography>

      <List>
        {organizers.map((organizer) => (
          <ListItem key={organizer.slug}>
            <Link href={`/organizers/${organizer.slug}`}>{organizer.name}</Link>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default OrganizerLinks;
