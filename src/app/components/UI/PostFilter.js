import React from "react";
import PropTypes from "prop-types";
import { categoryColors } from "@/utils/categoryColors";
import { usePostFilter } from "@/hooks/usePostFilter";

const PostFilter = ({
  events,
  categories,
  selectedOrganizer,
  selectedTags,
  setFilteredEvents,
}) => {
  const { activeCategories, handleCategoryChange } = usePostFilter(
    events,
    categories,
    selectedOrganizer,
    selectedTags
  );

  React.useEffect(() => {
    if (typeof setFilteredEvents === "function" && activeCategories.length) {
      setFilteredEvents(activeCategories);
    }
  }, [activeCategories, setFilteredEvents]);

  return (
    <div className="category-filter">
      {categories && categories.length > 0 ? (
        categories.map((category) => {
          const isActive = activeCategories.includes(category.categoryName);
          return (
            <button
              key={category._id}
              style={{
                backgroundColor: isActive
                  ? categoryColors[category.categoryName]
                  : "white",
                color: isActive ? "black" : "grey",
                padding: "2px 2px",
                border: isActive ? "none" : "1px solid grey",
                borderRadius: "4px",
                margin: "3px",
              }}
              className={`category-button ${isActive ? "active" : ""}`}
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
  events: PropTypes.array.isRequired,
  selectedOrganizer: PropTypes.string,
  selectedTags: PropTypes.array, // Prepare for tags filter
  setFilteredEvents: PropTypes.func.isRequired,
};

export default PostFilter;
