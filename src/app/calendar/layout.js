import React from "react";
import PropTypes from "prop-types";

export const metadata = {
  title: 'TangoTiempo',
  description: 'TangoTiempo is a comprehensive platform designed to connect Argentine Tango enthusiasts with events, classes, and workshops across the United States. Whether you’re a beginner looking to dive into the world of tango or an experienced dancer seeking new opportunities to refine your skills, TangoTiempo offers a centralized calendar and community-driven features to support your journey. Stay informed about the latest milongas, prácticas, and festivals in your region, filter events based on your preferences, and interact with organizers. With an intuitive design and robust functionality, TangoTiempo is your go-to resource for all things Argentine Tango. Explore, dance, and immerse yourself in the rich culture of Tango with TangoTiempo.',
  icons: {
    icon: '/TTred.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};