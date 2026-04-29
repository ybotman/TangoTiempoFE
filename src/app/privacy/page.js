// app/privacy-policy/page.js

'use client';

import React from 'react';
import Image from 'next/image';
import { Container, Typography, Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

const PrivacyPolicyPage = () => {
  const router = useRouter();

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ padding: 4, marginTop: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Image
            src="/brand/Brand-MCB-Light-V-WIDE-1.png"
            alt="TangoTiempo"
            width={900}
            height={200}
            style={{ width: '100%', height: 'auto', borderRadius: 8 }}
          />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Privacy Policy
        </Typography>

        <Typography variant="h6" component="h2" gutterBottom>
          Our Commitment to Your Privacy
        </Typography>
        <Typography variant="body1" paragraph>
          We value your privacy and are committed to protecting your personal information. This policy outlines what
          data we collect, why we collect it, and how you can manage it. We never sell your information, and we do not
          provide direct access to any personal identifiers outside of our internal administration.
        </Typography>

        <Typography variant="h6" component="h2" gutterBottom>
          Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          To enhance your experience and provide relevant information, we collect:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1" paragraph>
              <strong>City-Level Location Data:</strong> We track city-level location information based on your IP
              address. This allows us to customize your experience by showing relevant regional information and enabling
              organizers to display banners and notifications suitable for your area.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              <strong>User Login, Email, and Author Information:</strong> We securely store your login credentials,
              email address, and author information in our system as unique identifiers. This data is only accessible to
              our site’s administrators and is never sold, shared, or provided to third parties outside of our platform.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              <strong>User-Provided Information:</strong> When you sign up or interact with our services, you may
              provide us with additional details, such as your name, email address, and preferences.
            </Typography>
          </li>
        </ul>

        <Typography variant="h6" component="h2" gutterBottom>
          How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We use the information collected to improve and personalize your experience. Specifically:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1" paragraph>
              <strong>Customized Regional Content:</strong> Using city-level data, we ensure that the information
              displayed to you is relevant to your area, including notifications from local organizers.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              <strong>Notification System:</strong> De-identified data, such as anonymized usage patterns and
              preferences, is used within our platform for sending notifications and updates tailored to your interests.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              <strong>Data Privacy and Protection:</strong> Your personal data, including login and author information,
              is stored securely and is not shared with third parties for marketing or other purposes.
            </Typography>
          </li>
        </ul>

        <Typography variant="h6" component="h2" gutterBottom>
          Your Control Over Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          You retain full control over your data. You can manage your information, update your preferences, or request
          data deletion.
        </Typography>
        <ul>
          <li>
            <Typography variant="body1" paragraph>
              <strong>Access and Update:</strong> You can access and update your personal information in your account
              settings.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              <strong>Data Deletion:</strong> If you wish to delete your data, visit our{' '}
              <a href="/data-deletion">data deletion page</a>.
            </Typography>
          </li>
        </ul>

        <Typography variant="h6" component="h2" gutterBottom>
          Data Security
        </Typography>
        <Typography variant="body1" paragraph>
          We implement industry-standard measures to protect your data. This includes encryption and secure storage,
          ensuring that unauthorized parties cannot access your information.
        </Typography>

        <Typography variant="h6" component="h2" gutterBottom>
          Data Retention
        </Typography>
        <Typography variant="body1" paragraph>
          We retain your data only as long as necessary to provide our services or as legally required. You can request
          data deletion at any time.
        </Typography>

        <Typography variant="h6" component="h2" gutterBottom>
          Changes to This Policy
        </Typography>
        <Typography variant="body1" paragraph>
          We may periodically update this privacy policy. Any changes will be posted on this page and communicated
          through our app as needed.
        </Typography>

        <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button onClick={() => router.back()} variant="contained" color="primary">
            Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PrivacyPolicyPage;
