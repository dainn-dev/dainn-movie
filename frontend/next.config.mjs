import { platform } from 'node:os'

/**
 * `output: 'standalone'` copies traced deps using symlinks; native Windows builds often fail with EPERM unless Developer Mode is on.
 * Linux/macOS, Vercel, and `docker build` (Linux) keep standalone for the frontend Dockerfile.
 */
const useStandalone =
  process.env.FORCE_NEXT_STANDALONE === '1' ||
  (platform() !== 'win32' && process.env.SKIP_NEXT_STANDALONE !== '1')

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(useStandalone ? { output: 'standalone' } : {}),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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