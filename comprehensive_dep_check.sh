#\!/bin/bash

echo "=== COMPREHENSIVE DEPENDENCY USAGE REPORT ==="
echo ""
echo "Checking dependencies in src/, pages/, components/, styles/, etc..."
echo ""

# Production dependencies
dependencies=(
"@azure/storage-blob"
"@emotion/react"
"@emotion/styled"
"@fontsource/roboto"
"@fullcalendar/core"
"@fullcalendar/daygrid"
"@fullcalendar/interaction"
"@fullcalendar/list"
"@fullcalendar/react"
"@fullcalendar/rrule"
"@fullcalendar/timegrid"
"@microsoft/applicationinsights-react-js"
"@microsoft/applicationinsights-web"
"@mui/icons-material"
"@mui/lab"
"@mui/material"
"@mui/system"
"@mui/x-date-pickers"
"@vercel/analytics"
"axios"
"date-fns"
"dayjs"
"debounce"
"depcheck"
"dompurify"
"firebase"
"install"
"jsdom"
"leaflet"
"luxon"
"next"
"next-seo"
"next-sitemap"
"npm"
"pandoc"
"react"
"react-dom"
"react-dropzone"
"react-leaflet"
"rrule"
"slugify"
"uuid"
"validator"
"winston"
)

# Check each dependency
for dep in "${dependencies[@]}"; do
    # Escape special characters
    escaped_dep=$(echo "$dep" | sed 's/[[\.*^$()+?{|]/\\&/g' | sed 's/\//\\\//g')
    
    # Count files using this dependency (various import patterns)
    count=$(rg -l "(from ['\"]${escaped_dep}|require\(['\"]${escaped_dep}|import ['\"]${escaped_dep})" \
        --glob "\!node_modules/**" \
        --glob "\!.next/**" \
        --glob "\!package-lock.json" \
        --glob "\!build/**" \
        --glob "\!dist/**" \
        2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$count" -eq "0" ]; then
        # Also check for partial imports like @mui/material/Button
        partial_count=$(rg -l "(from ['\"]${escaped_dep}/|require\(['\"]${escaped_dep}/|import ['\"]${escaped_dep}/)" \
            --glob "\!node_modules/**" \
            --glob "\!.next/**" \
            --glob "\!package-lock.json" \
            --glob "\!build/**" \
            --glob "\!dist/**" \
            2>/dev/null | wc -l | tr -d ' ')
        
        if [ "$partial_count" -eq "0" ]; then
            echo "❌ UNUSED: $dep"
        else
            echo "✅ USED: $dep (found in $partial_count files - partial imports)"
        fi
    else
        echo "✅ USED: $dep (found in $count files)"
    fi
done

echo ""
echo "=== DEV DEPENDENCIES ==="
echo ""

dev_dependencies=(
"@eslint/js"
"cypress"
"eslint"
"eslint-config-next"
"eslint-plugin-cypress"
"eslint-plugin-react"
"globals"
"prettier"
)

for dep in "${dev_dependencies[@]}"; do
    # These are typically not imported in code but used in config files
    if [[ "$dep" == "eslint"* ]] || [[ "$dep" == "prettier" ]] || [[ "$dep" == "cypress" ]] || [[ "$dep" == "globals" ]] || [[ "$dep" == "@eslint/js" ]]; then
        # Check config files
        config_count=$(rg -l "$dep" \
            --glob "*.config.*" \
            --glob ".eslintrc*" \
            --glob ".prettierrc*" \
            --glob "cypress.config.*" \
            --glob "package.json" \
            --glob "\!node_modules/**" \
            2>/dev/null | wc -l | tr -d ' ')
        
        if [ "$config_count" -gt "0" ]; then
            echo "✅ USED: $dep (found in config files)"
        else
            echo "❓ CHECK: $dep (dev dependency - may be used by tooling)"
        fi
    else
        escaped_dep=$(echo "$dep" | sed 's/[[\.*^$()+?{|]/\\&/g' | sed 's/\//\\\//g')
        count=$(rg -l "(from ['\"]${escaped_dep}|require\(['\"]${escaped_dep})" \
            --glob "\!node_modules/**" \
            --glob "\!.next/**" \
            --glob "\!package-lock.json" \
            2>/dev/null | wc -l | tr -d ' ')
        
        if [ "$count" -eq "0" ]; then
            echo "❌ UNUSED: $dep"
        else
            echo "✅ USED: $dep (found in $count files)"
        fi
    fi
done

echo ""
echo "=== SPECIAL CASES TO CHECK ==="
echo ""

# Check for specific patterns that might indicate usage
echo "Checking for FullCalendar usage (might be dynamically imported)..."
rg -l "fullcalendar|FullCalendar" --glob "\!node_modules/**" --glob "\!.next/**" | head -5

echo ""
echo "Checking for emotion/styled usage (CSS-in-JS)..."
rg -l "styled\(|css\`|@emotion" --glob "\!node_modules/**" --glob "\!.next/**" | head -5

echo ""
echo "Checking for Next.js config files..."
ls next.config.* 2>/dev/null || echo "No next.config files found"

