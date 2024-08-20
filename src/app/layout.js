import React from 'react';
import Head from 'next/head';

export default function RootLayout({ children }) {
  console.log('-->layout.js')
  return (
    <>
      <Head>
      </Head>
      <html lang="en">
        <body>{children}</body>
      </html>
    </>
  );
}