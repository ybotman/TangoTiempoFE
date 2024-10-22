'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const VersionPage = () => {
  const [loading, setLoading] = useState(true);
  const [versionData, setVersionData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('versions.json');

        // Check if the response is JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const data = await res.json();

        // Filter out entries that do not have a valid version
        const filteredData = data.filter(
          (item) => item.version && item.version.trim() !== ''
        );

        setVersionData(filteredData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch version data:', err.message);
        setError(`Error fetching version data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Version History</h1>
      <ul>
        {versionData.map((version, index) => (
          <li key={index}>
            <strong>Version: </strong>
            {version.version || 'N/A'} <br />
            <strong>Branch: </strong>
            {version.branch || 'N/A'}
            <ul>
              {version.commits && version.commits.length > 0 ? (
                version.commits.map((commit, i) => <li key={i}>{commit}</li>)
              ) : (
                <li>No commits available</li>
              )}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

// PropTypes validation
VersionPage.propTypes = {
  versions: PropTypes.arrayOf(
    PropTypes.shape({
      version: PropTypes.string.isRequired,
      branch: PropTypes.string,
      commits: PropTypes.arrayOf(PropTypes.string),
    })
  ),
};

export default VersionPage;
