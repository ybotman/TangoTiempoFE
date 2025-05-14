# Debug Menu JSON Display Fix - Integration Guide

## Problem

The debug menu in the TangoTiempo application shows the error `[Error: object is not iterable (cannot read property Symbol(Symbol.iterator))]` instead of actual data when trying to display context objects. This happens because the context objects contain circular references, functions, or other non-serializable values.

## Solution

The solution is to add a serialization helper function that creates a clean, serializable snapshot of any object before attempting to display it.

## Integration Steps

### 1. Add the Helper Function

Add the `createSerializableSnapshot` function to your codebase. The most logical place would be:

- If you have a utils folder: `/src/app/utils/jsonUtils.js`
- Otherwise: Add it directly to the `DebugJsonView.js` component

### 2. Modify the DebugJsonView Component

Find the `DebugJsonView` component (likely in `/src/app/components/Modals/Debug/DebugJsonView.js`) and update it to use the serialization function:

```javascript
import React from 'react';
// If you added the function to a utils file, import it
// import { createSerializableSnapshot } from '../../utils/jsonUtils';

// Otherwise, add the function directly here
function createSerializableSnapshot(data, maxDepth = 10) {
  // Function implementation from the Issue_1025_JSON_Display_Fix.js file
  // ...
}

function DebugJsonView({ data, title, ...props }) {
  // Create a safe serializable copy of the data
  const safeData = createSerializableSnapshot(data);
  
  // Then use the safe data for display
  return (
    <div className="debug-json-view">
      {title && <h4>{title}</h4>}
      <pre>{JSON.stringify(safeData, null, 2)}</pre>
      {/* Keep any other functionality (like copy buttons) */}
    </div>
  );
}

export default DebugJsonView;
```

### 3. Alternative: Update Each Context Debug Component

If you prefer not to modify the `DebugJsonView` component, you can instead update each context debug component to provide sanitized data:

```javascript
import React from 'react';
import DebugJsonView from './DebugJsonView';
import { useGeoLocation } from '../../../contexts/GeoLocationContext';
import { createSerializableSnapshot } from '../../utils/jsonUtils';

function GeoLocationContextDebug() {
  const geoContext = useGeoLocation();
  
  // Create safe snapshot before passing to DebugJsonView
  const safeContext = createSerializableSnapshot(geoContext);
  
  return (
    <div className="debug-section">
      <h3>GeoLocation Context</h3>
      <DebugJsonView data={safeContext} title="Current State" />
    </div>
  );
}

export default GeoLocationContextDebug;
```

## Verification

After implementing this fix:

1. Open the application
2. Open the hamburger menu
3. Navigate to the Debug section
4. Check that each context tab now shows proper JSON data instead of the error message

You should see actual context data in a readable format for:
- Auth Context
- Regions Context
- Role Context
- Mastered Location Context
- Geo Location Context

## Expected Results

Instead of error messages, you'll see the actual data in a structured JSON format:

```json
{
  "isInitialized": true,
  "userLocation": {
    "cityID": "6751f58a5db435dd8005e479",
    "cityName": "Boston",
    "regionID": "6751f58a5db435dd8005e45b",
    "regionName": "Northeast",
    "latitude": 42.3601,
    "longitude": -71.0589
  },
  "selectedLocation": {
    "cityID": "6751f58a5db435dd8005e479",
    "cityName": "Boston",
    "regionID": "6751f58a5db435dd8005e45b",
    "regionName": "Northeast",
    "latitude": 42.3601,
    "longitude": -71.0589
  },
  "error": null,
  "setSelectedLocation": "[Function: setSelectedLocation]"
}
```

## Benefits

This fix will:
1. Make the debug menu fully functional for diagnosing location context issues
2. Allow developers to see the actual state of all contexts
3. Help identify the root causes of UI inconsistencies
4. Provide a foundation for fixing the broader location context issues