//app/components/UI/SiteHeader.js

import React from 'react';
import Image from 'next/image';

const SiteHeader = () => {
    // Assuming run_number is passed as a prop or can be fetched in this component
    const runNumber = process.env.NEXT_PUBLIC_BUILD_VERSION || 'Local'; // Fallback value if not set

    return (
        <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
            <Image
                src="/TangoTiempoColorFull.png"
                alt="Tango Tiempo"
                width={1200}
                height={600}
                style={{ width: '100%', height: 'auto' }}
                priority
            />
            <a
                href="https://www.buymeacoffee.com/ybotman"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(0, 255, 255, 0.7)',
                    color: '#000',
                    padding: '5px 10px',
                    borderRadius: '3px',
                    textDecoration: 'none',
                    fontWeight: 'normal',
                    fontSize: '12px',
                }}
            >
                Gift an Empanada
            </a>
            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    width: '100%',
                    textAlign: 'center',
                    color: 'white',
                    fontSize: '12px',
                    opacity: '0.8', // Slight transparency to keep it inconspicuous
                }}
            >
                {runNumber}
            </div>
        </div>
    );
};

export default SiteHeader;