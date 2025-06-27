// src/app/versions/page.js

import React from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UpdateIcon from '@mui/icons-material/Update';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import BugReportIcon from '@mui/icons-material/BugReport';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export const metadata = {
  title: 'Release Notes - Tango Tiempo',
  description: 'View the latest updates and releases for Tango Tiempo',
};

// Parse the markdown content to extract structured data
function parseReleaseMarkdown(content, filename) {
  const lines = content.split('\n');
  const release = {
    filename,
    title: '',
    type: 'Merge',
    sourceTarget: '',
    timestamp: '',
    relatedItems: [],
    description: '',
    status: '',
    impactedAreas: [],
    userBenefits: [],
    technicalEnhancements: [],
    rawContent: content
  };

  // Extract date from filename (e.g., merge-2025-06-26T1903.md)
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    release.date = dateMatch[1];
  }

  let currentSection = '';
  
  lines.forEach((line) => {
    // Title
    if (line.startsWith('# ')) {
      release.title = line.replace('# ', '').trim();
    }
    
    // Type
    if (line.startsWith('**Type:**')) {
      release.type = line.replace('**Type:**', '').trim();
    }
    
    // Source/Target branches
    if (line.startsWith('**Source Branch:**')) {
      release.sourceTarget += line.replace('**Source Branch:**', '').trim() + ' → ';
    }
    if (line.startsWith('**Target Branch:**')) {
      release.sourceTarget += line.replace('**Target Branch:**', '').trim();
    }
    
    // Timestamp
    if (line.startsWith('**Timestamp:**')) {
      release.timestamp = line.replace('**Timestamp:**', '').trim();
    }
    
    // Section headers
    if (line.includes('## 📌 Related Items')) {
      currentSection = 'relatedItems';
    } else if (line.includes('## 📝 Description')) {
      currentSection = 'description';
    } else if (line.includes('## ✅ Status')) {
      currentSection = 'status';
    } else if (line.includes('## 📦 Impacted Areas')) {
      currentSection = 'impactedAreas';
    } else if (line.includes('## User Benefits')) {
      currentSection = 'userBenefits';
    } else if (line.includes('## Technical Enhancements')) {
      currentSection = 'technicalEnhancements';
    } else if (line.startsWith('##')) {
      currentSection = '';
    }
    
    // Content parsing based on current section
    if (currentSection && !line.startsWith('##') && line.trim()) {
      switch (currentSection) {
        case 'relatedItems':
          if (line.startsWith('- ')) {
            const item = line.replace('- ', '').trim();
            // Extract JIRA ticket if present
            const jiraMatch = item.match(/(TIEMPO-\d+)/);
            if (jiraMatch) {
              release.relatedItems.push({
                ticket: jiraMatch[1],
                description: item.replace(jiraMatch[1] + ':', '').trim()
              });
            } else {
              release.relatedItems.push({
                ticket: null,
                description: item
              });
            }
          }
          break;
        case 'description':
          release.description += line + ' ';
          break;
        case 'status':
          release.status += line + '\n';
          break;
        case 'impactedAreas':
        case 'userBenefits':
        case 'technicalEnhancements':
          if (line.startsWith('- ')) {
            release[currentSection].push(line.replace('- ', '').trim());
          }
          break;
      }
    }
  });
  
  // Clean up description
  release.description = release.description.trim();
  
  return release;
}

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
    return <BugReportIcon />;
  }
  if (release.description.toLowerCase().includes('new') || 
      release.description.toLowerCase().includes('implement')) {
    return <NewReleasesIcon />;
  }
  return <UpdateIcon />;
}

export default async function ReleaseNotesPage() {
  let releases = [];
  let error = null;

  try {
    const mergeEventsDir = path.join(process.cwd(), 'public', 'MergeEvents', 'PROD');
    const files = await fs.readdir(mergeEventsDir);
    
    // Filter for markdown files and sort by date (newest first)
    const markdownFiles = files
      .filter(file => file.endsWith('.md'))
      .sort((a, b) => {
        // Extract dates from filenames for sorting
        const dateA = a.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || '';
        const dateB = b.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || '';
        return dateB.localeCompare(dateA);
      });

    // Read and parse each file
    for (const file of markdownFiles) {
      try {
        const filePath = path.join(mergeEventsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const releaseData = parseReleaseMarkdown(content, file);
        releases.push(releaseData);
      } catch (fileError) {
        console.error(`Error reading file ${file}:`, fileError);
      }
    }
  } catch (err) {
    console.error('Error reading merge events directory:', err);
    error = 'Unable to load release notes. Please try again later.';
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Release Notes
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Latest updates and improvements to Tango Tiempo
        </Typography>
      </Box>

      <Stack spacing={3}>
        {releases.map((release) => (
          <Card key={release.filename} elevation={3}>
            <CardContent>
              {/* Header with date and type */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getReleaseIcon(release)}
                  <Typography variant="h6" component="h2">
                    {release.title || `Release ${release.date}`}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip 
                    icon={<CalendarTodayIcon />}
                    label={release.date || 'Unknown date'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" display="block" color="text.secondary">
                    {release.date && getRelativeTime(release.date)}
                  </Typography>
                </Box>
              </Box>

              {/* Branch info */}
              {release.sourceTarget && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {release.sourceTarget}
                </Typography>
              )}

              {/* Related JIRA items */}
              {release.relatedItems.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
                          href={`https://tobybalsley.atlassian.net/browse/${item.ticket}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ) : null
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Description */}
              {release.description && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1">
                    {release.description}
                  </Typography>
                </Paper>
              )}

              {/* User Benefits */}
              {release.userBenefits.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">User Benefits</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {release.userBenefits.map((benefit, idx) => (
                        <li key={idx}>
                          <Typography variant="body2">{benefit}</Typography>
                        </li>
                      ))}
                    </ul>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Technical Details */}
              {release.technicalEnhancements.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Technical Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {release.technicalEnhancements.map((enhancement, idx) => (
                        <li key={idx}>
                          <Typography variant="body2">{enhancement}</Typography>
                        </li>
                      ))}
                    </ul>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Impacted Areas */}
              {release.impactedAreas.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Impacted Areas</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {release.impactedAreas.map((area, idx) => (
                        <Chip
                          key={idx}
                          label={area}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}
            </CardContent>
          </Card>
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