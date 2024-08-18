import React from 'react';
import Image from 'next/image';

const SiteHeader = () => {
    return (
        <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
            <Image
                src="/TangoTiempo4.jpg"
                alt="Tango Tiempo"
                width={1200} // specify a width
                height={600} // specify a height
                style={{ width: '100%', height: 'auto' }} // keep aspect ratio
                priority // for loading optimization
            />
            <a
                href="https://www.buymeacoffee.com/ybotman"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(0, 255, 255, 0.7)', // Cyan background with 30% transparency
                    color: '#000',
                    padding: '5px 10px', // Smaller padding
                    borderRadius: '3px', // Flatter border radius
                    textDecoration: 'none',
                    fontWeight: 'normal',
                    fontSize: '12px', // Smaller font size
                }}
            >
                Share a Tanda
            </a>
        </div>
    );
};

export default SiteHeader;