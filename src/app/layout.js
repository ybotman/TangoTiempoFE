import React from 'react';
import Head from 'next/head';

export default function Layout({ children }) {
  console.log('-->layout.js')
  console.log('API URL:', process.env.NEXT_PUBLIC_AZ_TANGO_API_URL);
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