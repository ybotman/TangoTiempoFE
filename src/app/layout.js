// src/app/layout.js
import PropTypes from 'prop-types';
import Providers from '@/components/Providers';
import SidebarDrawer from '@/components/UI/SidebarDrawer';
import Script from 'next/script';
import GoogleClientWrapper from '@/components/GoogleAnalytics';

export const metadata = {
  // ... your metadata
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Facebook Domain Verification */}
        <meta
          name="facebook-domain-verification"
          content="39o5h74oasigr7d761a9danhuv0ckg"
        />
        <meta
          name="facebook-domain-verification"
          content="yrlcgyfdipyix2rvt4hafij76nsvmz"
        />

        {/* Google Analytics Script */}
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
        {/* Sidebar Drawer */}
        <SidebarDrawer />

        {/* Main Content Area */}
        <div style={{ flexGrow: 1, padding: '1rem' }}>
          <Providers>
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
