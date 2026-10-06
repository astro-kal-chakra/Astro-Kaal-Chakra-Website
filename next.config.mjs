import nextEnv from "@next/env";

// Read .env / .env.local here too: the image host below is derived from NEXT_PUBLIC_API_URL.
nextEnv.loadEnvConfig(process.cwd());

/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // camera/mic are needed on our own origin for video calls (Agora).
  { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), payment=(self)" },
];

// Astrologer photos and uploads are served by the backend (/uploads/...). Allow that host for next/image.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL) : null;
const isDev = process.env.NODE_ENV !== "production";
const backendImages = apiUrl
  ? [{ protocol: apiUrl.protocol.replace(":", ""), hostname: apiUrl.hostname, port: apiUrl.port, pathname: "/uploads/**" }]
  : [];
// `next dev`: always allow a backend on this machine, so photos never depend on when .env.local was read
const devImages = isDev
  ? ["localhost", "127.0.0.1"].map((hostname) => ({ protocol: "http", hostname, pathname: "/uploads/**" }))
  : [];
// Local development only (API on localhost / a LAN IP): Next.js blocks optimising images from private IPs otherwise.
const localApi = isDev || Boolean(apiUrl && /^(localhost|127\.|10\.|192\.168\.)/.test(apiUrl.hostname));

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    globalNotFound: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowLocalIP: localApi,
    remotePatterns: [
      ...backendImages,
      ...devImages,
      // Add your CDN / S3 bucket for astrologer photos and blog images, e.g.
      // { protocol: "https", hostname: "cdn.example.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
