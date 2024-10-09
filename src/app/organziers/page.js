'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const OrganizerLinks = () => {
  const [organizers, setOrganizers] = useState([]);

  useEffect(() => {
    // Fetch the JSON data
    const fetchData = async () => {
      const response = await fetch('/organizersList.json');
      const data = await response.json();
      setOrganizers(data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Organizer Links</h1>
      <ul>
        {organizers.map((organizer) => (
          <li key={organizer.slug}>
            <Link href={`/organziers/${organizer.slug}`}>
              {organizer.slug}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrganizerLinks;
