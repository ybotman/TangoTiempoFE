import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { categoryColors } from '@/utils/categoryColors';

const PostFilter = ({
  activeCategories = [],
  categories = [],
  handleCategoryChange,
}) => {
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

  // Sort the categories based on their order in orderedCategories
  const sortedCategories = categories.sort((a, b) => {
    const indexA = orderedCategories.indexOf(a.categoryName);
    const indexB = orderedCategories.indexOf(b.categoryName);

    // If the category is not in orderedCategories, move it to the end
    const validIndexA = indexA === -1 ? orderedCategories.length : indexA;
    const validIndexB = indexB === -1 ? orderedCategories.length : indexB;

    return validIndexA - validIndexB;
  });

  // Separate the first four categories and remaining categories
  const firstFourCategories = sortedCategories.slice(0, 4);
  const remainingCategories = sortedCategories.slice(4);

  // State to handle expanding and collapsing
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}
      >
        {/* Display the first four categories in a row */}
        {firstFourCategories.map((category) => {
          const isActive = activeCategories.includes(category.categoryName);
          return (
            <button
              key={category._id}
              style={{
                backgroundColor: isActive
                  ? categoryColors[category.categoryName]
                  : 'white',
                color: isActive ? 'black' : 'grey',
                padding: '2px 2px',
                border: isActive ? 'none' : '1px solid grey',
                borderRadius: '4px',
                margin: '3px',
              }}
              className={`category-button ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.categoryName)}
            >
              {category.categoryName}
            </button>
          );
        })}

        {/* Expand/Collapse button */}
        <IconButton onClick={handleExpandClick} style={{ marginLeft: '10px' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </div>

      {/* Conditionally display remaining categories when expanded */}
      {expanded && (
        <div style={{ display: 'flex', flexWrap: 'nowrap', marginTop: '10px' }}>
          {remainingCategories.map((category) => {
            const isActive = activeCategories.includes(category.categoryName);
            return (
              <button
                key={category._id}
                style={{
                  backgroundColor: isActive
                    ? categoryColors[category.categoryName]
                    : 'white',
                  color: isActive ? 'black' : 'grey',
                  padding: '2px 2px',
                  border: isActive ? 'none' : '1px solid grey',
                  borderRadius: '4px',
                  margin: '3px',
                }}
                className={`category-button ${isActive ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.categoryName)}
              >
                {category.categoryName}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Add PropTypes for type checking
PostFilter.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired, // Unique identifier for each category
      categoryName: PropTypes.string.isRequired, // Name of the category
    })
  ).isRequired,
  activeCategories: PropTypes.arrayOf(PropTypes.string).isRequired, // Array of active category names
  handleCategoryChange: PropTypes.func.isRequired, // Function to handle category change
};

export default PostFilter;
