'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const VersionsPage = () => {
  const [versionData, setVersionData] = useState(null);

  useEffect(() => {
    // Fetch the version history from the static JSON file
    fetch('/versions.json')
      .then((res) => res.json())
      .then((data) => setVersionData(data));
  }, []);

  return (
    <div>
      <h1>The App Frontend Version History</h1>
      {versionData ? (
        <div>
          {versionData.map((entry, index) => (
            <div key={index}>
              <h2>Version: {entry.version}</h2>
              <h3>Commit History:</h3>
              <ul>
                {entry.commits.map((commit, i) => (
                  <li key={i}>{commit}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading version history...</p>
      )}
    </div>
  );
};

VersionsPage.propTypes = {
  versionData: PropTypes.arrayOf(
    PropTypes.shape({
      version: PropTypes.string.isRequired,
      commits: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ),
};

export default VersionsPage;
