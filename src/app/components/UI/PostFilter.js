//app/components/UI/PostFilter.js//

'use client';

import PropTypes from 'prop-types';
import { categoryColors } from '@/utils/categoryColors';

const PostFilter = ({
  activeCategories = [],
  categories = [],
  handleCategoryChange,
}) => {
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
  ]; // Replace with actual category names

  const sortedCategories = categories.sort((a, b) => {
    const indexA = orderedCategories.indexOf(a.categoryName);
    const indexB = orderedCategories.indexOf(b.categoryName);
    return indexA - indexB;
  });

  return (
    <div className="category-filter">
      {sortedCategories && sortedCategories.length > 0 ? (
        sortedCategories.map((category) => {
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
        })
      ) : (
        <p>No categories available</p>
      )}
    </div>
  );
};

PostFilter.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      categoryName: PropTypes.string.isRequired,
    })
  ).isRequired,
  activeCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleCategoryChange: PropTypes.func.isRequired,
  selectedOrganizer: PropTypes.string,
};

export default PostFilter;
