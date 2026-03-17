/**
 * CreateEventDetailsOverrideImages.js
 * TIEMPO-362: Tab for managing override images for specific dates in a repeating event
 *
 * Shows list of upcoming occurrences with ability to upload a different image for each date.
 * Only available when isRepeating=true.
 */

import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { format, addMonths, startOfDay } from 'date-fns';
import { RRule } from 'rrule';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

const CreateEventDetailsOverrideImages = ({ eventData, setEventData }) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Parse RRULE and generate upcoming occurrences
  const upcomingDates = useMemo(() => {
    if (!eventData.recurrenceRule || !eventData.startDate) return [];

    try {
      const dtstart = eventData.startDate.toDate
        ? eventData.startDate.toDate()
        : new Date(eventData.startDate);

      // Build RRULE string from eventData
      let rruleStr = eventData.recurrenceRule;
      if (!rruleStr.includes('DTSTART')) {
        rruleStr = `DTSTART:${format(dtstart, "yyyyMMdd'T'HHmmss")}\nRRULE:${rruleStr}`;
      }

      const rule = RRule.fromString(rruleStr);
      const now = new Date();
      const endRange = addMonths(now, 6);

      return rule.between(startOfDay(now), endRange, true).slice(0, 20);
    } catch (error) {
      console.warn('Failed to parse RRULE for override images:', error);
      return [];
    }
  }, [eventData.recurrenceRule, eventData.startDate]);

  // Get existing override images from eventData
  const overrideImages = eventData.instanceOverrideImages || {};

  // Image drop handler
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setPreviewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const handleOpenUploadDialog = (date) => {
    setSelectedDate(date);
    const dateKey = format(date, 'yyyy-MM-dd');
    const existing = overrideImages[dateKey];
    if (existing) {
      setPreviewUrl(existing.url || null);
      setPreviewFile(existing.file || null);
    } else {
      setPreviewUrl(null);
      setPreviewFile(null);
    }
    setUploadDialogOpen(true);
  };

  const handleSaveImage = () => {
    if (!selectedDate) return;

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const newOverrideImages = { ...overrideImages };

    if (previewFile || previewUrl) {
      newOverrideImages[dateKey] = {
        file: previewFile,
        url: previewUrl,
        dateKey
      };
    } else {
      delete newOverrideImages[dateKey];
    }

    setEventData({
      ...eventData,
      instanceOverrideImages: newOverrideImages
    });

    setUploadDialogOpen(false);
    setSelectedDate(null);
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const handleRemoveImage = (dateKey) => {
    const newOverrideImages = { ...overrideImages };
    delete newOverrideImages[dateKey];
    setEventData({
      ...eventData,
      instanceOverrideImages: newOverrideImages
    });
  };

  const handleClearPreview = () => {
    if (previewUrl && previewFile) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  if (upcomingDates.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No upcoming dates found. Make sure you have set up the repeating schedule.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Override Images by Date
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload different images for specific dates. If no override is set, the main event image will be used.
      </Typography>

      <List dense>
        {upcomingDates.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const hasOverride = !!overrideImages[dateKey];

          return (
            <ListItem
              key={dateKey}
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {hasOverride && (
                    <IconButton
                      edge="end"
                      size="small"
                      color="error"
                      onClick={() => handleRemoveImage(dateKey)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Button
                    size="small"
                    variant={hasOverride ? 'outlined' : 'text'}
                    startIcon={hasOverride ? <ImageIcon /> : <AddPhotoAlternateIcon />}
                    onClick={() => handleOpenUploadDialog(date)}
                  >
                    {hasOverride ? 'Change' : 'Add'}
                  </Button>
                </Box>
              }
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                py: 1
              }}
            >
              <ListItemText
                primary={format(date, 'EEE, MMM d, yyyy')}
                secondary={
                  hasOverride ? (
                    <Chip
                      label="Custom Image"
                      size="small"
                      color="success"
                      icon={<ImageIcon />}
                      sx={{ mt: 0.5 }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Using default image
                    </Typography>
                  )
                }
              />
            </ListItem>
          );
        })}
      </List>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Showing next {upcomingDates.length} occurrences
      </Typography>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Override Image for {selectedDate ? format(selectedDate, 'EEEE, MMM d, yyyy') : ''}
        </DialogTitle>
        <DialogContent>
          {previewUrl ? (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '200px',
                  mb: 2,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Image
                  src={previewUrl}
                  alt="Override preview"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Button variant="outlined" color="error" onClick={handleClearPreview} size="small">
                Remove
              </Button>
            </Box>
          ) : (
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.400',
                borderRadius: 1,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'primary.50' : 'grey.50',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' }
              }}
            >
              <input {...getInputProps()} />
              <AddPhotoAlternateIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {isDragActive ? 'Drop image here...' : 'Drag & drop or click to select'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Max 5MB (JPEG, PNG, GIF, WebP)
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveImage} variant="contained">
            {previewUrl ? 'Save Image' : 'Use Default'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

CreateEventDetailsOverrideImages.propTypes = {
  eventData: PropTypes.shape({
    recurrenceRule: PropTypes.string,
    startDate: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    instanceOverrideImages: PropTypes.object
  }).isRequired,
  setEventData: PropTypes.func.isRequired
};

export default CreateEventDetailsOverrideImages;
