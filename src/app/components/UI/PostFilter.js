import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { categoryColors } from "@/utils/categoryColors";

const PostFilter = ({
  categories,
  handleCategoryChange,
  selectedOrganizer,
}) => {
  const categoryOrder = [
    "Milonga",
    "Practica",
    "Festival",
    "Workshop",
    "Class",
    "Virtual",
    "Trip",
  ];
  const defaultactiveCategories = [
    "Milonga",
    "Practica",
    "Workshop",
    "Festival",
  ];
  const [activeCategories, setActiveCategories] = useState([]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      // Filter categories based on selected organizer if provided
      const filteredCategories = categories.filter((category) =>
        selectedOrganizer ? category.organizerId === selectedOrganizer : true
      );

      // Sort the categories based on pre-defined order
      const sortedCategories = filteredCategories.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.categoryName);
        const indexB = categoryOrder.indexOf(b.categoryName);
        // If the category is not found in categoryOrder, place it at the end
        return (
          (indexA === -1 ? categoryOrder.length : indexA) -
          (indexB === -1 ? categoryOrder.length : indexB)
        );
      });
      console.log("Final sorted categories:", sortedCategories);
      //          handleSortedCategories(sortedCategories);

      // Set initial categories based on default selections
      const initialCategories = sortedCategories
        .filter((category) =>
          defaultactiveCategories.includes(category.categoryName)
        )
        .map((category) => category.categoryName);

      setActiveCategories(initialCategories);
      handleCategoryChange(initialCategories);
    }
  }, [categories, selectedOrganizer]); // Run effect when categories or organizer changes

  const handleCategoryButtonClick = (categoryName) => {
    let newActiveCategories;

    if (activeCategories.includes(categoryName)) {
      newActiveCategories = activeCategories.filter(
        (cat) => cat !== categoryName
      );
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
          const isActive = activeCategories.includes(category.categoryName);
          const isMilonga = category.categoryName === "Milonga";

          return (
            <button
              key={category._id}
              style={{
                backgroundColor: isActive
                  ? categoryColors[category.categoryName]
                  : "white",
                color:
                  isMilonga && isActive ? "white" : isActive ? "black" : "grey",
                padding: "2px 2px",
                border: isActive ? "none" : "1px solid grey",
                borderRadius: "4px",
                margin: "3px",
                fontStyle: isActive ? "normal" : "italic",
              }}
              className={`category-button ${isActive ? "active" : ""}`}
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

PostFilter.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      categoryName: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleCategoryChange: PropTypes.func.isRequired,
  selectedOrganizer: PropTypes.string, // Optional prop for selected organizer
  handleSortedCategories: PropTypes.func.isRequired, // Added to prop types
};

export default PostFilter;
