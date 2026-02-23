/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // For monorepo support
  transpilePackages: ['@vendor-management/shared', '@vendor-management/database'],
}

module.exports = nextConfig
