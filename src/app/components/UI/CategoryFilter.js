import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { categoryColors } from '@/utils/categoryColors';

const CategoryFilter = ({ categories, handleCategoryChange }) => {
    const categoryOrder = ['Milonga', 'Practica', 'Festival', 'Workshop', 'Class', 'Virtual', 'Trip'];
    const defaultSelectedCategories = ['Milonga', 'Practica', 'Workshop', 'Festival'];
    const [activeCategories, setActiveCategories] = useState([]);

    useEffect(() => {
        if (categories && categories.length > 0) {
            const sortedCategories = categories.sort((a, b) => {
                return categoryOrder.indexOf(a.categoryName) - categoryOrder.indexOf(b.categoryName);
            });

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
            newActiveCategories = activeCategories.filter(cat => cat !== categoryName);
        } else {
            newActiveCategories = [...activeCategories, categoryName];
        }

        setActiveCategories(newActiveCategories);
        handleCategoryChange(newActiveCategories);
    };

    return (
        <div className="category-filter">
            {categories && categories.length > 0 ? (
                categories.map((category) => {
                    const isMilonga = category.categoryName === 'Milonga';
                    const isActive = activeCategories.includes(category.categoryName);

                    return (
                        <button
                            key={category._id}
                            style={{
                                backgroundColor: isActive ? categoryColors[category.categoryName] : 'white',
                                color: isMilonga && isActive ? 'white' : isActive ? 'black' : 'grey',
                                padding: '2px 2px',
                                border: isActive ? 'none' : '1px solid grey',
                                borderRadius: '4px',
                                margin: '3px',
                                fontStyle: isActive ? 'normal' : 'italic',
                            }}
                            className={`category-button ${isActive ? 'active' : ''}`}
                            onClick={() => handleCategoryButtonClick(category.categoryName)}
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

CategoryFilter.propTypes = {
    categories: PropTypes.arrayOf(PropTypes.shape({
        categoryName: PropTypes.string.isRequired,
    })).isRequired,
    handleCategoryChange: PropTypes.func.isRequired,
};

export default CategoryFilter;