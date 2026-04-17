/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Needed in Next.js 14 so src/instrumentation.ts runs on server boot.
    // (Default-enabled in Next.js 15; remove this block after upgrading.)
    instrumentationHook: true,
  },
};

export default nextConfig;
