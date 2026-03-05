// On-Demand ISR Revalidation API - Phase 4 SEO Implementation
// Triggered by backend webhooks when events/venues are created/updated

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// Validate the authorization token
function validateAuth(request) {
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret) {
    console.error('[Revalidate] REVALIDATE_SECRET environment variable not set');
    return false;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  return token === expectedSecret;
}

// POST /api/revalidate
// Body: { type: "event" | "venue" | "organizer", id: string, paths?: string[] }
export async function POST(request) {
  try {
    // Validate authentication
    if (!validateAuth(request)) {
      console.warn('[Revalidate] Unauthorized revalidation attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, id, paths } = body;

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type' },
        { status: 400 }
      );
    }

    const revalidatedPaths = [];
    const errors = [];

    // If specific paths are provided, revalidate those
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        try {
          revalidatePath(path);
          revalidatedPaths.push(path);
        } catch (err) {
          console.error(`[Revalidate] Failed to revalidate path: ${path}`, err);
          errors.push({ path, error: err.message });
        }
      }
    } else {
      // Otherwise, determine paths based on type and id
      switch (type) {
        case 'event':
          if (id) {
            try {
              revalidatePath(`/event/${id}`);
              revalidatedPaths.push(`/event/${id}`);
            } catch (err) {
              errors.push({ path: `/event/${id}`, error: err.message });
            }
          }
          // Also revalidate the calendar page and landing page
          try {
            revalidatePath('/calendar');
            revalidatedPaths.push('/calendar');
            revalidatePath('/tango');
            revalidatedPaths.push('/tango');
          } catch (err) {
            errors.push({ path: '/calendar', error: err.message });
          }
          break;

        case 'venue':
          if (id) {
            try {
              revalidatePath(`/venue/${id}`);
              revalidatedPaths.push(`/venue/${id}`);
            } catch (err) {
              errors.push({ path: `/venue/${id}`, error: err.message });
            }
          }
          break;

        case 'organizer':
          // Organizer pages use slug, not id, so we need to revalidate by path
          // The caller should provide the paths array for organizers
          console.warn('[Revalidate] Organizer type requires paths array');
          break;

        case 'sitemap':
          // Revalidate the sitemap
          try {
            revalidatePath('/sitemap.xml');
            revalidatedPaths.push('/sitemap.xml');
          } catch (err) {
            errors.push({ path: '/sitemap.xml', error: err.message });
          }
          break;

        default:
          return NextResponse.json(
            { error: `Unknown type: ${type}` },
            { status: 400 }
          );
      }
    }

    console.log(`[Revalidate] Successfully revalidated ${revalidatedPaths.length} paths:`, revalidatedPaths);

    return NextResponse.json({
      success: true,
      revalidated: revalidatedPaths,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Revalidate] Error processing revalidation request:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// GET /api/revalidate - Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Revalidation API is ready',
    usage: {
      method: 'POST',
      headers: {
        Authorization: 'Bearer {REVALIDATE_SECRET}',
        'Content-Type': 'application/json',
      },
      body: {
        type: 'event | venue | organizer | sitemap',
        id: 'optional - MongoDB ObjectId',
        paths: 'optional - array of specific paths to revalidate',
      },
    },
  });
}
