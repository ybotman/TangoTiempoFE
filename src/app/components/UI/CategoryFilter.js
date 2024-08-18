import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { categoryColors } from '@/utils/categoryColors';

const CategoryFilter = ({ categories, handleCategoryChange }) => {
    const [activeCategories, setActiveCategories] = useState([]);

    useEffect(() => {
        if (categories && categories.length > 0) {
            const initialCategories = categories.map(c => c.CategoryName);
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
                        key={category.CategoryName}
                        style={{
                            backgroundColor: activeCategories.includes(category.CategoryName) ? categoryColors[category.CategoryName] : 'lightGrey',
                            color: activeCategories.includes(category.CategoryName) && category.CategoryName === 'Milonga' ? 'white' : 'black',
                            padding: '0px 5px',
                            border: 'none',
                            borderRadius: '4px',
                            margin: '0px', // Adjust spacing between buttons
                        }}
                        className={`category-button ${activeCategories.includes(category.CategoryName) ? 'active' : ''}`}
                        onClick={() => handleButtonClick(category.CategoryName)}
                    >
                        {category.CategoryName}
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
        CategoryName: PropTypes.string.isRequired,
    })).isRequired,
    handleCategoryChange: PropTypes.func.isRequired,
};

export default CategoryFilter;