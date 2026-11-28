import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Bounded in-memory buffer cache (max 100 items, 1-hour TTL)
interface CachedImageBuffer {
  buffer: Buffer;
  mimeType: string;
  timestamp: number;
}
const imageBufferCache = new Map<string, CachedImageBuffer>();
const MAX_CACHE_ENTRIES = 100;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// 15-second in-memory visibility revalidation cache per product ID
interface VisibilityEntry {
  isValid: boolean;
  images: any;
  timestamp: number;
}
const productVisibilityCache = new Map<string, VisibilityEntry>();
const VISIBILITY_TTL_MS = 15 * 1000; // 15 seconds

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80';

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]);

const SAFE_ID_REGEX = /^[0-9a-zA-Z_-]{1,64}$/;

/**
 * Validates redirect URLs against SSRF, loopback, private RFC1918, link-local,
 * metadata, IPv6, and decimal integer IP representations.
 */
function isSafeRedirectHost(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase().trim();

    // Block basic dangerous hostnames
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }

    // Block IPv6 Loopback, Link-Local, and Unique-Local addresses
    if (
      hostname === '[::1]' ||
      hostname === '::1' ||
      hostname.startsWith('[::') ||
      hostname.startsWith('::') ||
      hostname.startsWith('[fe8') ||
      hostname.startsWith('fe8') ||
      hostname.startsWith('[fe9') ||
      hostname.startsWith('fe9') ||
      hostname.startsWith('[fea') ||
      hostname.startsWith('fea') ||
      hostname.startsWith('[feb') ||
      hostname.startsWith('feb') ||
      hostname.startsWith('[fc') ||
      hostname.startsWith('fc') ||
      hostname.startsWith('[fd') ||
      hostname.startsWith('fd')
    ) {
      return false;
    }

    // Block Decimal Integer IPs (e.g. 2130706433 = 127.0.0.1)
    if (/^\d+$/.test(hostname)) {
      return false;
    }

    // Block IPv4 Loopback, Link-Local (Cloud Metadata), and RFC1918 Private Ranges
    const ipv4Parts = hostname.split('.');
    if (ipv4Parts.length === 4 && ipv4Parts.every(p => /^\d+$/.test(p))) {
      const b0 = parseInt(ipv4Parts[0] || '0', 10);
      const b1 = parseInt(ipv4Parts[1] || '0', 10);
      if (b0 === 127) return false;                          // 127.0.0.0/8 (Loopback)
      if (b0 === 10) return false;                           // 10.0.0.0/8 (Private)
      if (b0 === 169 && b1 === 254) return false;            // 169.254.0.0/16 (Link-Local / Metadata)
      if (b0 === 172 && b1 >= 16 && b1 <= 31) return false; // 172.16.0.0/12 (Private)
      if (b0 === 192 && b1 === 168) return false;            // 192.168.0.0/16 (Private)
      if (b0 === 0) return false;                            // 0.0.0.0/8
    }

    return true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const rawIdx = searchParams.get('idx');

    // 1. Strict Product ID Validation
    if (!id || typeof id !== 'string' || !SAFE_ID_REGEX.test(id.trim())) {
      return NextResponse.redirect(FALLBACK_IMAGE_URL, 302);
    }

    // 2. Safe Index Bounding (0 to 20)
    const parsedIdx = parseInt(rawIdx || '0', 10);
    const idx = isNaN(parsedIdx) ? 0 : Math.max(0, Math.min(20, parsedIdx));

    const cleanId = id.trim();
    const cacheKey = `${cleanId}_${idx}`;
    const now = Date.now();

    // 3. Product Visibility Revalidation:
    // Every 15 seconds, re-verify product is currently published, approved, not soft-deleted,
    // and belongs to an active, non-deleted vendor.
    let productImages: any = null;
    const visibility = productVisibilityCache.get(cleanId);

    if (visibility && now - visibility.timestamp < VISIBILITY_TTL_MS) {
      if (!visibility.isValid) {
        // Known ineligible product within revalidation window
        return NextResponse.redirect(FALLBACK_IMAGE_URL, 302);
      }
      productImages = visibility.images;
    } else {
      // Revalidation required against Supabase
      const { data: product, error } = await supabaseAdmin
        .from('products')
        .select('images, status, approval_status, deleted_at, vendors!inner(status, deleted_at)')
        .eq('id', cleanId)
        .eq('status', 'PUBLISHED')
        .eq('approval_status', 'APPROVED')
        .is('deleted_at', null)
        .eq('vendors.status', 'ACTIVE')
        .is('vendors.deleted_at', null)
        .maybeSingle();

      if (error || !product || !product.images) {
        // Ineligible: Mark invalid and immediately EVICT all cached image buffers for this product
        productVisibilityCache.set(cleanId, { isValid: false, images: null, timestamp: now });
        for (const key of imageBufferCache.keys()) {
          if (key.startsWith(`${cleanId}_`)) {
            imageBufferCache.delete(key);
          }
        }
        return NextResponse.redirect(FALLBACK_IMAGE_URL, 302);
      }

      productImages = product.images;
      productVisibilityCache.set(cleanId, { isValid: true, images: productImages, timestamp: now });
    }

    // 4. Check In-Memory Decoded Buffer Cache (Only reachable if visibility is verified)
    const cached = imageBufferCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          'Content-Type': cached.mimeType,
          'Content-Length': cached.buffer.length.toString(),
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'x-image-cache': 'HIT',
        },
      });
    }

    // 5. Extract Target Image by Index
    let targetImage: string = '';
    if (Array.isArray(productImages)) {
      targetImage = productImages[idx] || productImages[0] || '';
    } else if (typeof productImages === 'object' && productImages !== null) {
      const main = (productImages as any).main || '';
      const gallery = Array.isArray((productImages as any).gallery) ? (productImages as any).gallery : [];
      if (idx === 0) {
        targetImage = main || gallery[0] || '';
      } else {
        targetImage = gallery[idx - 1] || gallery[0] || main || '';
      }
    } else if (typeof productImages === 'string') {
      targetImage = productImages;
    }

    if (!targetImage || targetImage.trim().length === 0) {
      return NextResponse.redirect(FALLBACK_IMAGE_URL, 302);
    }

    // 6. Safe External Redirect Validation (Blocks SSRF, loopback, private ranges, & non-HTTP schemes)
    if (targetImage.startsWith('http://') || targetImage.startsWith('https://')) {
      if (isSafeRedirectHost(targetImage)) {
        return new NextResponse(null, {
          status: 302,
          headers: {
            'Location': targetImage,
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          }
        });
      }
      return NextResponse.redirect(FALLBACK_IMAGE_URL, 302);
    }

    // 7. Base64 Data URI Processing with Verified MIME Type
    const dataUriMatch = targetImage.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUriMatch) {
      const detectedMime = (dataUriMatch[1] || '').toLowerCase().trim();
      const mimeType = ALLOWED_IMAGE_MIMES.has(detectedMime) ? detectedMime : 'image/jpeg';
      const base64Data = dataUriMatch[2] || '';
      const buffer = Buffer.from(base64Data, 'base64');

      // Evict oldest entry if cache limit reached
      if (imageBufferCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = imageBufferCache.keys().next().value;
        if (oldestKey) imageBufferCache.delete(oldestKey);
      }

      imageBufferCache.set(cacheKey, {
        buffer,
        mimeType,
        timestamp: now,
      });

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': buffer.length.toString(),
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'x-image-cache': 'MISS',
        },
      });
    }

    // Fallback if unrecognized image format
    return NextResponse.redirect(FALLBACK_IMAGE_URL, 302);
  } catch (err) {
    console.warn('Image streaming handler exception:', err);
    return NextResponse.redirect(FALLBACK_IMAGE_URL, 302);
  }
}
