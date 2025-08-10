/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Suppress React warnings in development
  reactStrictMode: false,
  // Or suppress specific warnings
  env: {
    SUPPRESS_REACT_WARNINGS: 'true',
  },
}

export default nextConfig
