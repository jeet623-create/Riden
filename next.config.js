/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress responses
  compress: true,
  
  // Optimize images
  images: {
    domains: ['zfnwxetjxfvsijpaefqb.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },

  // Production optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-hot-toast'],
  },

  // HTTP headers for caching static assets
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ]
      },
      {
        source: '/admin/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
