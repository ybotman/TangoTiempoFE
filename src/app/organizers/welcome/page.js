// /organizers/welcome — Regional Organizer welcome / reference page (TIEMPO-454).
// Built per Option B of MasterCalendar/docs/DECIDE-ORGANIZER-WELCOME-FLOW.md
// (LOCKED 2026-05-05). Supersedes the orphaned YourStatusTab.showWelcome card.
//
// v1 content: welcome message + collapsible Rules of Engagement guidelines
// (sourced from src/app/data/organizerGuidelines.js — same content the apply-
// time terms modal renders). Placeholder structure for future videos / images
// / tips that Toby will add later.
//
// Auto-redirect on first isEnabled transition is wired by
// <OrganizerWelcomeRedirect /> in src/app/components/UI/OrganizerWelcomeRedirect.js
// (mounted from Providers).

'use client';

import React, { useContext, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { AuthContext } from '@/contexts/AuthContext';
import { ROE_SECTIONS } from '@/data/organizerGuidelines';

// Sentinel for the one-time auto-redirect. Repurposes the existing
// `organizerWelcomeShown` key from the now-killed YourStatusTab.showWelcome
// flow so an upgrade doesn't re-fire for users who already saw the old card.
export const ORGANIZER_WELCOME_SHOWN_KEY = 'organizerWelcomeShown';

const OrganizerWelcomePage = () => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  // Mark the welcome as seen on render so the auto-redirect doesn't fire again
  // this session. Backend-tracked dismissal is gold-plating per locked spec — defer.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(ORGANIZER_WELCOME_SHOWN_KEY, 'true');
      } catch {
        // sessionStorage can throw in private-mode / quota-exceeded — non-fatal
      }
    }
  }, []);

  // Anonymous gate — sign in first.
  if (!loading && !user) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="info">
          <Typography variant="body1">
            Please sign in to view the Organizer Welcome content.
          </Typography>
          <Button onClick={() => router.push('/')} sx={{ mt: 2 }} variant="outlined">
            Back to Home
          </Button>
        </Alert>
      </Container>
    );
  }

  const isApproved = Boolean(user?.backendInfo?.regionalOrganizerInfo?.isApproved);
  const isEnabled = Boolean(user?.backendInfo?.regionalOrganizerInfo?.isEnabled);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Hero / celebration block */}
      <Card
        elevation={3}
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          mb: 4,
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: { xs: 3, md: 5 } }}>
          <CelebrationIcon sx={{ fontSize: { xs: 56, md: 80 }, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Welcome, Regional Organizer!
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, opacity: 0.95 }}>
            You&apos;re part of the team that keeps Argentine Tango thriving across the calendar.
          </Typography>
          <Button
            component={Link}
            href="/calendar"
            variant="contained"
            startIcon={<CalendarMonthIcon />}
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Go to Calendar
          </Button>
        </CardContent>
      </Card>

      {/* Status callouts */}
      {isApproved && !isEnabled && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Your profile is approved but not yet enabled.
          </Typography>
          <Typography variant="body2">
            Open the menu (☰) → switch role to <strong>Organizer/Artist</strong> →
            open <strong>Event Organizer Settings</strong> → complete the Status
            tab to activate event creation.
          </Typography>
        </Alert>
      )}

      {/* Welcome / orientation */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
          Getting Started
        </Typography>
        <Typography variant="body1" paragraph>
          This is your home base for orientation and reference. We&apos;ll add
          videos, walkthroughs, and tips here over time — for now, the most
          important reading is the community guidelines below. They cover
          what to post, how AI monitoring works, and what your role permits.
        </Typography>
        <Typography variant="body1" paragraph>
          You can revisit this page any time from the menu (☰) →
          <strong> Organizer Welcome</strong>.
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Community guidelines — collapsible, lifted from ROTermsModal source */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
          Community Guidelines (Rules of Engagement)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The standards every organizer agreed to at signup. Refresh whenever
          you need.
        </Typography>
        {ROE_SECTIONS.map((section) => (
          <Accordion key={section.id} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="medium">{section.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body2"
                sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}
              >
                {section.content}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Placeholder for future content (videos / images / tips) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
          Videos &amp; Tips
        </Typography>
        <Alert severity="info">
          <Typography variant="body2">
            Walkthrough videos, common-question tips, and organizer
            spotlight content are coming soon. Check back here as the system
            evolves.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default OrganizerWelcomePage;
