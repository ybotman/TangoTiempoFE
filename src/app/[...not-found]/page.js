'use client';

import Link from 'next/link';
import { Container, Typography, Button, Box } from '@mui/material';
import Image from 'next/image';

const NotFoundPage = () => {
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
        The page you are looking for doesn&lsquo;t exist. We will go fix this soon! Let us help you get back on
        track!
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Link href="/calendar" passHref>
          <Button variant="contained" color="primary">
            Go to Calendar
          </Button>
        </Link>
        <Link href="/signin" passHref>
          <Button variant="contained" color="primary">
            Sign In
          </Button>
        </Link>
        <Link href="/help" passHref>
          <Button variant="contained" color="primary">
            Help
          </Button>
        </Link>
        <Link href="/OrganizerApply" passHref>
          <Button variant="contained" color="primary">
            Join as an Organizer
          </Button>
        </Link>
        <Link href="/adminMessage" passHref>
          <Button variant="contained" color="primary">
            Message Us
          </Button>
        </Link>
      </Box>
    </Container>
  );
};

export default NotFoundPage;