import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Button, 
  Popper, 
  Paper, 
  ClickAwayListener, 
  Box,
  Typography,
  Grow
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { categoryColors } from '@/utils/categoryColors';

const PostFilter = ({ activeCategories = [], categories = [], handleCategoryChange }) => {
  // Define the ordered categories
  const orderedCategories = [
    'Milonga',
    'Practica',
    'Festival',
    'Workshop',
    'DayWorkshop',
    'Class',
    'Trip',
    'Virtual',
    'Unknown',
  ];

  // Make a safe copy of categories if it's an array, otherwise use an empty array
  const categoriesSafe = Array.isArray(categories) ? [...categories] : [];
  
  // Sort the categories based on their order in orderedCategories
  const sortedCategories = categoriesSafe.filter(cat => cat && typeof cat === 'object' && cat.categoryName)
    .sort((a, b) => {
      const indexA = orderedCategories.indexOf(a.categoryName);
      const indexB = orderedCategories.indexOf(b.categoryName);

      // If the category is not in orderedCategories, move it to the end
      const validIndexA = indexA === -1 ? orderedCategories.length : indexA;
      const validIndexB = indexB === -1 ? orderedCategories.length : indexB;

      return validIndexA - validIndexB;
    });

  // State for dropdown
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  // Close dropdown on escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open]);

  // Get active count for button label (not currently displayed)

  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        ref={anchorRef}
        onClick={handleToggle}
        endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        variant="outlined"
        sx={{
          borderColor: 'primary.main',
          color: 'primary.main',
          textTransform: 'none',
          fontWeight: 500,
          px: 2,
          py: 0.5,
          borderRadius: 2,
          '&:hover': {
            backgroundColor: 'primary.light',
            borderColor: 'primary.dark',
          }
        }}
      >
        CATEGORIES
      </Button>
      
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        transition
        disablePortal
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} timeout={200}>
            <Paper
              elevation={3}
              sx={{
                mt: 1,
                p: 2,
                minWidth: 320,
                maxWidth: 400,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      mb: 1.5, 
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    Select Categories
                  </Typography>
                  
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 0.5,
                      maxHeight: 300,
                      overflowY: 'auto'
                    }}
                  >
                    {sortedCategories.map((category) => {
                      const isActive = activeCategories.includes(category.categoryName);
                      const categoryColor = categoryColors[category.categoryName] || categoryColors.Unknown;
                      
                      return (
                        <Box
                          key={category._id}
                          onClick={() => handleCategoryChange(category.categoryName)}
                          sx={{
                            p: 0.75,
                            borderRadius: 1.5,
                            cursor: 'pointer',
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: isActive ? 'transparent' : 'divider',
                            backgroundColor: isActive ? categoryColor : 'transparent',
                            color: isActive ? 'black' : 'black',
                            fontWeight: isActive ? 600 : 500,
                            fontSize: '0.75rem',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: isActive ? categoryColor : `${categoryColor}20`,
                              borderColor: isActive ? 'transparent' : categoryColor,
                              transform: 'scale(1.02)'
                            },
                            minHeight: 22, // Smaller touch target size
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {category.categoryName}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
};

// PropTypes for type checking
PostFilter.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      categoryName: PropTypes.string.isRequired,
      categoryNameAbbreviation: PropTypes.string,
    })
  ).isRequired,
  activeCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleCategoryChange: PropTypes.func.isRequired,
};

export default PostFilter;
