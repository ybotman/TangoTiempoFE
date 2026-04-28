'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Typography, Chip, Card, CardContent,
  Accordion, AccordionSummary, AccordionDetails, Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BugReportIcon from '@mui/icons-material/BugReport';

const StatusRow = ({ label, value }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ py: 0.75 }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Chip
      size="small"
      icon={value ? <CheckCircleIcon /> : <CancelIcon />}
      label={value ? 'Yes' : 'No'}
      color={value ? 'success' : 'default'}
      variant="outlined"
    />
  </Box>
);
StatusRow.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.bool };

const DebugRow = ({ label, value }) => (
  <Box sx={{ py: 0.5 }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography
      variant="body2"
      sx={{ fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.75rem' }}
    >
      {value || '—'}
    </Typography>
  </Box>
);
DebugRow.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string };

const OrganizerStatusTab = ({ organizer, user }) => {
  const [debugOpen, setDebugOpen] = useState(false);

  const roInfo = user?.backendInfo?.regionalOrganizerInfo || {};
  const approvalDate = roInfo.ApprovalDate
    ? new Date(roInfo.ApprovalDate).toLocaleDateString()
    : null;
  const updatedAt = organizer?.updatedAt
    ? new Date(organizer.updatedAt).toLocaleDateString()
    : null;

  return (
    <Box sx={{ mt: 1 }}>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            Account Status
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <StatusRow label="Application Approved"  value={roInfo.isApproved} />
          <StatusRow label="Profile Active"         value={organizer?.isEnabled} />
          <StatusRow label="Profile Visible"        value={organizer?.isVisible} />
          <StatusRow label="Search Engine Visible"  value={organizer?.wantRender} />
          {approvalDate && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Approved: {approvalDate}
              </Typography>
            </Box>
          )}
          {updatedAt && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Last updated: {updatedAt}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Debug IDs — collapsed by default */}
      <Accordion
        expanded={debugOpen}
        onChange={() => setDebugOpen((v) => !v)}
        variant="outlined"
        sx={{ '&:before': { display: 'none' } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <BugReportIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">Debug Info</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <DebugRow label="Organizer ID"   value={organizer?._id} />
          <DebugRow label="User ID"        value={user?.backendInfo?._id} />
          <DebugRow label="Firebase UID"   value={user?.uid} />
        </AccordionDetails>
      </Accordion>

    </Box>
  );
};

OrganizerStatusTab.propTypes = {
  organizer: PropTypes.object,
  user: PropTypes.object,
};

export default OrganizerStatusTab;
