// src/app/api/version/route.js
import { NextResponse } from 'next/server';
import packageJson from '../../../../package.json';

export async function GET() {
  return NextResponse.json({
    version: packageJson.version,
    name: packageJson.name,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
}
