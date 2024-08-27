"use client";
import React, { useEffect } from 'react';
import { CldImage } from 'next-cloudinary';

export default function Page() {

    return (
        <div>
            <h1>Testing Cloudinary Integration</h1>
            <CldImage
                src="cld-sample-4"
                width="500"
                height="500"
                alt="Sample Image"
                priority
            />
        </div>
    );
}