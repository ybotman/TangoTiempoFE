const fs = require('fs');
const { execSync } = require('child_process');

// Helper function to execute shell commands
const runCommand = (command) => execSync(command).toString().trim();

try {
  // Get the current branch name
  const currentBranch = runCommand('git branch --show-current');

  // Get the latest local commits for this branch (you can adjust the count)
  const localCommits = runCommand(
    'git log --pretty=format:"%h - %s" -n 10'
  ).split('\n');

  // Path to versions.json
  const versionsPath = 'public/versions.json';

  // Load the current versions.json file
  const versions = JSON.parse(fs.readFileSync(versionsPath, 'utf8'));

  // Get the last official version number, or default to "1.0.0" if empty
  const lastVersion =
    versions.length > 0 ? versions[versions.length - 1].version : '1.0.0';

  // Remove any existing "local" entry if it exists
  const filteredVersions = versions.filter(
    (v) => v.version !== lastVersion || v.branch !== 'local'
  );

  // Add the "local" version with the same version number as the last official version
  filteredVersions.push({
    version: lastVersion, // Use the last version number
    branch: currentBranch, // Mark it as the current branch
    commits: localCommits, // List of recent commits for this branch
  });

  // Write the updated content back to versions.json
  fs.writeFileSync(versionsPath, JSON.stringify(filteredVersions, null, 2));

  console.log(
    `Updated ${versionsPath} with local commits for branch ${currentBranch}, version ${lastVersion}`
  );
} catch (error) {
  console.error('Error updating versions.json:', error.message);
}
