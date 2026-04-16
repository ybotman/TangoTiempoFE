'use client';

import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import SiteMenuBar from '@/components/UI/SiteMenuBar';

// TIEMPO-402: Explore route stub. Timeline + map views ship in Phase 3.
export default function ExplorePage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SiteMenuBar
        activeCategories={[]}
        handleCategoryChange={() => {}}
        categories={[]}
        searchTerm=""
        onSearchChange={() => {}}
        showDiscovered={false}
        onDiscoveredToggle={() => {}}
      />
      <Container maxWidth="md" sx={{ mt: 6, textAlign: 'center' }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Explore
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Travel-worthy events from around the world. Timeline and map views coming soon.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
