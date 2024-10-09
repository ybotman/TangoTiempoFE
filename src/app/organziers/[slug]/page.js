import axios from 'axios';
import slugify from 'slugify';
import Head from 'next/head';
import Image from 'next/image';
import { notFound } from 'next/navigation';

// Fetch all organizers and generate static params for each
export async function generateStaticParams() {
  try {
    console.log('API URL:', process.env.NEXT_PUBLIC_BE_URL); // Log the API URL to verify it's correct

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`
    );
    const organizers = response.data;

    const paths = organizers
      .map((org) => {
        const organizerShortName = org.shortName
          ? slugify(org.shortName, { lower: true })
          : 'unknown-organizer';

        return { slug: organizerShortName };
      })
      .filter(Boolean); // Filter out any null entries

    console.log('Generated paths:', paths); // Log the paths being generated

    return paths;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Fetch data for a specific organizer based on the slug
async function getOrganizerData(slug) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BE_URL}/api/organizers`
    );
    const organizers = response.data;

    // Find the organizer matching the slug (based on shortName)
    const organizer = organizers.find((org) => {
      const organizerShortName = org.shortName
        ? slugify(org.shortName, { lower: true })
        : '';
      return organizerShortName === slug;
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
    // Return a 404 page if no data is found
    notFound();
  }

  // Define structured data for SEO and metadata
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
        <h1>{organizer.name}</h1>
        {organizer.images[0]?.imageUrl && (
          <Image
            src={organizer.images[0].imageUrl}
            alt="Organizer Image"
            width={800}
            height={600}
            layout="responsive"
          />
        )}
        <p>
          Last updated: {new Date(organizer.lastActivity).toLocaleDateString()}
        </p>
        <p>City: {organizer.organizerCity?.name}</p>
        <p>Division: {organizer.organizerDivision?.name}</p>
        <p>
          Website: <a href={organizer.url}>{organizer.url}</a>
        </p>
        <p>Email: {organizer.publicEmail}</p>
        <p>Phone: {organizer.phone}</p>
        <p>Description: {organizer.description}</p>
      </div>
    </>
  );
}
