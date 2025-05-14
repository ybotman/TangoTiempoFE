/**
 * JSON Display Fix for Debug Menu
 * 
 * This file contains a function to fix the "[Error: object is not iterable 
 * (cannot read property Symbol(Symbol.iterator))]" errors in the debug menu.
 * 
 * To implement:
 * 1. Add this function to your debug menu components
 * 2. Use it to process context objects before displaying
 * 3. No other changes needed - this is a non-invasive fix
 */

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
 * IMPLEMENTATION INSTRUCTIONS:
 * 
 * 1. For the Debug Menu components:
 * 
 * // Before displaying any context object
 * const safeContextData = createSerializableSnapshot(contextData);
 * 
 * // Then use JSON.stringify on the safe version
 * JSON.stringify(safeContextData, null, 2);
 * 
 * 2. Example for each context debug component:
 * 
 * function GeoLocationContextDebug() {
 *   const geoContext = useGeoLocation();
 *   
 *   // Create safe serializable snapshot
 *   const safeContext = createSerializableSnapshot(geoContext);
 *   
 *   return (
 *     <div className="debug-section">
 *       <h3>GeoLocation Context</h3>
 *       <pre>{JSON.stringify(safeContext, null, 2)}</pre>
 *     </div>
 *   );
 * }
 * 
 * 3. Alternatively, modify the DebugJsonView component directly:
 * 
 * function DebugJsonView({ data, title }) {
 *   // Create safe serializable version of the data
 *   const safeData = createSerializableSnapshot(data);
 *   
 *   return (
 *     <div className="debug-json-view">
 *       {title && <h4>{title}</h4>}
 *       <pre>{JSON.stringify(safeData, null, 2)}</pre>
 *     </div>
 *   );
 * }
 */