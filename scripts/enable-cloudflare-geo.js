#!/usr/bin/env node

/**
 * Script to enable CloudFlare IP Geolocation
 * This will make CloudFlare add the CF-IPCountry header to all requests
 */

const ZONE_ID = '870bb22bf974457fdbaaff0627fd27d3';

async function checkGeoSettings() {
  console.log('Checking current CloudFlare IP Geolocation settings...\n');
  
  // You'll need to add your CloudFlare API token here
  const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!CF_API_TOKEN) {
    console.error('ERROR: CLOUDFLARE_API_TOKEN environment variable not set');
    console.log('\nTo use this script:');
    console.log('1. Get your CloudFlare API token from: https://dash.cloudflare.com/profile/api-tokens');
    console.log('2. Run: export CLOUDFLARE_API_TOKEN="your-token-here"');
    console.log('3. Run this script again\n');
    return;
  }

  try {
    // Check current settings
    const checkResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/ip_geolocation`,
      {
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const currentSettings = await checkResponse.json();
    console.log('Current settings:', JSON.stringify(currentSettings, null, 2));

    if (!currentSettings.success) {
      console.error('Failed to fetch settings:', currentSettings.errors);
      return;
    }

    const isEnabled = currentSettings.result.value === 'on';
    console.log(`\nIP Geolocation is currently: ${isEnabled ? 'ENABLED' : 'DISABLED'}\n`);

    if (!isEnabled) {
      console.log('Enabling IP Geolocation...');
      
      // Enable IP Geolocation
      const enableResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/ip_geolocation`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${CF_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value: 'on'
          }),
        }
      );

      const result = await enableResponse.json();
      
      if (result.success) {
        console.log('✅ IP Geolocation has been ENABLED successfully!');
        console.log('\nCloudFlare will now add these headers to all requests:');
        console.log('- CF-IPCountry: Two-letter country code (e.g., "US", "GB", "JP")');
        console.log('\nNote: Other headers like CF-IPCity require a paid CloudFlare plan.');
      } else {
        console.error('Failed to enable IP Geolocation:', result.errors);
      }
    } else {
      console.log('✅ IP Geolocation is already enabled.');
      console.log('\nCloudFlare should be adding the CF-IPCountry header to all requests.');
      console.log('\nIf you\'re not seeing the header in local development:');
      console.log('1. CloudFlare headers are only added when requests go through CloudFlare\'s network');
      console.log('2. Local development (localhost) doesn\'t go through CloudFlare');
      console.log('3. Deploy to Vercel/production to see the headers');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the script
checkGeoSettings();