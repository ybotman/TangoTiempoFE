import OrganizerApplicationPortal from './components/OrganizerApplicationPortal';

export const metadata = {
  title: 'Become a TangoTiempo Organizer | Apply Now',
  description: 'Join TangoTiempo as an organizer. Apply to list your milongas, practicas, classes, or become a venue, DJ, teacher, maestro, orchestra, or musician in the global tango community.',
  keywords: 'tango organizer, milonga organizer, tango DJ, tango teacher, tango venue, argentine tango events, tango maestro, tango orchestra, tango musician, regional admin',
  openGraph: {
    title: 'Become a TangoTiempo Organizer',
    description: 'Join our community of tango event organizers, venues, DJs, teachers, maestros, orchestras, and musicians worldwide.',
    type: 'website',
    url: 'https://tangotiempo.com/organizers/apply',
    images: [
      {
        url: '/images/organizer-apply-og.jpg',
        width: 1200,
        height: 630,
        alt: 'TangoTiempo Organizer Application'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become a TangoTiempo Organizer',
    description: 'Apply to join our global tango community as an event organizer, venue, DJ, teacher, or musician.',
    images: ['/images/organizer-apply-twitter.jpg']
  },
  alternates: {
    canonical: 'https://tangotiempo.com/organizers/apply'
  }
};

const OrganizerApplyPage = () => {
  return <OrganizerApplicationPortal />;
};

export default OrganizerApplyPage;
