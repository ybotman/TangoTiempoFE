import PropTypes from 'prop-types';
import Providers from '@/components/Providers';
import SidebarDrawer from '@/components/UI/SidebarDrawer';
import Script from 'next/script';
import GoogleClientWrapper from '@/components/GoogleAnalytics';
import LocationLogger from '@/components/LocationLogger';

export const metadata = {
  title: 'Tango Tiempo - The National Tango Calendar',
  description: 'Stay up-to-date with Tango events across the country with Tango Tiempo.',
  keywords: 'Tango, Tango Events, National Tango Calendar, Tango Tiempo, Dance Calendar',
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
        <SidebarDrawer />
        <div style={{ flexGrow: 1, padding: '1rem' }}>
          <Providers>
            <LocationLogger />
            <GoogleClientWrapper>{children}</GoogleClientWrapper>
          </Providers>
        </div>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
