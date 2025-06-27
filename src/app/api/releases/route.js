// src/app/api/releases/route.js

import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Parse the markdown content to extract structured data
function parseReleaseMarkdown(content, filename) {
  const lines = content.split('\n');
  const release = {
    filename,
    title: '',
    type: 'Merge',
    sourceTarget: '',
    timestamp: '',
    relatedItems: [],
    description: '',
    status: '',
    impactedAreas: [],
    userBenefits: [],
    technicalEnhancements: [],
  };

  // Extract date from filename (e.g., merge-2025-06-26T1903.md)
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    release.date = dateMatch[1];
  }

  let currentSection = '';
  
  lines.forEach((line) => {
    // Title
    if (line.startsWith('# ')) {
      release.title = line.replace('# ', '').trim();
    }
    
    // Type
    if (line.startsWith('**Type:**')) {
      release.type = line.replace('**Type:**', '').trim();
    }
    
    // Source/Target branches
    if (line.startsWith('**Source Branch:**')) {
      release.sourceTarget += line.replace('**Source Branch:**', '').trim() + ' → ';
    }
    if (line.startsWith('**Target Branch:**')) {
      release.sourceTarget += line.replace('**Target Branch:**', '').trim();
    }
    
    // Timestamp
    if (line.startsWith('**Timestamp:**')) {
      release.timestamp = line.replace('**Timestamp:**', '').trim();
    }
    
    // Section headers
    if (line.includes('## 📌 Related Items')) {
      currentSection = 'relatedItems';
    } else if (line.includes('## 📝 Description')) {
      currentSection = 'description';
    } else if (line.includes('## ✅ Status')) {
      currentSection = 'status';
    } else if (line.includes('## 📦 Impacted Areas')) {
      currentSection = 'impactedAreas';
    } else if (line.includes('## User Benefits')) {
      currentSection = 'userBenefits';
    } else if (line.includes('## Technical Enhancements')) {
      currentSection = 'technicalEnhancements';
    } else if (line.startsWith('##')) {
      currentSection = '';
    }
    
    // Content parsing based on current section
    if (currentSection && !line.startsWith('##') && line.trim()) {
      switch (currentSection) {
        case 'relatedItems':
          if (line.startsWith('- ')) {
            const item = line.replace('- ', '').trim();
            // Extract JIRA ticket if present
            const jiraMatch = item.match(/(TIEMPO-\d+)/);
            if (jiraMatch) {
              release.relatedItems.push({
                ticket: jiraMatch[1],
                description: item.replace(jiraMatch[1] + ':', '').trim()
              });
            } else {
              release.relatedItems.push({
                ticket: null,
                description: item
              });
            }
          }
          break;
        case 'description':
          release.description += line + ' ';
          break;
        case 'status':
          release.status += line + '\n';
          break;
        case 'impactedAreas':
        case 'userBenefits':
        case 'technicalEnhancements':
          if (line.startsWith('- ')) {
            release[currentSection].push(line.replace('- ', '').trim());
          }
          break;
      }
    }
  });
  
  // Clean up description
  release.description = release.description.trim();
  
  return release;
}

export async function GET() {
  try {
    const mergeEventsDir = path.join(process.cwd(), 'public', 'MergeEvents', 'PROD');
    const files = await fs.readdir(mergeEventsDir);
    
    // Filter for markdown files and sort by date (newest first)
    const markdownFiles = files
      .filter(file => file.endsWith('.md'))
      .sort((a, b) => {
        // Extract dates from filenames for sorting
        const dateA = a.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || '';
        const dateB = b.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || '';
        return dateB.localeCompare(dateA);
      });

    const releases = [];
    
    // Read and parse each file
    for (const file of markdownFiles) {
      try {
        const filePath = path.join(mergeEventsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const releaseData = parseReleaseMarkdown(content, file);
        releases.push(releaseData);
      } catch (fileError) {
        console.error(`Error reading file ${file}:`, fileError);
      }
    }

    return NextResponse.json({ releases });
  } catch (err) {
    console.error('Error reading merge events directory:', err);
    return NextResponse.json(
      { error: 'Unable to load release notes' },
      { status: 500 }
    );
  }
}