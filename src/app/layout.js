// JAX MODE
// FULL FILE REPLACEMENT CODE FOR: src/app/layout.js (RootLayout)

import PropTypes from 'prop-types';
import Providers from '@/components/Providers';
import SidebarDrawer from '@/components/UI/SidebarDrawer';
import Script from 'next/script';
import GoogleClientWrapper from '@/components/GoogleAnalytics';
import './globals.css';
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: 'Tango Tiempo - The Ultimate Argentine Tango Calendar',
  description:
    "The United States' first fully dedicated Argentine Tango calendar. Open, easy, and free to use.",
  keywords: 'Argentine Tango, Tango Events, Tango Calendar, Tango Tiempo, Community Calendar, Milonga, Tango Workshop',
  author: 'Toby Balsley of Tango Tiempo',
};

// Separate viewport export
export const viewport = 'width=device-width, initial-scale=1.0';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Metadata */}
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="author" content={metadata.author} />
        <meta name="viewport" content={metadata.viewport} />

        <link rel="icon" href="/Icon64x64.ico" />
        <meta name="facebook-domain-verification" content="39o5h74oasigr7d761a9danhuv0ckg" />
        <meta name="facebook-domain-verification" content="yrlcgyfdipyix2rvt4hafij76nsvmz" />

        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body style={{ display: 'flex' }}>
        {/* Wrap everything in Providers so that SidebarDrawer and its Modals have context */}
        <Providers>
          <SidebarDrawer />
          <div style={{ flexGrow: 1, padding: '1rem' }}>
            <GoogleClientWrapper>{children}</GoogleClientWrapper>
          </div>
        </Providers>
          <Analytics />
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
