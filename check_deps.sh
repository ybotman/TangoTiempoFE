#\!/bin/bash

# Array of dependencies
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

echo "=== DEPENDENCY USAGE REPORT ==="
echo ""

for dep in "${dependencies[@]}"; do
    # Escape special characters in dependency name for grep
    escaped_dep=$(echo "$dep" | sed 's/[[\.*^$()+?{|]/\\&/g')
    
    # Search for imports/requires of the dependency
    count=$(rg -c "from ['\"]${escaped_dep}|require\(['\"]${escaped_dep}" --glob "\!node_modules/**" --glob "\!.next/**" --glob "\!package-lock.json" 2>/dev/null | wc -l)
    
    if [ "$count" -eq 0 ]; then
        echo "❌ UNUSED: $dep"
    else
        echo "✅ USED: $dep (found in $count files)"
    fi
done
