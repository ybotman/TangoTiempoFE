import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { categoryColors } from '@/utils/categoryColors';

const CategoryFilter = ({ categories, handleCategoryChange }) => {
    // Define the desired order of categories
    const categoryOrder = ['Milonga', 'Practica', 'Festival', 'Workshop', 'Class', 'Virtual', 'Trip'];

    // Define default selected categories
    const defaultSelectedCategories = ['Milonga', 'Practica', 'Workshop', 'Festival'];

    const [activeCategories, setActiveCategories] = useState([]);

    useEffect(() => {
        if (categories && categories.length > 0) {
            // Sort categories based on the defined order
            const sortedCategories = categories.sort((a, b) => {
                return categoryOrder.indexOf(a.categoryName) - categoryOrder.indexOf(b.categoryName);
            });

            // Set default selected categories
            const initialCategories = sortedCategories
                .filter(category => defaultSelectedCategories.includes(category.categoryName))
                .map(category => category.categoryName);

            setActiveCategories(initialCategories);
            handleCategoryChange(initialCategories);
        }
    }, [categories]);

    const handleCategoryButtonClick = (categoryName) => {
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
                        key={category._id}  // Use _id as the unique key
                        style={{
                            backgroundColor: activeCategories.includes(category.categoryName) ? categoryColors[category.categoryName] : 'white',
                            color: activeCategories.includes(category.categoryName) && category.categoryName === 'Milonga' ? 'white' : 'black',
                            padding: '5px 5px',
                            border: 'none',
                            borderRadius: '4px',
                            margin: '3px',
                        }}
                        className={`category-button ${activeCategories.includes(category.categoryName) ? 'active' : ''}`}
                        onClick={() => handleCategoryButtonClick(category.categoryName)}
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