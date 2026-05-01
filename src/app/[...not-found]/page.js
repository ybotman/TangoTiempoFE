'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Container, Typography, Button, Box, Card, CardContent } from '@mui/material';
import Image from 'next/image';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LoginIcon from '@mui/icons-material/Login';

const NotFoundPage = () => {
  useEffect(() => {
    if (window.gtag) {
      // Track the 404 page view with referrer info
      window.gtag('event', 'page_view', {
        page_path: '/404',
        page_title: '404 Not Found',
        referrer: document.referrer || 'direct',
      });
    }
  }, []);

  return (
    <Container maxWidth="md" style={{ textAlign: 'center', marginTop: '50px', marginBottom: '50px' }}>
      {/* Hero Image */}
      <Image
        src="/brand/Brand-Dark-Wide-404.png"
        alt="Tango Tiempo 404"
        width={1536}
        height={1024}
        priority
        style={{ maxWidth: '100%', height: 'auto', marginBottom: '30px' }}
      />

      {/* Subtext */}
      <Typography variant="h6" style={{ margin: '20px 0 40px 0', color: 'text.secondary' }}>
        The page you&apos;re looking for doesn&apos;t exist. Let us help you get back on track!
      </Typography>

      {/* Links Section */}
      <Box display="flex" flexDirection="column" alignItems="center" gap={3} sx={{ mb: 4 }}>

        {/* TangoTiempo.com */}
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              <HomeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              TangoTiempo.com
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              The United States&apos; premiere Argentine Tango calendar. Discover milongas, festivals, and workshops across the country.
            </Typography>
            <Link href="https://tangotiempo.com" passHref>
              <Button variant="contained" color="primary" fullWidth>
                Visit TangoTiempo.com
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* BostonTangoCalendar.com */}
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              <CalendarMonthIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              BostonTangoCalendar.com
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Your dedicated source for all Argentine Tango events in the Boston area. Find local milongas, classes, and special events.
            </Typography>
            <Link href="https://bostontangocalendar.com" passHref>
              <Button variant="contained" color="secondary" fullWidth>
                Visit BostonTangoCalendar.com
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* TangoTiempo.com Login */}
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              <LoginIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              TangoTiempo.com Login
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Access your account to manage events, view your profile, and connect with the tango community.
            </Typography>
            <Link href="https://tangotiempo.com/auth/signin" passHref>
              <Button variant="outlined" color="primary" fullWidth>
                Login to TangoTiempo
              </Button>
            </Link>
          </CardContent>
        </Card>

      </Box>

      {/* Fallback Calendar Link */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        Or continue to{' '}
        <Link href="/calendar" style={{ textDecoration: 'underline' }}>
          our calendar
        </Link>
      </Typography>
    </Container>
  );
};

export default NotFoundPage;
