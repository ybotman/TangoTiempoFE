import React from 'react';

const CategoryFilter = ({ categories, activeFilters, handleFilterChange }) => {
    return (
        <div className="category-filter">
            {categories.map((category) => (
                <button
                    key={category._id}
                    className={`category-button ${activeFilters.includes(category.CategoryCode) ? 'active' : ''}`}
                    onClick={() => handleFilterChange(category.CategoryCode)}
                >
                    {category.CategoryName}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;