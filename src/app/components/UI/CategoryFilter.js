import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { categoryColors } from '@/utils/categoryColors';

const CategoryFilter = ({ categories, handleCategoryChange }) => {
    const [activeCategories, setActiveCategories] = useState([]);

    useEffect(() => {
        if (categories && categories.length > 0) {
            const initialCategories = categories.map(c => c.categoryName);
            setActiveCategories(initialCategories);
            handleCategoryChange(initialCategories);
        }
    }, [categories]);

    const handleButtonClick = (categoryName) => {
        let newActiveCategories;

        if (activeCategories.includes(categoryName)) {
            // Deselect category
            newActiveCategories = activeCategories.filter(cat => cat !== categoryName);
        } else {
            // Select category
            newActiveCategories = [...activeCategories, categoryName];
        }

        setActiveCategories(newActiveCategories);
        handleCategoryChange(newActiveCategories);

        // Log the updated active categories
        console.log(`Category ${categoryName} clicked. New active categories:`, newActiveCategories);
    };

    return (
        <div className="category-filter">
            {categories && categories.length > 0 ? (
                categories.map((category) => (
                    <button
                        key={category.categoryName}
                        style={{
                            backgroundColor: activeCategories.includes(category.categoryName) ? categoryColors[category.categoryName] : 'lightGrey',
                            color: activeCategories.includes(category.categoryName) && category.categoryName === 'Milonga' ? 'white' : 'black',
                            padding: '5px 5px',
                            border: 'none',
                            borderRadius: '4px',
                            margin: '3px',
                        }}
                        className={`category-button ${activeCategories.includes(category.categoryName) ? 'active' : ''}`}
                        onClick={() => handleButtonClick(category.categoryName)}
                    // need to move to.... but issue without handleButtonClick...
                    //onClick={() => handleCategoryChange(category.categoryName)}

                    >
                        {category.categoryName}
                    </button>
                ))
            ) : (
                <p>No categories available</p>
            )}
        </div>
    );
};

// Add PropTypes validation
CategoryFilter.propTypes = {
    categories: PropTypes.arrayOf(PropTypes.shape({
        categoryName: PropTypes.string.isRequired,
    })).isRequired,
    handleCategoryChange: PropTypes.func.isRequired,
};

export default CategoryFilter;