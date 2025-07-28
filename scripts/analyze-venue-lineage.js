#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Venue attributes to trace
const VENUE_ATTRIBUTES = [
  '_id',
  'appId',
  'name',
  'shortName',
  'address1',
  'address2',
  'address3',
  'city',
  'state',
  'zip',
  'phone',
  'comments',
  'latitude',
  'longitude',
  'isValidVenueGeolocation',
  'geolocation',
  'masteredCityId',
  'masteredDivisionId',
  'masteredRegionId',
  'masteredCountryId',
  'isActive',
  'createdAt',
  'updatedAt',
  'venueId', // Alternative reference
  'venue.', // Nested access
];

// Patterns to identify usage types
const USAGE_PATTERNS = {
  display: [
    /\.name[\s\)}]/,
    /\.shortName[\s\)}]/,
    /\.city[\s\)}]/,
    /\.state[\s\)}]/,
    /\.address/,
    /<.*>\s*{\s*venue\./,
    /tooltip.*venue\./,
    /label.*venue\./,
  ],
  filter: [
    /filter.*venue\./,
    /\.filter\(/,
    /masteredDivisionId\s*===/, 
    /masteredCityId\s*===/,
    /latitude.*&&.*longitude/,
    /isActive/,
    /calculateDistance/,
  ],
  join: [
    /masteredCityId/,
    /masteredDivisionId/,
    /masteredRegionId/,
    /venueId/,
  ],
  transform: [
    /parseFloat.*latitude/,
    /parseFloat.*longitude/,
    /\|\|.*name/,
    /shortName\s*\|\|/,
    /\$\{.*venue\./,
  ],
  key: [
    /key=.*\._id/,
    /key=.*venue\._id/,
  ],
};

function searchInFile(filePath, attribute) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const results = [];
    
    lines.forEach((line, index) => {
      // Look for attribute usage
      if (line.includes(attribute)) {
        const lineNum = index + 1;
        const context = {
          file: path.relative(process.cwd(), filePath),
          line: lineNum,
          code: line.trim(),
          usageType: categorizeUsage(line, attribute)
        };
        results.push(context);
      }
    });
    
    return results;
  } catch (error) {
    return [];
  }
}

function categorizeUsage(line, attribute) {
  const types = [];
  
  for (const [type, patterns] of Object.entries(USAGE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(line)) {
        types.push(type);
        break;
      }
    }
  }
  
  return types.length > 0 ? types : ['other'];
}

function walkDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'build') {
        walkDirectory(filePath, fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function generateReport() {
  const srcDir = path.join(process.cwd(), 'src');
  const files = walkDirectory(srcDir);
  const report = {};
  
  console.log(`Analyzing ${files.length} files...\n`);
  
  VENUE_ATTRIBUTES.forEach(attribute => {
    report[attribute] = {
      display: [],
      filter: [],
      join: [],
      transform: [],
      key: [],
      other: []
    };
    
    files.forEach(file => {
      const results = searchInFile(file, attribute);
      results.forEach(result => {
        result.usageType.forEach(type => {
          report[attribute][type].push(result);
        });
      });
    });
  });
  
  // Generate markdown report
  let markdown = '# Venue Attribute Usage Report\n\n';
  markdown += `Generated: ${new Date().toISOString()}\n\n`;
  
  for (const [attribute, usage] of Object.entries(report)) {
    const totalUsages = Object.values(usage).reduce((sum, arr) => sum + arr.length, 0);
    
    if (totalUsages > 0) {
      markdown += `## ${attribute}\n\n`;
      markdown += `Total usages: ${totalUsages}\n\n`;
      
      for (const [type, locations] of Object.entries(usage)) {
        if (locations.length > 0) {
          markdown += `### ${type.charAt(0).toUpperCase() + type.slice(1)} (${locations.length})\n\n`;
          locations.forEach(loc => {
            markdown += `- \`${loc.file}:${loc.line}\`\n`;
            markdown += `  \`\`\`javascript\n  ${loc.code}\n  \`\`\`\n`;
          });
          markdown += '\n';
        }
      }
      markdown += '---\n\n';
    }
  }
  
  // Write report
  const reportPath = path.join(process.cwd(), 'VENUE-USAGE-REPORT.md');
  fs.writeFileSync(reportPath, markdown);
  console.log(`Report generated: ${reportPath}`);
  
  // Summary
  console.log('\nSummary:');
  for (const [attribute, usage] of Object.entries(report)) {
    const totalUsages = Object.values(usage).reduce((sum, arr) => sum + arr.length, 0);
    if (totalUsages > 0) {
      console.log(`${attribute}: ${totalUsages} usages`);
    }
  }
}

// Run the analysis
generateReport();