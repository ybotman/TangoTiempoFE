// JAX MODE
// FULL FILE REPLACEMENT CODE FOR: src/app/layout.js (RootLayout)

import PropTypes from 'prop-types';
import Providers from '@/components/Providers';
import SidebarDrawer from '@/components/UI/SidebarDrawer';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
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
    "The United States' first fully dedicated Argentine Tango calendar. Open, easy, and free to use.",
  keywords: 'Argentine Tango, Tango Events, Tango Calendar, Tango Tiempo, Community Calendar, Milonga, Tango Workshop',
  author: 'Toby Balsley of Tango Tiempo',
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

        {/* TIEMPO-368: HTML-level version check - runs BEFORE React loads to catch stale cached bundles */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var CHECK_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours
                  var STORAGE_KEY_VERSION = 'tt_app_version';
                  var STORAGE_KEY_LAST_CHECK = 'tt_version_last_check';

                  var lastCheck = parseInt(localStorage.getItem(STORAGE_KEY_LAST_CHECK) || '0', 10);
                  var now = Date.now();

                  // Only check if more than 2 hours since last check
                  if (now - lastCheck < CHECK_INTERVAL_MS) {
                    return;
                  }

                  // Fetch version.json with cache-busting
                  var xhr = new XMLHttpRequest();
                  xhr.open('GET', '/version.json?t=' + now, true);
                  xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                      try {
                        var serverVersion = JSON.parse(xhr.responseText);
                        var storedVersion = localStorage.getItem(STORAGE_KEY_VERSION);

                        // Update last check time
                        localStorage.setItem(STORAGE_KEY_LAST_CHECK, String(now));

                        if (storedVersion && storedVersion !== serverVersion.version) {
                          console.log('[TIEMPO-368] Version mismatch! Stored:', storedVersion, 'Server:', serverVersion.version);
                          console.log('[TIEMPO-368] Forcing page refresh...');
                          localStorage.setItem(STORAGE_KEY_VERSION, serverVersion.version);
                          window.location.reload();
                        } else {
                          // Store current version for future checks
                          localStorage.setItem(STORAGE_KEY_VERSION, serverVersion.version);
                        }
                      } catch (e) {
                        console.warn('[TIEMPO-368] Version check parse error:', e);
                      }
                    }
                  };
                  xhr.send();
                } catch (e) {
                  console.warn('[TIEMPO-368] Version check error:', e);
                }
              })();
            `,
          }}
        />

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
