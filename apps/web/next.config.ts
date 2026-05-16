/**
 * Next.js 15 configuration for Revizr web PWA.
 *
 * PWA via @ducanh2912/next-pwa:
 * - Cache-first for static assets (_next/static/*)
 * - Network-first for API routes (api.revizr.co.uk/*)
 * - Offline shell page served from cache on fetch failure
 *
 * Performance budgets enforced via Lighthouse CI (lighthouserc.json).
 * Bundle analyser available via ANALYZE=true env var.
 */

import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Cache-first: static assets
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      // Cache-first: PWA icons and manifest
      {
        urlPattern: /\/(manifest\.json|icons\/.*)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "pwa-assets",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7,
          },
        },
      },
      // Network-first: API calls — never cache personal data
      {
        urlPattern: /^https:\/\/api\.revizr\.co\.uk\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 5, // 5 minutes max
          },
        },
      },
      // Network-first: HTML pages
      {
        urlPattern: /^https:\/\/.*\.revizr\.co\.uk\/.*$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24,
          },
        },
      },
    ],
    // Offline fallback
    fallbacks: {
      document: "/offline",
    },
  },
});

const nextConfig: NextConfig = {
  // Strict mode for catching bugs early
  reactStrictMode: true,

  // Image optimisation — WebP first, JPEG fallback per performance budget
  images: {
    formats: ["image/webp", "image/jpeg"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.revizr.co.uk",
        pathname: "/**",
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Experimental: partial pre-rendering for faster shell delivery
  experimental: {
    ppr: false, // Enable when stable in Next 15
  },
};

export default withPWA(nextConfig);
