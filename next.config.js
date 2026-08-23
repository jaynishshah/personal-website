/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/case-study',
        destination: '/case-studies',
        permanent: true,
      },
      {
        source: '/case-study/:slug',
        destination: '/case-studies/:slug',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
