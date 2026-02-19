// src/app/releases/page.js

'use client';
import React from 'react';
import { 
  Container, 
  Typography, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip, 
  Box,
  Stack,
  Alert,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UpdateIcon from '@mui/icons-material/Update';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import BugReportIcon from '@mui/icons-material/BugReport';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Get relative time string
function getRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// Get icon based on release type or content
function getReleaseIcon(release) {
  if (release.type.toLowerCase().includes('fix') || 
      release.description.toLowerCase().includes('fix') ||
      release.relatedItems.some(item => item.description.toLowerCase().includes('fix'))) {
    return <BugReportIcon sx={{ fontSize: '1.2rem' }} />;
  }
  if (release.description.toLowerCase().includes('new') || 
      release.description.toLowerCase().includes('implement')) {
    return <NewReleasesIcon sx={{ fontSize: '1.2rem' }} />;
  }
  return <UpdateIcon sx={{ fontSize: '1.2rem' }} />;
}

export default function ReleaseNotesPage() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Fetch release data from API route
    const fetchReleases = async () => {
      try {
        const response = await fetch('/api/releases');
        if (!response.ok) {
          throw new Error('Failed to fetch releases');
        }
        const data = await response.json();
        setReleases(data.releases || []);
      } catch (err) {
        console.error('Error fetching releases:', err);
        setError('Unable to load release notes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Typography>Loading release notes...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: isMobile ? 1 : 3 }}>
      {/* AI-Guild and HDTS message */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundColor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* AI-Guild Section */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              component="img"
              src="/AI GUILD Base.jpeg"
              alt="AI Guild"
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                borderRadius: 1,
                objectFit: 'cover'
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                100% AI-Built Application
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95 }}>
                This entire application is built by AI, with no human-written code. The AI-Guild 
                handles all development tasks: coding, merging, GitHub operations, JIRA tracking, 
                dashboarding, error handling, linting, testing, CI/CD, authentication, and promotion. 
                Humans interact through commands and approvals while the Guild performs all technical implementation.
              </Typography>
            </Box>
          </Box>

          {/* HDTS Section */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              component="img"
              src="/HDTS.jpg"
              alt="HDTS LLC"
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                borderRadius: 1,
                objectFit: 'contain',
                backgroundColor: 'white',
                p: 0.5
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                <Box 
                  component="a" 
                  href="https://www.hdtsllc.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    color: 'inherit',
                    textDecoration: 'underline',
                    '&:hover': { textDecoration: 'none' }
                  }}
                >
                  HDTSllc.com
                </Box>
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95 }}>
                Half Way Down the Stairs, LLC provides AI consulting and development services. 
                Specializing in generative AI, React-based AI applications, and document processing systems, 
                HDTS acts as your temporary AI team member for strategic implementation and custom solutions.
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Links */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Box 
            component="a"
            href="https://www.linkedin.com/in/toby-balsley-ea-ai-genai/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.875rem',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            🔗 Toby Balsley on LinkedIn
          </Box>
          <Box 
            component="a"
            href="https://www.hdtsllc.com/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.875rem',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            🌐 Visit HDTSllc.com
          </Box>
        </Box>
      </Paper>

      {/* Mobile-friendly header with back button */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Link href="/calendar" passHref>
          <IconButton size="small">
            <ArrowBackIcon />
          </IconButton>
        </Link>
        <Box sx={{ flexGrow: 1, textAlign: isMobile ? 'left' : 'center' }}>
          <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" gutterBottom>
            Release Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Latest updates and improvements
          </Typography>
        </Box>
      </Box>

      <Stack spacing={1}>
        {releases.map((release, index) => (
          <Accordion 
            key={release.filename}
            sx={{ 
              backgroundColor: index % 2 === 0 ? 'background.paper' : 'grey.50',
              '&:before': { display: 'none' }, // Remove default divider
              boxShadow: 1
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                '& .MuiAccordionSummary-content': { 
                  my: 1,
                  alignItems: 'center',
                  gap: 1
                } 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {getReleaseIcon(release)}
                <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
                  {release.title || `Release ${release.date}`}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {release.date && getRelativeTime(release.date)}
                  </Typography>
                  <Chip 
                    icon={<CalendarTodayIcon sx={{ fontSize: '0.9rem' }} />}
                    label={release.date || 'Unknown'}
                    size="small"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              {/* Branch info */}
              {release.sourceTarget && (
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  {release.sourceTarget}
                </Typography>
              )}

              {/* Related JIRA items */}
              {release.relatedItems.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {release.relatedItems.map((item, idx) => (
                      item.ticket ? (
                        <Chip
                          key={idx}
                          label={item.ticket}
                          size="small"
                          color="primary"
                          variant="outlined"
                          clickable
                          component="a"
                          href={`https://hdtsllc.atlassian.net/browse/${item.ticket}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ fontSize: '0.7rem', height: 24 }}
                        />
                      ) : null
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Description */}
              {release.description && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                    {release.description}
                  </Typography>
                </Paper>
              )}

              {/* User Benefits */}
              {release.userBenefits.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>User Benefits</Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {release.userBenefits.map((benefit, idx) => (
                      <li key={idx}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{benefit}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              {/* Technical Details */}
              {release.technicalEnhancements.length > 0 && (
                <Accordion sx={{ boxShadow: 0, backgroundColor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
                    <Typography variant="subtitle2">Technical Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0 }}>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {release.technicalEnhancements.map((enhancement, idx) => (
                        <li key={idx}>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{enhancement}</Typography>
                        </li>
                      ))}
                    </ul>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Impacted Areas */}
              {release.impactedAreas.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Impacted Areas</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {release.impactedAreas.map((area, idx) => (
                      <Chip
                        key={idx}
                        label={area}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      {releases.length === 0 && (
        <Alert severity="info">
          No release notes found. Check back later for updates!
        </Alert>
      )}
    </Container>
  );
}