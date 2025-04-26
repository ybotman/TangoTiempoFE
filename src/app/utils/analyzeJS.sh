#!/bin/bash

# Output file location
OUTPUT_DIR="./archive"
OUTPUT_FILE="$OUTPUT_DIR/react_analysis.txt"

# Ensure the archive directory exists
mkdir -p "$OUTPUT_DIR"

# Clear the output file if it exists
> "$OUTPUT_FILE"

# Analyze React files and save to the output file
git ls-files '*.js' | while read file; do  
  echo "$file:" >> "$OUTPUT_FILE";
  grep -E '^(import|export|const|function|await|fetch|async)' "$file" | sed 's/^/    /' >> "$OUTPUT_FILE"; 
  echo >> "$OUTPUT_FILE";
done

echo "React analysis saved to $OUTPUT_FILE"