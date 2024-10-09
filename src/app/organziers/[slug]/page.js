import axios from 'axios';
import slugify from 'slugify';
import Head from 'next/head';
//import Image from 'next/image';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { notFound } from 'next/navigation';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Function to sanitize your HTML
const sanitizeHTML = (htmlString) => {
  return purify.sanitize(htmlString);
};

// Fetch all organizers and generate static params for each
export async function generateStaticParams() {
  try {
    console.log('API URL:', process.env.NEXT_PUBLIC_BE_URL);

    // Fetch regions
    const regionsResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_BE_URL}/api/regions/activeRegions`
    );
    const regions = regionsResponse.data;

    // Fetch organizers
    const organizersResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`
    );
    const organizers = organizersResponse.data;

    const paths = organizers
      .map((org) => {
        // Find the region, division, and city based on the IDs in the organizer
        const region = regions.find((reg) => reg._id === org.organizerRegion);
        const division = region?.divisions?.find(
          (div) => div._id === org.organizerDivision
        );
        const city = division?.majorCities?.find(
          (city) => city._id === org.organizerCity
        );

        // Construct the names based on available data
        const regionName = region
          ? slugify(region.regionName, { lower: true })
          : 'regionunknown';
        const divisionName = division
          ? slugify(division.divisionName, { lower: true })
          : '';
        const cityName = city ? slugify(city.cityName, { lower: true }) : '';

        // Construct the slug in the format: shortName-region-division-city (if available)
        const organizerShortName = slugify(org.shortName, { lower: true });
        let slug = organizerShortName;

        if (regionName) slug += `-${regionName}`;
        if (divisionName) slug += `-${divisionName}`;
        if (cityName) slug += `-${cityName}`;

        return { slug };
      })
      .filter(Boolean); // Filter out any invalid entries

    console.log('Generated paths:', paths);
    return paths;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Fetch data for a specific organizer based on the slug
async function getOrganizerData(slug) {
  try {
    // Fetch regions
    const regionsResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_BE_URL}/api/regions/activeRegions`
    );
    const regions = regionsResponse.data;

    // Fetch organizers
    const organizersResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`
    );
    const organizers = organizersResponse.data;

    // Find the organizer matching the slug
    const organizer = organizers.find((org) => {
      const region = regions.find((reg) => reg._id === org.organizerRegion);
      const division = region?.divisions?.find(
        (div) => div._id === org.organizerDivision
      );
      const city = division?.majorCities?.find(
        (city) => city._id === org.organizerCity
      );

      const regionName = region
        ? slugify(region.regionName, { lower: true })
        : 'regionunknown';
      const divisionName = division
        ? slugify(division.divisionName, { lower: true })
        : '';
      const cityName = city ? slugify(city.cityName, { lower: true }) : '';

      const organizerShortName = slugify(org.shortName, { lower: true });
      let generatedSlug = organizerShortName;

      if (regionName) generatedSlug += `-${regionName}`;
      if (divisionName) generatedSlug += `-${divisionName}`;
      if (cityName) generatedSlug += `-${cityName}`;

      return generatedSlug === slug;
    });

    return organizer || null;
  } catch (error) {
    console.error('Error fetching organizer data:', error);
    return null;
  }
}

// The page component
export default async function OrganizerProfile({ params }) {
  const { slug } = params;
  const organizer = await getOrganizerData(slug);

  if (!organizer) {
    notFound();
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organizer.name,
    url: organizer.url,
    description: organizer.description,
    logo: organizer.images[0]?.imageUrl,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: organizer.publicEmail,
        telephone: organizer.phone,
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{organizer.name} | Tangotiempo</title>
        <meta name="description" content={organizer.description} />
        <meta property="og:title" content={organizer.name} />
        <meta property="og:description" content={organizer.description} />
        <meta property="og:image" content={organizer.images[0]?.imageUrl} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>
      <div>
        <h3>Argentine Organizer : {organizer.name}</h3>
        <p>Region: {organizer.organizerRegion?.name || 'N/A'}</p>
        <p>Division: {organizer.organizerDivision?.name || 'N/A'}</p>
        <p>City: {organizer.organizerCity?.name || 'N/A'}</p>
        <p>
          Website:{' '}
          <a href={organizer.url} target="_blank" rel="noopener noreferrer">
            {organizer.url}
          </a>
        </p>
        <p>Here are the organizers events on region.TangoTempo.shortname</p>
        <p>Email: {organizer.publicEmail}</p>
        <p>Phone: {organizer.phone}</p>
        <p>Region: {organizer.organizerRegion?.name || 'N/A'}</p>
        <p>Division: {organizer.organizerDivision?.name || 'N/A'}</p>
        <p>City: {organizer.organizerCity?.name || 'N/A'}</p>
        <p>Description:</p>
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizeHTML(organizer.description),
          }}
        />
      </div>
      <hr
        style={{
          border: 'none',
          borderTop: '4px solid #ccc',
          margin: '20px 0',
        }}
      />
      <h3>Tango Tiempo Mission:</h3>
      <p>
        Our mission is to create a free comprehensive and inclusive platform for
        all Argentine Tango enthusiasts, including event organizers, DJs, and
        bands. We aim to connect the community, promote events, and make it easy
        for everyone to find and participate in tango activities across
        different regions.
      </p>
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid #ccc',
          margin: '20px 0',
        }}
      />

      <p>
        If you are an organizer of Argentine Tango events (or a DJ / Band), we
        would love for you to join TangoTiempo site. It is free, and you can
        sign up at :
        <a
          href="https://www.tangotiempo.com/OrganizerApply"
          target="_blank"
          rel="noreferrer"
        >
          www.tangotiempo.com/OrganizerApply
        </a>
        .<br /> .<br />
        We are also looking for open and unbiased regional admins for the US
        board review for onboarding resolving small issues, in general to help
        us manage events and organizers in your area. If you are interested,
        please contact us at :
        <a
          href="https://www.tangotiempo.com/AdminApply"
          target="_blank"
          rel="noreferrer"
        >
          www.tangotiempo.com/AdminApply
        </a>
      </p>
    </>
  );
}
