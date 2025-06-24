// @/about/page.js

import React from 'react';
import styles from '@/styles/About.module.css';
import Link from 'next/link';
import { Button, Box, Typography } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';

export const metadata = {
  title: 'Tango Tiempo - About Us',
  description:
    'We connect Argentine Tango communities across the United States. Tango Tiempo is a comprehensive calendar application designed to help tango dancers and organizers nationwide coordinate and manage tango events.',
  openGraph: {
    title: 'Tango Tiempo - About Us',
    description: 'We connect Argentine Tango communities across the United States. Tango Tiempo is a comprehensive calendar application designed to help tango dancers and organizers nationwide coordinate and manage tango events.',
    url: 'http://TangoTiempo.com/about',
  },
};

export default function About() {
  return (
    <main className={styles.container}>
      <div>
        <h1>Welcome to Tango Tiempo</h1>
        <h2>America&apos;s Argentine Tango Calendar</h2>

        <p>
          Tango Tiempo is the free national hub for Argentine tango events. Whether you&apos;re dancing in New Mexico, attending festivals in San Francisco, teaching in Boston, or organizing events in Chicago — this is your place. Our platform is <strong>Live</strong>, <strong>Free</strong>, and managed by tango organizers across the United States. It features <strong>AI discovery</strong> to help dancers find the best tango experiences anywhere in the U.S.
        </p>

        <p>
          We&apos;re actively engaging tango organizers throughout the United States, expanding city by city. If you host any type of tango events (festivals, milongas, practicas, etc.), are a traveling teacher &quot;Maestro&quot; or tango performer, have a local tango band, or teach Argentine tango — you belong on this site. Just login and apply. It&apos;s always free to search and find events (with some upcoming paid services like targeted event promotions and other advanced features). We want to make tango easier to find, attend, and support. Just click the apply button. Here&apos;s a little secret: it&apos;s automatically approved, but we do use AI to verify events follow our tango guidelines.
        </p>

        <p>
          <strong>Want to get in touch?</strong> Connect with us through:
        </p>
        
        <Box display="flex" flexDirection="row" justifyContent="center" gap={2} mb={3}>
          <Button
            variant="contained"
            startIcon={<FacebookIcon />}
            sx={{ backgroundColor: '#1877F2', '&:hover': { backgroundColor: '#145dbf' } }}
            href="https://www.facebook.com/tangotiempo"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook Messenger
          </Button>
          <Button
            variant="contained"
            startIcon={<WhatsAppIcon />}
            sx={{ backgroundColor: '#25D366', '&:hover': { backgroundColor: '#1fb855' } }}
            href="https://wa.me/message/3E5LRY7JUHE2O1"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </Button>
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Link href="/calendar" passHref>
            <Button variant="contained" color="primary">
              View the Live Calendar
            </Button>
          </Link>
        </Box>

        <h3>What Makes Tango Tiempo Different?</h3>
        <ul>
          <li><strong>Free & Always Will Be:</strong> Our core calendar is free to use, with no strings attached.</li>
          <li><strong>Nationwide Scope:</strong> Discover milongas, practicas, classes, and festivals coast to coast.</li>
          <li><strong>AI Discovery:</strong> Smart filters and regional views help you find what you love.</li>
          <li><strong>Mobile-First:</strong> Use it from your phone, your laptop, or wherever you check your dance plans.</li>
        </ul>

        <h3>Our Mission</h3>
        <p>
          Our mission is to unite and strengthen the U.S. tango community by providing a comprehensive, accessible, and free platform for discovering and sharing tango events. We believe that by connecting dancers, organizers, and venues across the country, we can help Argentine tango thrive in every corner of America.
        </p>

        <p>
          Tango Tiempo is built to unite the U.S. tango community. From small practicas to national encuentros, we&apos;re here to support connection through dance.
        </p>

        <h3>About Our Logo</h3>
        <p>
          The Tango Tiempo logo represents the timeless connection between dance partners and the rhythmic pulse of tango music. 
          The flowing design captures the elegance and passion of Argentine tango, while the modern aesthetic reflects our 
          commitment to bringing this traditional dance into the digital age. Our logo embodies the spirit of community, 
          movement, and the shared moments that make tango special.
        </p>
        
        <p>
          We do not sell your data. We are not ad-driven. We just believe tango deserves better tools.
        </p>
      </div>
    </main>
  );
}