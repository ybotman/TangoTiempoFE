// JAX MODE
// FULL FILE REPLACEMENT CODE FOR: src/app/layout.js (RootLayout)

import PropTypes from 'prop-types';
import Providers from '@/components/Providers';
import SidebarDrawer from '@/components/UI/SidebarDrawer';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import SplashScreen from '@/components/UI/SplashScreen';
import Script from 'next/script';
import './globals.css';
import { Analytics } from "@vercel/analytics/react";
import { Inter } from 'next/font/google';

// Configure Inter font with optimal loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Tango Tiempo - The Premiere Argentine Tango Calendar',
  description:
    "The free global Argentine tango calendar. Find milongas, practicas, workshops, and travel-worthy festivals near you or around the world.",
  keywords: 'Argentine Tango, Tango Events, Tango Calendar, Tango Tiempo, Community Calendar, Milonga, Tango Workshop',
  author: 'Toby Balsley of Tango Tiempo',
  openGraph: {
    title: 'TangoTiempo — The Free Global Argentine Tango Calendar',
    description: 'Find milongas, practicas, workshops, and travel-worthy festivals. Free for dancers. Free for organizers.',
    url: 'https://tangotiempo.com',
    siteName: 'TangoTiempo',
    images: [{
      url: 'https://tangotiempo.com/brand/Brand-MCB-Light-V-WIDE-1.png',
      width: 1200,
      alt: 'TangoTiempo — Move. Connect. Belong.',
    }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TangoTiempo — The Free Global Argentine Tango Calendar',
    description: 'Find milongas, practicas, workshops, and travel-worthy festivals.',
    images: ['https://tangotiempo.com/brand/Brand-MCB-Light-V-WIDE-1.png'],
  },
};

// Separate viewport export
export const viewport = 'width=device-width, initial-scale=1.0';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Metadata */}
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="author" content={metadata.author} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

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
      <body style={{ display: 'flex', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
        <SplashScreen />
        {/* Wrap everything in Providers so that SidebarDrawer and its Modals have context */}
        <Providers>
          <SidebarDrawer />
          <div style={{ flexGrow: 1, padding: '1rem', width: '100%', boxSizing: 'border-box' }}>
            <EmailVerificationBanner />
            {children}
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
