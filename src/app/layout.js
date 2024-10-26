// src/app/layout.js
import PropTypes from 'prop-types';
import Providers from '@/components/Providers';
import SidebarDrawer from '@/components/UI/SidebarDrawer';
import GoogleAnalytics from '@/components/GoogleAnalytics';

export const metadata = {
  title: 'TangoTiempo',
  description:
    'TangoTiempo is a free and comprehensive platform designed to connect Argentine Tango enthusiasts with events, classes, and workshops across the United States. Whether you’re a beginner looking to dive into the world of tango or an experienced dancer seeking new opportunities to refine your skills, TangoTiempo offers a centralized calendar and community-driven features to support your journey. Stay informed about the latest milongas, prácticas, and festivals in your calculatedRegion, filter events based on your preferences, and interact with organizers. With an intuitive design and robust functionality, TangoTiempo is your go-to resource for all things Argentine Tango. Explore, dance, and immerse yourself in the rich culture of Tango with TangoTiempo.    We are in beta mode, and are happy to to talk about getting you or your area in the Calendar.',
  icons: {
    icon: '/TangoHandsIcon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="9-iN-M_jYek3o85ZM0bAdxIymaaicjFz7k1usKSTgt0"
        />
      </head>
      <body style={{ display: 'flex' }}>
        {/* Sidebar Drawer */}
        <SidebarDrawer />

        {/* Main Content Area */}
        <div style={{ flexGrow: 1, padding: '1rem' }}>
          <GoogleAnalytics />
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
