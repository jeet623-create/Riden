/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress all responses (gzip/brotli)
  compress: true,

  // Image optimization
  images: {
    domains: ['zfnwxetjxfvsijpaefqb.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },

  // Package import optimization (no critters needed)
  experimental: {
    optimizePackageImports: ['react-hot-toast', 'lucide-react'],
  },

  // HTTP headers: caching + security
  async headers() {
    return [
      // Long-term cache for static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Security headers on all routes
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      // Block search engines from indexing admin routes
      {
        source: '/admin/(.*)',
        headers: [
          { key: 'X-Robots-Tag',   value: 'noindex, nofollow' },
          { key: 'Cache-Control',  value: 'no-store, no-cache, must-revalidate' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
