// src/app/utils/commitVersions.js

import fs from 'fs';
import { execSync } from 'child_process';

// Helper function to execute shell commands
const runCommand = (command) => execSync(command).toString().trim();

try {
  // Get the current branch name
  const currentBranch = runCommand('git branch --show-current');

  // Get the latest local commits for this branch
  const localCommits = runCommand(
    'git log --pretty=format:"%h - %s" -n 10'
  ).split('\n');

  // Path to versions.json
  const versionsPath = new URL(
    '../../../public/versions.json',
    import.meta.url
  );

  // Load the current versions.json file
  const versions = JSON.parse(fs.readFileSync(versionsPath, 'utf8'));

  // Get the last official version number, or default to "1.0.0" if empty
  const lastVersion =
    versions.length > 0 ? versions[versions.length - 1].version : '1.0.0';

  // Remove any existing "local" entry
  const filteredVersions = versions.filter(
    (v) => v.version !== lastVersion || v.branch !== 'local'
  );

  // Add the "local" version with the same version number as the last official version
  filteredVersions.push({
    version: lastVersion,
    branch: currentBranch,
    commits: localCommits,
  });

  // Write the updated data back to versions.json
  fs.writeFileSync(versionsPath, JSON.stringify(filteredVersions, null, 2));

  console.log(
    `Updated ${versionsPath} with local commits for branch ${currentBranch}, version ${lastVersion}`
  );
} catch (error) {
  console.error('Error updating versions.json:', error.message);
}



