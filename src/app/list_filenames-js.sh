#!/bin/bash

# Output file name
output_file="TangoTiempoFiles.txt"

# Clear the output file if it exists
> $output_file

# Add current date to the output file
echo "Date: $(date)" >> $output_file
echo "" >> $output_file

# Traverse all subdirectories and find all .js files
find . -name "*.js" ! -path "./node_modules/*" ! -path "./archive/*" ! -path "./admin/*" ! -path "./.next/*" >> $output_file

# Notify the user
echo "All file names have been processed and combined into $output_file on $(date)"