'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Paper, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

/**
 * A component for displaying JSON data in a formatted, collapsible view
 * with syntax highlighting and copy functionality.
 */
const DebugJsonView = ({ title, data, expandByDefault = false }) => {
  const [expanded, setExpanded] = useState(expandByDefault);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format values with color coding
  const formatValue = (value) => {
    if (value === null) return <span style={{ color: '#999' }}>null</span>;
    if (value === undefined) return <span style={{ color: '#999' }}>undefined</span>;
    
    switch (typeof value) {
      case 'boolean':
        return <span style={{ color: '#b938a4' }}>{value.toString()}</span>;
      case 'number':
        return <span style={{ color: '#1a8cff' }}>{value.toString()}</span>;
      case 'string':
        return <span style={{ color: '#ff8400' }}>{`"${value}"`}</span>;
      case 'object':
        if (Array.isArray(value)) {
          return <span style={{ color: '#999' }}>[Array({value.length})]</span>;
        }
        return <span style={{ color: '#999' }}>{'{Object}'}</span>;
      default:
        return <span>{String(value)}</span>;
    }
  };

  // Recursive function to render nested objects
  const renderObject = (obj, level = 0, visitedRefs = new WeakSet()) => {
    const indent = 16 * level;
    const maxLevel = 5; // Maximum nesting level to prevent stack overflow

    // Handle primitive types
    if (obj === null || obj === undefined) {
      return formatValue(obj);
    }

    if (typeof obj !== 'object') {
      return formatValue(obj);
    }

    // Check for circular references and max depth
    if (visitedRefs.has(obj) || level > maxLevel) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>[Circular or Max Depth]</span>;
    }

    // Add this object to visited set for circular reference detection
    visitedRefs.add(obj);

    // Handle arrays
    if (Array.isArray(obj)) {
      return (
        <Box>
          <Typography variant="body2" component="span">[</Typography>
          {obj.length === 0 ? (
            <Typography variant="body2" component="span"> ]</Typography>
          ) : (
            <>
              {obj.slice(0, 100).map((item, index) => ( // Limit to first 100 items
                <Box key={index} ml={2} display="block">
                  <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                    {renderObject(item, level + 1, new WeakSet(visitedRefs))}
                    {index < Math.min(obj.length - 1, 99) ? ',' : ''}
                  </Typography>
                </Box>
              ))}
              {obj.length > 100 && (
                <Box ml={2} display="block">
                  <Typography variant="body2" component="span" sx={{ ml: 2, fontStyle: 'italic' }}>
                    ...{obj.length - 100} more items
                  </Typography>
                </Box>
              )}
              <Typography variant="body2" component="span" sx={{ ml: level * 2 }}>]</Typography>
            </>
          )}
        </Box>
      );
    }

    // Handle objects
    try {
      const keys = Object.keys(obj).slice(0, 50); // Limit to first 50 keys
      const totalKeys = Object.keys(obj).length;
      
      return (
        <Box>
          <Typography variant="body2" component="span">{'{'}</Typography>
          {keys.length === 0 ? (
            <Typography variant="body2" component="span"> {'}'}</Typography>
          ) : (
            <>
              {keys.map((key, index) => {
                // Skip functions and DOM nodes to avoid circular references
                if (typeof obj[key] === 'function' || 
                    (typeof obj[key] === 'object' && obj[key] !== null && obj[key].nodeType)) {
                  return (
                    <Box key={key} ml={2} display="block">
                      <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                        {key}:
                      </Typography>{' '}
                      <Typography variant="body2" component="span" sx={{ fontStyle: 'italic' }}>
                        {typeof obj[key] === 'function' ? '[Function]' : '[DOM Node]'}
                        {index < keys.length - 1 ? ',' : ''}
                      </Typography>
                    </Box>
                  );
                }
                
                return (
                  <Box key={key} ml={2} display="block">
                    <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                      {key}:
                    </Typography>{' '}
                    <Typography variant="body2" component="span">
                      {renderObject(obj[key], level + 1, new WeakSet(visitedRefs))}
                      {index < keys.length - 1 ? ',' : ''}
                    </Typography>
                  </Box>
                );
              })}
              {totalKeys > 50 && (
                <Box ml={2} display="block">
                  <Typography variant="body2" component="span" sx={{ fontStyle: 'italic' }}>
                    ...{totalKeys - 50} more properties
                  </Typography>
                </Box>
              )}
              <Typography variant="body2" component="span">{'}'}</Typography>
            </>
          )}
        </Box>
      );
    } catch (error) {
      // Return error message if there's an issue with this object
      return <span style={{ color: 'red' }}>[Error: {error.message}]</span>;
    }
  };

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`debug-json-${title}-content`}
        id={`debug-json-${title}-header`}
      >
        <Typography variant="subtitle1" fontWeight="medium">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            maxHeight: '400px', 
            overflow: 'auto',
            bgcolor: '#f8f8f8',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            position: 'relative'
          }}
        >
          <Button
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            variant="text"
            color={copied ? "success" : "primary"}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              minWidth: 0,
              px: 1
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          {renderObject(data)}
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
};

DebugJsonView.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.any.isRequired,
  expandByDefault: PropTypes.bool
};

export default DebugJsonView;