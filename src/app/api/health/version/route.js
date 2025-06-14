import { NextResponse } from 'next/server';
import packageJson from '../../../../../package.json';

export async function GET() {
  const buildTime = process.env.BUILD_TIME || 'development';
  const nodeEnv = process.env.NODE_ENV || 'development';
  const nextPublicEnv = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
  
  // Get backend URL and app ID
  const backendUrl = process.env.NEXT_PUBLIC_BE_URL || 'not-configured';
  const appId = process.env.NEXT_PUBLIC_APPLICATION_ID || 'not-configured';
  
  // Get Git commit info if available
  const gitCommit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || 'local';
  const gitBranch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GIT_BRANCH || 'local';
  
  return NextResponse.json({
    status: 'healthy',
    service: 'tangotiempo-frontend',
    version: packageJson.version,
    name: packageJson.name,
    environment: {
      NODE_ENV: nodeEnv,
      NEXT_PUBLIC_ENVIRONMENT: nextPublicEnv,
      BUILD_TIME: buildTime
    },
    config: {
      backend_url: backendUrl,
      application_id: appId,
      firebase_configured: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      google_analytics_configured: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    },
    git: {
      commit: gitCommit.substring(0, 7),
      branch: gitBranch
    },
    timestamp: new Date().toISOString()
  });
}