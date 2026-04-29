'use client';

import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';

// TIEMPO-408 T1: shared brand mark primitive.
// Must read clearly at 40px — the source PNG is a high-contrast
// circular silhouette that works at that size.

const SRC = '/brand/Brand-ICON-TT-Light-Invt-CRCL-2.png';

export default function BrandMark({ size = 40, clickable = true, alt = 'TangoTiempo' }) {
  const router = useRouter();
  const onClick = clickable ? () => router.push('/calendar') : undefined;

  return (
    <Box
      onClick={onClick}
      sx={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: clickable ? 'pointer' : 'default',
        flexShrink: 0,
        lineHeight: 0,
      }}
      aria-label={clickable ? `${alt} home` : alt}
      role={clickable ? 'button' : 'img'}
    >
      <Image
        src={SRC}
        alt={alt}
        width={size}
        height={size}
        priority
        style={{ display: 'block' }}
      />
    </Box>
  );
}

BrandMark.propTypes = {
  size: PropTypes.number,
  clickable: PropTypes.bool,
  alt: PropTypes.string,
};
