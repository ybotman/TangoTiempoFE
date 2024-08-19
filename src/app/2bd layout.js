"use client"; // Add this line at the top
import React from 'react';

import SiteHeader from '@/components/UI/SiteHeader';

export default function RootLayout({ children }) {
  return (
    <div>
      {children} {/* This is where your page content will be rendered */}
    </div>
  );
};