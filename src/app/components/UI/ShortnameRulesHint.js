// ShortnameRulesHint — TIEMPO-456.
// Always-visible bulleted block surfacing the full organizer shortname
// constraint set. Sits under the Short Name field on the apply form so
// users see all rules while typing (helper-text-only would surface 1
// rule at a time on error, hiding the rest).
//
// Rules sourced from BE via the FE mirror at @/utils/shortnameRules
// (TIEMPO-455). If rules change there, update the bullets here too.

'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

const RULES = [
  '3–12 characters total',
  'Must start with 3 letters (A–Z)',
  'Then letters, numbers, or hyphens (e.g. TOBY-DJ)',
  'Cannot end with a hyphen',
  'No consecutive hyphens (no “--”)',
  'Reserved words: CHANGE, TANGO',
  'Case-insensitive (normalized to UPPERCASE)',
];

const ShortnameRulesHint = () => (
  <Box
    component="aside"
    aria-label="Short name rules"
    sx={{
      mt: 0.5,
      pl: 1,
      borderLeft: '2px solid',
      borderColor: 'divider',
    }}
  >
    <Typography
      variant="caption"
      color="text.secondary"
      component="div"
      fontWeight="medium"
    >
      Naming rules
    </Typography>
    <Box
      component="ul"
      sx={{
        m: 0,
        pl: 2.5,
        '& li': {
          fontSize: '0.75rem',
          lineHeight: 1.4,
          color: 'text.secondary',
        },
      }}
    >
      {RULES.map((rule) => (
        <li key={rule}>{rule}</li>
      ))}
    </Box>
  </Box>
);

export default ShortnameRulesHint;
