import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Creates a serializable snapshot of any object, handling circular references,
 * functions, and other non-serializable values.
 * 
 * @param {any} data - The data to sanitize for display
 * @param {number} [maxDepth=10] - Maximum recursion depth to prevent stack overflow
 * @return {any} A serializable version of the data
 */
function createSerializableSnapshot(data, maxDepth = 10) {
  // Track processed objects to handle circular references
  const seen = new WeakSet();
  
  function process(value, depth = 0) {
    // Handle null/undefined immediately
    if (value === null || value === undefined) {
      return value;
    }
    
    // Handle primitive types (safe for serialization)
    if (
      typeof value === 'string' || 
      typeof value === 'number' || 
      typeof value === 'boolean'
    ) {
      return value;
    }
    
    // Handle functions - replace with description
    if (typeof value === 'function') {
      return `[Function: ${value.name || 'anonymous'}]`;
    }
    
    // Handle maximum recursion depth
    if (depth >= maxDepth) {
      return '[Max depth reached]';
    }
    
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular reference]';
      }
      seen.add(value);
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(item => process(item, depth + 1));
    }
    
    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }
    
    // Handle regular objects
    if (typeof value === 'object') {
      const result = {};
      for (const key in value) {
        // Skip non-enumerable properties and prototypes
        if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
        
        try {
          result[key] = process(value[key], depth + 1);
        } catch (err) {
          result[key] = `[Error: ${err.message}]`;
        }
      }
      return result;
    }
    
    // Fallback for any other types
    return String(value);
  }
  
  try {
    return process(data);
  } catch (err) {
    return { error: `Failed to create snapshot: ${err.message}` };
  }
}

/**
 * DebugJsonView Component
 * Displays JSON data with syntax highlighting and copy functionality
 */
function DebugJsonView({ data, title }) {
  const [copied, setCopied] = useState(false);
  
  // Create a safe serializable copy of the data - THIS IS THE CRITICAL FIX
  const safeData = createSerializableSnapshot(data);
  
  // Format the JSON with pretty printing
  const jsonString = JSON.stringify(safeData, null, 2);
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div className="debug-json-view">
      {title && (
        <div className="debug-json-header">
          <h4>{title}</h4>
          <button 
            className={`copy-button ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="json-display">{jsonString}</pre>
    </div>
  );
}

DebugJsonView.propTypes = {
  data: PropTypes.any.isRequired,
  title: PropTypes.string.isRequired
};

export default DebugJsonView;