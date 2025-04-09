// @/about/page.js

import React from 'react';
import styles from '@/styles/About.module.css';
import Link from 'next/link';
import { Button, Box } from '@mui/material';

export const metadata = {
  title: 'Harmony Junction - About Us',
  description:
    'Making Vocal Harmony Communities Better. Harmony Junction is a comprehensive calendar application designed to help a cappella groups, barbershop quartets, Sweet Adelines, and vocal harmony organizers across the nation coordinate and manage events.',
  openGraph: {
    title: 'Harmony Junction - About Us',
    description: 'Learn more about our vocal harmony community',
    url: 'http://HarmonyJunction.org/about',
  },
};

export default function About() {
  return (
    <main className={styles.container}>
      <div>
        <h1>Harmony Junction - Vocal Harmony Community Calendar</h1>
        <h2>Overview</h2>

        <p>
          Welcome to Harmony Junction! We are a comprehensive calendar application designed specifically for a cappella 
          organizations, barbershop quartets, Sweet Adelines, and all vocal harmony groups. Our platform helps organizers 
          coordinate and manage vocal events across various harmony communities. The service is free to use and 
          designed to bring harmony communities together through better event organization and discovery.
          <br />
          <br />
          <h2>
            We are very excited about this site for the Vocal Harmony Community, and hope it brings us all
            together in perfect harmony.{' '}
          </h2>
        </p>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Link href="/calendar" passHref>
            <Button variant="contained" color="primary">
              Go to Calendar
            </Button>
          </Link>
        </Box>
        <p>
          Harmony Junction is a comprehensive calendar application designed specifically for vocal harmony groups including barbershop quartets, 
          Sweet Adelines, a cappella ensembles, and harmony organizations across the nation. The application provides multiple views (calendar, list, and
          upcoming map view) for users to browse vocal events and includes advanced filtering options for a personalized
          experience.
        </p>
        <h3>Features</h3>
        <h4>
          It&lsquo;s free. It&lsquo;s easy, and it&lsquo;s Modern. We just want to help the vocal harmony community. It`&lsquo;s for
          all styles of a cappella and barbershop groups.
        </h4>
        <h4>It&lsquo;s a Mobile app and Web Version. We hope it&lsquo;s highly interactive.</h4>
        <h4>It has Facebook integrations, pinging active users when you cancel an event. Merge with your campaigns.</h4>
        <h4>1. Event Calendar</h4>
        <ul>
          <li>
            <strong>Multiple Views:</strong> Displays events in monthly, weekly, daily, and list formats.
          </li>
          <li>
            <strong>Interactive Events:</strong> Users can click on events to view detailed information in a modal
            popup.
          </li>
          <li>
            <strong>Category-Based Color Coding:</strong> Events are color-coded based on categories such as Milonga,
            Practica, Workshop, and more.
          </li>
        </ul>
        <h4>2. Region-Specific Filtering</h4>
        <ul>
          <li>
            <strong>Dynamic Filtering:</strong> The app supports filtering events by masteredRegion.
          </li>
          <li>
            <strong>Region Selection:</strong> Users can select their masteredRegion from a dropdown, updating the
            calendar to display only relevant events.
          </li>
          <li>
            <strong>Default Region:</strong> The default masteredRegion is set to “BOS” (Boston), but users can change
            this as needed.
          </li>
        </ul>
        <h4>3. Category Filters</h4>
        <ul>
          <li>
            <strong>Advanced Filtering:</strong> Allows users to show or hide events based on categories such as
            Milonga, Practica, Class, etc.
          </li>
          <li>
            <strong>User Customization:</strong> Users can easily toggle between categories to customize their event
            view.
          </li>
        </ul>
        <h4>4. User Roles and Permissions</h4>
        <ul>
          <li>
            <strong>Role-Based Access:</strong> Supports multiple user roles including Anonymous, User, Region
            Organizer, Region Admin, and System Admin.
          </li>
          <li>
            <strong>Security and Permissions:</strong> Grants different levels of access and functionality based on user
            roles.
          </li>
          <li>
            <strong>Region-Specific Permissions:</strong> Security grants can be applied per region to ensure proper
            access control.
          </li>
        </ul>
        <h3>Upcoming Features</h3>
        <ul>
          <li>
            <strong>Map View:</strong> A future feature that will allow users to view events on a map.
          </li>
          <li>
            <strong>Firebase Integration:</strong> Enhancing the app with Firebase for authentication, user roles, and
            permissions management.
          </li>
        </ul>
      </div>
    </main>
  );
}
