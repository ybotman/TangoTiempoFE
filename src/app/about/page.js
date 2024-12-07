// src/app/about/page.js

import React from 'react';
import styles from '@/styles/About.module.css';
import Link from 'next/link';
import { Button, Box } from '@mui/material';

export const metadata = {
  title: 'Tango Tiempo - About Us',
  description:
    'Making Argentine Tagno Better for US. Tango Tiempo for the US is a comprehensive calendar application designed to help tango dancers and organizers across the nation coordinate and manage tango events.',
  openGraph: {
    title: 'Tango Tiempo - About Us',
    description: 'Learn more about our company',
    url: 'http://TangoTiempo.com/about',
  },
};

export default function About() {
  return (
    <main className={styles.container}>
      <div>
        <h1>Tango Tiempo - National Tango Calendar App</h1>
        <h2>Overview</h2>

        <p>
          Currently, we are in BETA MODE. I am surprised you found this site! If you are an Argentine Tango teacher /
          host / DJ / studio / etc (meaning, you host events, are a band or a DJ) and are interested in submitting
          events in Tango Tiempo, please contact me. Its free free free, and we hope all of the US is onboard. We hope
          to be fullly live by the end of 2024, and will bring on new Tango regions/ area (one area at a time) in
          January of 2025. If you have found this site, feel free to contact me. Her is my contact info: I will give you
          my TEXT number: Use the Massachusetts area code, (and you have to find it but you can do it), and text me at 6
          5 3 dash 9 4 5 2. Yes, you have to go write this down. ;-) <br />
          <br />
          <h2>
            We are very excited about this site for the American Tango Community, and hope it brings us all together.{' '}
          </h2>{' '}
          This page will self-desruct when we are up and alive.
        </p>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Link href="/calendar" passHref>
            <Button variant="contained" color="primary">
              Go to Calendar
            </Button>
          </Link>
        </Box>
        <p>
          Tango Tiempo is a comprehensive calendar application designed to help tango dancers and organizers across the
          nation coordinate and manage tango events. The application provides multiple views (calendar, list, and
          upcoming map view) for users to browse events and includes advanced filtering options for a personalized
          experience.
        </p>
        <h3>Features</h3>
        <h4>
          It&lsquo;s free. It&lsquo;s easy, and it&lsquo;s Modern. We just want to help the tango world. It`&lsquo;s for
          all of US Argentine Tango.
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
            <strong>Dynamic Filtering:</strong> The app supports filtering events by calculatedRegion.
          </li>
          <li>
            <strong>Region Selection:</strong> Users can select their calculatedRegion from a dropdown, updating the
            calendar to display only relevant events.
          </li>
          <li>
            <strong>Default Region:</strong> The default calculatedRegion is set to “BOS” (Boston), but users can change
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
