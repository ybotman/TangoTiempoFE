import fs from 'fs';
import path from 'path';
import axios from 'axios';
import slugify from 'slugify';
import Head from 'next/head';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { notFound } from 'next/navigation';

const window = new JSDOM('').window;
const purify = DOMPurify(window);
const staticPageGenerationTimeout =
  process.env.NEXT_PUBLIC_STATIC_PAGE_GENERATION_TIMEOUT || 120;

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
      `${process.env.NEXT_PUBLIC_BE_URL}/api/regions/activeRegions`,
      {
        timeout: staticPageGenerationTimeout * 1000, // Convert to milliseconds
      }
    );
    const regions = regionsResponse.data;

    // Fetch organizers
    const organizersResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`,
      {
        timeout: staticPageGenerationTimeout * 1000, // Convert to milliseconds
      }
    );
    const organizers = organizersResponse.data;

    const hierarchy = regions.map((region) => {
      return {
        region: region.regionName,
        divisions: region.divisions.map((division) => {
          return {
            divisionName: division.divisionName,
            cities: division.majorCities.map((city) => {
              const cityOrganizers = organizers.filter(
                (org) => org.organizerCity === city._id
              );
              return {
                cityName: city.cityName,
                organizers: cityOrganizers.map((org) => ({
                  name: org.name,
                  slug: `${slugify(org.shortName, { lower: true })}-${slugify(region.regionName, { lower: true })}-${slugify(division.divisionName, { lower: true })}-${slugify(city.cityName, { lower: true })}`,
                })),
              };
            }),
          };
        }),
      };
    });

    // Save the hierarchy to JSON
    const filePath = path.join(process.cwd(), 'public', 'organizersList.json');
    fs.writeFileSync(filePath, JSON.stringify(hierarchy, null, 2));

    return organizers.map((org) => ({
      slug: org.slug,
    }));
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
        {organizer.images[0] && (
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
          TangoTiempo.com :
        </p>
        <h3>Argentine Tango Organizer : {organizer.name}</h3>
        <p>Region: {organizer.organizerRegion?.name || 'N/A'}</p>
        <p>Division: {organizer.organizerDivision?.name || 'N/A'}</p>
        <p>City: {organizer.organizerCity?.name || 'N/A'}</p>
        <p>
          Website:{' '}
          <a href={organizer.url} target="_blank" rel="noopener noreferrer">
            {organizer.url}
          </a>
        </p>
        <p>
          Here are the organizer&lsquo;s events on region.TangoTempo.shortname
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
        would love for you to join the TangoTiempo site. It is free, and you can
        sign up at:
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
        interested, please contact us at:
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
