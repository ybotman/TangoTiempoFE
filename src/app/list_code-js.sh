#!/bin/bash

# Output file name
output_file="TangoTiempoCode.txt"

# Clear the output file if it exists
> $output_file

# Traverse all subdirectories and find all .js files
find . -type d \( -name admin -o -name about \) -prune -o -type f -name "*.js" -print | while read file; do
# find . -type f -name "*.js" | while read file; do
    echo "*************  Start of Code ***********" >> $output_file
    echo "Code object : //${file}" >> $output_file
    echo "" >> $output_file
    cat "$file" >> $output_file
    echo "" >> $output_file
    echo "************. End of Code *************" >> $output_file
    echo -e "\n\n\n\n" >> $output_file
done

echo "All files have been processed and combined into $output_file"
cd 