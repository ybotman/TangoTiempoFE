const fs = require('fs');
const { execSync } = require('child_process');

// Function to run shell commands and return output as a string
const runCommand = (command) => execSync(command).toString().trim();

try {
  // Get the current branch name
  const currentBranch = runCommand('git branch --show-current');

  // Get the latest local commits for this branch (customize the number as needed)
  const localCommits = runCommand('git log --pretty=format:"%h - %s" -n 10').split('\n');

  // Path to versions.json
  const versionsPath = 'public/versions.json';

  // Load the existing versions.json file
  const versions = JSON.parse(fs.readFileSync(versionsPath, 'utf8'));

  // Remove any existing "local" version entry to keep the latest info
  const filteredVersions = versions.filter(v => v.version !== 'local');

  // Add the new "local" version entry with branch name and commits
  filteredVersions.push({
    version: 'local',
    branch: currentBranch,
    commits: localCommits,
  });

  // Write the updated data back to versions.json
  fs.writeFileSync(versionsPath, JSON.stringify(filteredVersions, null, 2));

  console.log(`Updated ${versionsPath} with local commits for branch ${currentBranch}`);

} catch (error) {
  console.error("Error updating versions.json:", error.message);
}