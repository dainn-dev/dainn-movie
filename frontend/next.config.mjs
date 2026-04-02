import { platform } from 'node:os'

/**
 * `output: 'standalone'` copies traced deps using symlinks; native Windows builds often fail with EPERM unless Developer Mode is on.
 * Linux/macOS, Vercel, and `docker build` (Linux) keep standalone for the frontend Dockerfile.
 */
const useStandalone =
  process.env.FORCE_NEXT_STANDALONE === '1' ||
  (platform() !== 'win32' && process.env.SKIP_NEXT_STANDALONE !== '1')

/** Hostnames bổ sung cho poster/backdrop (CSV), ví dụ: pub-xxx.r2.dev,imagedelivery.net */
function imageRemotePatterns() {
  const fromEnv = (process.env.NEXT_PUBLIC_IMAGE_REMOTE_PATTERNS || '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean)
    .map((hostname) => ({
      protocol: 'https',
      hostname,
      port: '',
      pathname: '/**',
    }))
  const defaults = [
    { protocol: 'http', hostname: '127.0.0.1', port: '', pathname: '/**' },
    { protocol: 'http', hostname: 'localhost', port: '', pathname: '/**' },
    { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
  ]
  return [...defaults, ...fromEnv]
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(useStandalone ? { output: 'standalone' } : {}),
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    unoptimized: false,
    remotePatterns: imageRemotePatterns(),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig