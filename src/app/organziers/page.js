'use client';

import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Typography,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';

const OrganizerLinks = () => {
  const [organizers, setOrganizers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrganizers, setFilteredOrganizers] = useState([]);

  useEffect(() => {
    // Fetch the JSON data
    const fetchData = async () => {
      const response = await fetch('/organizersList.json');
      const data = await response.json();
      setOrganizers(data);
      setFilteredOrganizers(data);
    };

    fetchData();
  }, []);

  const toggleExpandAll = () => {
    const newExpanded = {};
    filteredOrganizers.forEach((region) => {
      newExpanded[region.region] = !expanded[region.region];
      region.divisions?.forEach((division) => {
        newExpanded[division.divisionName] = !expanded[division.divisionName];
        division.cities?.forEach((city) => {
          newExpanded[city.cityName] = !expanded[city.cityName];
        });
      });
    });
    setExpanded(newExpanded);
  };

  const handleAccordionToggle = (key) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [key]: !prevExpanded[key],
    }));
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredOrganizers(organizers);
      return;
    }

    // Filter based on the search term
    const filtered = organizers
      .map((region) => {
        const filteredDivisions = region.divisions
          ?.map((division) => {
            const filteredCities = division.cities
              ?.map((city) => {
                const filteredCityOrganizers = city.organizers?.filter((org) =>
                  org.slug.toLowerCase().includes(term)
                );
                return {
                  ...city,
                  organizers: filteredCityOrganizers,
                };
              })
              .filter((city) => city.organizers.length > 0);

            // Check if the division name matches the search term or if it has matching cities
            if (
              division.divisionName.toLowerCase().includes(term) ||
              filteredCities.length > 0
            ) {
              return {
                ...division,
                cities: filteredCities,
              };
            }
            return null;
          })
          .filter((division) => division !== null);

        // Check if the region name matches the search term or if it has matching divisions
        if (
          region.region.toLowerCase().includes(term) ||
          filteredDivisions.length > 0
        ) {
          return {
            ...region,
            divisions: filteredDivisions,
          };
        }
        return null;
      })
      .filter((region) => region !== null);

    setFilteredOrganizers(filtered);
  };

  return (
    <div>
      <h1>Organizer Links</h1>
      <TextField
        label="Search Organizers"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: '20px' }}
      />
      <Button
        variant="contained"
        onClick={toggleExpandAll}
        style={{ marginBottom: '20px' }}
      >
        {Object.values(expanded).some((isOpen) => isOpen)
          ? 'Collapse All'
          : 'Open All'}
      </Button>
      {filteredOrganizers.map((region) => (
        <Accordion
          key={region.region}
          expanded={!!expanded[region.region]}
          onChange={() => handleAccordionToggle(region.region)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{region.region}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {region.divisions?.map((division) => (
              <Accordion
                key={division.divisionName}
                expanded={!!expanded[division.divisionName]}
                onChange={() => handleAccordionToggle(division.divisionName)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{division.divisionName}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {division.cities?.map((city) => (
                    <Accordion
                      key={city.cityName}
                      expanded={!!expanded[city.cityName]}
                      onChange={() => handleAccordionToggle(city.cityName)}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{city.cityName}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <ul>
                          {city.organizers?.map((organizer) => (
                            <li key={organizer.slug}>
                              <Link href={`/organizers/${organizer.slug}`}>
                                {organizer.slug}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default OrganizerLinks;
