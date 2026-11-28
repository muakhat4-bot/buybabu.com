import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';

export const dynamic = 'force-dynamic';

// In-memory cache for categories (60s TTL)
let cachedCategories: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    const now = Date.now();
    if (!cachedCategories || now - cacheTimestamp > CACHE_TTL_MS) {
      const { data: dbCategories, error } = await supabaseAdmin
        .from('categories')
        .select(`
          id,
          name,
          slug,
          image_url
        `)
        .order('id', { ascending: true });

      if (error) {
        console.warn('Categories API fetch notice:', error.message);
      } else if (dbCategories) {
        cachedCategories = dbCategories;
        cacheTimestamp = now;
      }
    }

    let categories = cachedCategories || [];

    // Filter by single slug if requested
    if (slug) {
      const slugClean = decodeURIComponent(slug).toLowerCase().trim();
      const slugNorm = slugClean.replace(/\s+/g, '-');
      const nameNorm = slugClean.replace(/-/g, ' ');

      const matched = categories.find((c: any) =>
        (c.slug && (c.slug.toLowerCase() === slugClean || c.slug.toLowerCase() === slugNorm)) ||
        (c.name && (c.name.toLowerCase() === slugClean || c.name.toLowerCase() === nameNorm))
      );

      if (matched) {
        return NextResponse.json(matched, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
          }
        });
      }
    }

    // Filter by ID if requested
    if (id) {
      const idNum = parseInt(id, 10);
      const matched = categories.find((c: any) => c.id === idNum || String(c.id) === id);
      if (matched) {
        return NextResponse.json(matched, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
          }
        });
      }
    }

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (err: any) {
    console.error('API /api/categories error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
