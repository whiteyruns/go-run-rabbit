/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Needed in Next.js 14 so src/instrumentation.ts runs on server boot.
    // (Default-enabled in Next.js 15; remove this block after upgrading.)
    instrumentationHook: true,
    // Raise server action body limit to 10 MB so the Pour Log photo
    // upload from a phone camera (~3–8 MB) doesn't silently fail.
    // Default is 1 MB.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
