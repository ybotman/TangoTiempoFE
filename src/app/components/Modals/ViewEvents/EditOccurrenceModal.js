/**
 * EditOccurrenceModal.js
 * TIEMPO-362: Modal for editing a single occurrence of a recurring event
 *
 * TABS:
 * - Features: DJ, Orchestra, Instructor, Performer, LIVE, Special Note, Tonight: Canceled
 * - Image: Override image for this specific date
 *
 * NOTE: Exclude (RRULE EXDATE) is handled separately via "Edit Series"
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ImageIcon from '@mui/icons-material/Image';
import { format } from 'date-fns';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

// Available feature types
const FEATURE_OPTIONS = [
  { value: 'dj', label: 'DJ', color: 'primary', maxLength: 19 },
  { value: 'orchestra', label: 'Orchestra', color: 'success', maxLength: 19 },
  { value: 'instructor', label: 'Instructor', color: 'secondary', maxLength: 19 },
  { value: 'performer', label: 'Performer', color: 'info', maxLength: 19 },
  { value: 'live', label: 'LIVE Music', color: 'warning', maxLength: 0 },
  { value: 'note', label: 'Special Note', color: 'default', maxLength: 19 },
  { value: 'description', label: "Tonight's Description", color: 'default', maxLength: 200 },
  { value: 'canceled', label: 'Tonight: Canceled', color: 'error', maxLength: 19 }
];

const EditOccurrenceModal = ({
  open,
  onClose,
  onSave,
  eventTitle,
  occurrenceDate,
  currentValues = {},
  isLoading = false,
  onPrevDate,
  onNextDate,
  hasPrevDate = false,
  hasNextDate = false
}) => {
  // Tab state
  const [currentTab, setCurrentTab] = useState('features');

  // Features array (includes DJ, Orchestra, Instructor, Performer, LIVE, Special Note)
  const [features, setFeatures] = useState([]);

  // For adding new features
  const [newFeatureType, setNewFeatureType] = useState('');
  const [newFeatureName, setNewFeatureName] = useState('');

  // Cancel state (derived from features - no longer in accordion)

  // Image state
  const [overrideImageFile, setOverrideImageFile] = useState(null);
  const [overrideImagePreview, setOverrideImagePreview] = useState(null);
  const [existingOverrideImage, setExistingOverrideImage] = useState(null);

  // Load existing values when modal opens or date changes
  useEffect(() => {
    if (open && occurrenceDate) {
      const patch = currentValues._overridePatch;
      const hasOverride = currentValues._hasOverride;

      if (hasOverride && patch) {
        // Load features from patch
        const loadedFeatures = [];

        // New array format
        if (patch.features && Array.isArray(patch.features)) {
          loadedFeatures.push(...patch.features);
        } else {
          // Legacy individual fields
          if (patch.djName) loadedFeatures.push({ type: 'dj', name: patch.djName });
          if (patch.orchestraName) loadedFeatures.push({ type: 'orchestra', name: patch.orchestraName });
          if (patch.instructorName) loadedFeatures.push({ type: 'instructor', name: patch.instructorName });
          if (patch.performerName) loadedFeatures.push({ type: 'performer', name: patch.performerName });
          if (patch.isLive) loadedFeatures.push({ type: 'live', name: 'LIVE' });
          if (patch.specialNote) loadedFeatures.push({ type: 'note', name: patch.specialNote });
          // Legacy single feature format
          if (patch.featureType && patch.featureName) {
            loadedFeatures.push({ type: patch.featureType, name: patch.featureName });
          }
        }

        // Convert legacy isCanceled to a feature (if not already in features)
        if (patch.isCanceled && !loadedFeatures.some(f => f.type === 'canceled')) {
          loadedFeatures.push({ type: 'canceled', name: patch.cancelReason || '' });
        }

        setFeatures(loadedFeatures);
        setExistingOverrideImage(patch.overrideImage || null);
      } else {
        // Reset to defaults
        setFeatures([]);
        setExistingOverrideImage(null);
      }

      // Always reset these
      setNewFeatureType('');
      setNewFeatureName('');
      setOverrideImageFile(null);
      setOverrideImagePreview(null);
      setCurrentTab('features');
    }
  }, [open, occurrenceDate, currentValues]);

  // Image drop handler
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setOverrideImageFile(file);
      setOverrideImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const handleClearImage = () => {
    if (overrideImagePreview) {
      URL.revokeObjectURL(overrideImagePreview);
    }
    setOverrideImageFile(null);
    setOverrideImagePreview(null);
    setExistingOverrideImage(null);
  };

  const handleAddFeature = () => {
    if (!newFeatureType) return;

    // Get the feature option for max length
    const featureOption = FEATURE_OPTIONS.find(f => f.value === newFeatureType);
    const maxLength = featureOption?.maxLength || 19;

    // 'live' doesn't require a name
    let name = newFeatureType === 'live' ? 'LIVE' : newFeatureName.trim();

    // Enforce max length
    if (maxLength > 0 && name.length > maxLength) {
      name = name.substring(0, maxLength);
    }

    if (!name && newFeatureType !== 'live' && newFeatureType !== 'canceled') {
      alert('Please enter a name for the feature');
      return;
    }

    // Prevent duplicate canceled entries
    if (newFeatureType === 'canceled' && features.some(f => f.type === 'canceled')) {
      alert('This date is already marked as canceled');
      return;
    }

    // Prevent duplicate description entries
    if (newFeatureType === 'description' && features.some(f => f.type === 'description')) {
      alert('Only one description allowed per date');
      return;
    }

    setFeatures([...features, { type: newFeatureType, name }]);
    setNewFeatureType('');
    setNewFeatureName('');
  };

  const handleRemoveFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Auto-add feature if there's content in text field (force "+" on save)
    let featuresToSave = [...features];
    if (newFeatureType && newFeatureName.trim()) {
      const featureOption = FEATURE_OPTIONS.find(f => f.value === newFeatureType);
      const maxLength = featureOption?.maxLength || 19;
      let name = newFeatureName.trim();
      if (maxLength > 0 && name.length > maxLength) {
        name = name.substring(0, maxLength);
      }
      // Add if not a duplicate
      const isDuplicate = (newFeatureType === 'canceled' && featuresToSave.some(f => f.type === 'canceled')) ||
                          (newFeatureType === 'description' && featuresToSave.some(f => f.type === 'description'));
      if (!isDuplicate) {
        featuresToSave.push({ type: newFeatureType, name });
      }
    }

    const patch = {};

    // Check if canceled is in features
    const canceledFeature = featuresToSave.find(f => f.type === 'canceled');
    const isCanceled = !!canceledFeature;

    // Features (exclude 'canceled' from the features array - it's stored separately)
    const nonCanceledFeatures = featuresToSave.filter(f => f.type !== 'canceled');
    if (nonCanceledFeatures.length > 0) {
      patch.features = nonCanceledFeatures;
      // Also extract special notes for backward compatibility
      const notes = nonCanceledFeatures.filter(f => f.type === 'note').map(f => f.name);
      if (notes.length > 0) {
        patch.specialNote = notes.join(' | ');
      }
      // Extract description for easy access
      const description = nonCanceledFeatures.find(f => f.type === 'description');
      if (description) {
        patch.tonightsDescription = description.name;
      }
    }

    // Cancel (derived from canceled feature)
    if (isCanceled) {
      patch.isCanceled = true;
      if (canceledFeature.name?.trim()) {
        patch.cancelReason = canceledFeature.name.trim();
      }
    }

    // Override image
    if (overrideImageFile) {
      // File will be uploaded by parent, pass the file
      patch.overrideImageFile = overrideImageFile;
    } else if (existingOverrideImage) {
      patch.overrideImage = existingOverrideImage;
    } else if (overrideImagePreview === null && existingOverrideImage === null) {
      // Explicitly removed
      patch.overrideImage = null;
    }

    // Determine override type
    const overrideType = isCanceled ? 'cancel' : 'modify';

    // Only save if there are actual changes
    const hasFeatures = nonCanceledFeatures.length > 0;
    const hasImage = overrideImageFile || existingOverrideImage;
    const hasChanges = hasFeatures || isCanceled || hasImage;

    if (!hasChanges) {
      alert('Please add at least one feature, image, or mark as canceled');
      return;
    }

    onSave({
      instanceKey: occurrenceDate,
      overrideType,
      patch
    });
  };

  const handleClose = () => {
    if (overrideImagePreview) {
      URL.revokeObjectURL(overrideImagePreview);
    }
    setFeatures([]);
    setNewFeatureType('');
    setNewFeatureName('');
    setOverrideImageFile(null);
    setOverrideImagePreview(null);
    setExistingOverrideImage(null);
    setCurrentTab('features');
    onClose();
  };

  // Derive isCanceled from features for UI display
  const isCanceled = features.some(f => f.type === 'canceled');
  const hasChanges = features.length > 0 || overrideImageFile || existingOverrideImage;

  const formattedDate = occurrenceDate
    ? format(new Date(occurrenceDate), 'EEEE, MMMM d, yyyy')
    : 'this date';

  const getFeatureOption = (type) => FEATURE_OPTIONS.find(f => f.value === type) || { label: type, color: 'default' };

  const currentImageSrc = overrideImagePreview || existingOverrideImage;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderTop: '4px solid',
          borderColor: isCanceled ? 'error.main' : 'primary.main'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isCanceled ? <CancelIcon color="error" /> : <EditIcon color="primary" />}
        Edit This Date
      </DialogTitle>

      <DialogContent>
        {/* Event context with date navigation */}
        <Box sx={{ mb: 2, mt: 1 }}>
          <Box
            sx={{
              bgcolor: isCanceled ? 'error.50' : 'primary.50',
              p: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: isCanceled ? 'error.200' : 'primary.200'
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {eventTitle}
            </Typography>

            {/* Date navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              <IconButton
                onClick={onPrevDate}
                disabled={!hasPrevDate || isLoading}
                size="small"
                sx={{ color: 'primary.main' }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <Typography
                variant="body1"
                fontWeight="medium"
                sx={{ mx: 2, minWidth: 200, textAlign: 'center' }}
              >
                {formattedDate}
              </Typography>

              <IconButton
                onClick={onNextDate}
                disabled={!hasNextDate || isLoading}
                size="small"
                sx={{ color: 'primary.main' }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Show current override info if exists */}
        {currentValues._hasOverride && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This date has existing overrides. Edit below to update.
          </Alert>
        )}

        {/* Canceled warning */}
        {isCanceled && (
          <Alert severity="error" sx={{ mb: 2 }}>
            This date will show as CANCELED on the calendar.
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={(_, v) => setCurrentTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Features" value="features" />
          <Tab
            label="Image"
            value="image"
            icon={currentImageSrc ? <ImageIcon fontSize="small" color="success" /> : null}
            iconPosition="end"
          />
        </Tabs>

        {/* Features Tab */}
        {currentTab === 'features' && (
          <>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Tonight&apos;s Features
            </Typography>

            {/* Current Features Display */}
            {features.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {features.map((feature, index) => {
                  const option = getFeatureOption(feature.type);
                  return (
                    <Chip
                      key={index}
                      label={
                        feature.type === 'live' ? '🎵 LIVE' :
                        feature.type === 'canceled' ? (feature.name ? `❌ CANCELED: ${feature.name}` : '❌ CANCELED') :
                        feature.type === 'note' ? `📝 ${feature.name}` :
                        feature.type === 'description' ? `📄 ${feature.name.length > 30 ? feature.name.substring(0, 30) + '...' : feature.name}` :
                        `${option.label}: ${feature.name}`
                      }
                      color={option.color}
                      onDelete={() => handleRemoveFeature(index)}
                      size="small"
                    />
                  );
                })}
              </Box>
            )}

            {features.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                No features set for this date. Add one below.
              </Typography>
            )}

            {/* Add Feature */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Add Feature</InputLabel>
                <Select
                  value={newFeatureType}
                  onChange={(e) => {
                    setNewFeatureType(e.target.value);
                    if (e.target.value === 'live' || e.target.value === 'canceled') {
                      setNewFeatureName('');
                    }
                  }}
                  label="Add Feature"
                >
                  {FEATURE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {newFeatureType && newFeatureType !== 'live' && (() => {
                const featureOption = FEATURE_OPTIONS.find(f => f.value === newFeatureType);
                const maxLength = featureOption?.maxLength || 19;
                const isDescription = newFeatureType === 'description';
                return (
                  <TextField
                    value={newFeatureName}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Enforce max length on input
                      if (maxLength > 0 && value.length <= maxLength) {
                        setNewFeatureName(value);
                      } else if (maxLength > 0) {
                        setNewFeatureName(value.substring(0, maxLength));
                      } else {
                        setNewFeatureName(value);
                      }
                    }}
                    label={
                      isDescription ? "Tonight's Description" :
                      newFeatureType === 'note' ? 'Note text' :
                      newFeatureType === 'canceled' ? 'Reason (optional)' :
                      'Name'
                    }
                    placeholder={
                      isDescription ? 'Special info about tonight...' :
                      newFeatureType === 'note' ? 'e.g., Starts 30 min early!' :
                      newFeatureType === 'canceled' ? 'e.g., Venue closed, Weather' :
                      'e.g., DJ Carlos'
                    }
                    size="small"
                    multiline={isDescription}
                    rows={isDescription ? 3 : 1}
                    sx={{ flex: 1 }}
                    helperText={maxLength > 0 ? `${newFeatureName.length}/${maxLength}` : ''}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isDescription) {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                );
              })()}

              <Button
                variant="outlined"
                onClick={handleAddFeature}
                disabled={!newFeatureType || (newFeatureType !== 'live' && newFeatureType !== 'canceled' && !newFeatureName.trim())}
                sx={{ height: 40, minWidth: 'auto', px: 2 }}
              >
                <AddIcon />
              </Button>
            </Box>
          </>
        )}

        {/* Image Tab */}
        {currentTab === 'image' && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Override Image for This Date
            </Typography>

            {currentImageSrc ? (
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
                    src={currentImageSrc}
                    alt="Override image preview"
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {overrideImageFile?.name || 'Current override image'}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearImage}
                  size="small"
                >
                  Remove Image
                </Button>
              </Box>
            ) : (
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.400',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'primary.50' : 'grey.50',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' }
                }}
              >
                <input {...getInputProps()} />
                <ImageIcon sx={{ fontSize: 40, color: 'grey.500', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {isDragActive ? 'Drop image here...' : 'Drag & drop or click to select image'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Max 5MB (JPEG, PNG, GIF, WebP)
                </Typography>
              </Box>
            )}
          </Box>
        )}

      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color={isCanceled ? 'error' : 'primary'}
          disabled={isLoading || !hasChanges}
          startIcon={isCanceled ? <CancelIcon /> : <EditIcon />}
        >
          {isLoading ? 'Saving...' : isCanceled ? 'Mark Canceled' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EditOccurrenceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  eventTitle: PropTypes.string.isRequired,
  occurrenceDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  currentValues: PropTypes.shape({
    _hasOverride: PropTypes.bool,
    _overridePatch: PropTypes.object
  }),
  isLoading: PropTypes.bool,
  onPrevDate: PropTypes.func,
  onNextDate: PropTypes.func,
  hasPrevDate: PropTypes.bool,
  hasNextDate: PropTypes.bool
};

export default EditOccurrenceModal;
