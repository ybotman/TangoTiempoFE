// src/app/organizer/[slug]/page.js

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import slugify from 'slugify';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { notFound } from 'next/navigation';
import winston from 'winston';
import PropTypes from 'prop-types';

// Set up logging with Winston
const logger = winston.createLogger({
  level: 'info', // Set the logging level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // Add other transports if needed, e.g., File transport
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Set up DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Function to sanitize HTML
const sanitizeHTML = (htmlString) => {
  return purify.sanitize(htmlString);
};

// Fetch all organizers and generate static params for each
export async function generateStaticParams() {
  try {
    const beUrl = process.env.NEXT_PUBLIC_BE_URL;
    const timeout =
      Number(process.env.NEXT_PUBLIC_STATIC_PAGE_GENERATION_TIMEOUT || '120') *
      1000;

    logger.info('Starting generateStaticParams');
    logger.info(`Backend URL: ${beUrl}`);
    logger.info(`Timeout: ${timeout}`);

    // Fetch regions
    const regionsResponse = await axios.get(
      `${beUrl}/api/regions/activeRegions`,
      {
        timeout,
      }
    );
    const regions = regionsResponse.data;
    logger.info(`Fetched ${regions.length} regions`);

    // Fetch organizers
    const organizersResponse = await axios.get(`${beUrl}/api/organizers`, {
      timeout,
    });
    const organizers = organizersResponse.data;
    logger.info(`Fetched ${organizers.length} organizers`);

    const paramsList = [];
    const organizersDataList = [];

    organizers.forEach((org) => {
      // Find region, division, city names
      const region = regions.find((reg) => reg._id === org.organizerRegion);
      const division = region?.divisions.find(
        (div) => div._id === org.organizerDivision
      );
      const city = division?.majorCities.find(
        (c) => c._id === org.organizerCity
      );

      const regionNameSlug = region
        ? slugify(region.regionName, { lower: true })
        : 'unknown-region';
      const divisionNameSlug = division
        ? slugify(division.divisionName, { lower: true })
        : 'unknown-division';
      const cityNameSlug = city
        ? slugify(city.cityName, { lower: true })
        : 'unknown-city';
      const organizerShortNameSlug = slugify(org.shortName, { lower: true });

      // Generate slug
      const slug = `${organizerShortNameSlug}-${regionNameSlug}-${divisionNameSlug}-${cityNameSlug}`;

      // Add to params list
      paramsList.push({ slug });

      // Collect organizer data
      organizersDataList.push({
        id: org._id,
        slug,
        name: org.name,
        shortName: org.shortName,
        description: org.description,
        images: org.images,
        phone: org.phone,
        publicEmail: org.publicEmail,
        url: org.url,
        regionName: region?.regionName || 'Unknown Region',
        divisionName: division?.divisionName || 'Unknown Division',
        cityName: city?.cityName || 'Unknown City',
        // Add other necessary fields if needed
      });
    });

    // Save organizers data to JSON file
    const filePath = path.join(process.cwd(), 'public', 'organizersList.json');
    fs.writeFileSync(filePath, JSON.stringify(organizersDataList, null, 2));
    logger.info(`Organizers data saved to ${filePath}`);

    return paramsList;
  } catch (error) {
    logger.error('Error in generateStaticParams', { error: error.message });
    return [];
  }
}

// Function to get organizer data based on slug
async function getOrganizerData(slug) {
  logger.info(`Fetching organizer data for slug: ${slug}`);
  try {
    const filePath = path.join(process.cwd(), 'public', 'organizersList.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const organizersDataList = JSON.parse(data);

    const organizer = organizersDataList.find((org) => org.slug === slug);

    return organizer || null;
  } catch (error) {
    logger.error('Error in getOrganizerData', { error: error.message });
    return null;
  }
}

// Function to generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = params;
  const organizer = await getOrganizerData(slug);

  if (!organizer) {
    return {};
  }

  return {
    title: `${organizer.name} | TangoTiempo`,
    description: organizer.description,
    openGraph: {
      title: organizer.name,
      description: organizer.description,
      images: [
        {
          url:
            organizer.images && organizer.images.length > 0
              ? organizer.images[0].imageUrl
              : '/default-image.jpg',
        },
      ],
    },
  };
}

// The page component
export default async function OrganizerProfile({ params }) {
  const { slug } = params;
  const organizer = await getOrganizerData(slug);

  if (!organizer) {
    notFound();
  }

  logger.info(`Rendering profile for organizer: ${organizer.name}`);

  // Create structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organizer.name,
    url: organizer.url,
    description: organizer.description,
    logo:
      organizer.images && organizer.images.length > 0
        ? organizer.images[0].imageUrl
        : null,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: organizer.publicEmail,
        telephone: organizer.phone,
      },
    ],
  };

  // Render the page
  return (
    <div>
      {/* Structured Data Script */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Organizer Content */}
      <div>
        {organizer.images && organizer.images.length > 0 && (
          <Image
            src={organizer.images[0].imageUrl}
            alt={organizer.name}
            width={800}
            height={600}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        )}
        <p>
          A Tango professional/organizer/studio/teacher registered on
          TangoTiempo.com:
        </p>
        <h3>Argentine Tango Organizer: {organizer.name}</h3>
        <p>Region: {organizer.regionName}</p>
        <p>Division: {organizer.divisionName}</p>
        <p>City: {organizer.cityName}</p>
        <p>
          Website:{' '}
          <a href={organizer.url} target="_blank" rel="noopener noreferrer">
            {organizer.url}
          </a>
        </p>
        <p>Email: {organizer.publicEmail}</p>
        <p>Phone: {organizer.phone}</p>
        <p>Description:</p>
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizeHTML(organizer.description),
          }}
        />
      </div>

      {/* Additional Content */}
      <hr
        style={{
          border: 'none',
          borderTop: '4px solid #ccc',
          margin: '20px 0',
        }}
      />
      <h3>TangoTiempo Mission:</h3>
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
        If you are an organizer of Argentine Tango events (or a DJ/Band), we
        would love for you to join the TangoTiempo site. It is free, and you can
        sign up at:{' '}
        <a
          href="https://www.tangotiempo.com/OrganizerApply"
          target="_blank"
          rel="noreferrer"
        >
          www.tangotiempo.com/OrganizerApply
        </a>
        .<br />
        We are also looking for open and unbiased regional admins for the US
        board review for onboarding and resolving small issues, in general, to
        help us manage events and organizers in your area. If you are
        interested, please contact us at:{' '}
        <a
          href="https://www.tangotiempo.com/AdminApply"
          target="_blank"
          rel="noreferrer"
        >
          www.tangotiempo.com/AdminApply
        </a>
      </p>
    </div>
  );
}

OrganizerProfile.propTypes = {
  params: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
};
