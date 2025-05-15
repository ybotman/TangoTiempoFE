'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Container, Typography, Button, Box } from '@mui/material';
import Image from 'next/image';

const NotFoundPage = () => {
  useEffect(() => {
    if (window.gtag) {
      // Track the 404 page view with referrer info
      window.gtag('event', 'page_view', {
        page_path: '/404',
        page_title: '404 Not Found',
        referrer: document.referrer || 'direct', // Capture referrer or mark as direct if none
      });
    }
  }, []);

  return (
    <Container style={{ textAlign: 'center', marginTop: '50px' }}>
      <Image
        src="/404-tango.webp"
        alt="Tango 404 Image"
        width={600}
        height={400}
        priority
        style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }}
      />
      <Typography variant="h3" component="h1" gutterBottom>
        Oops! Looks like we boleo-ed against the Line of Dance.
      </Typography>
      <Typography variant="h6" style={{ margin: '20px 0' }}>
        The page you are looking for doesn&lsquo;t exist. We will go fix this soon! Let us help you get back on track!
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Link href="/calendar" passHref>
          <Button variant="contained" color="primary">
            Go to Calendar
          </Button>
        </Link>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
