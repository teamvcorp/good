import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Stripe, Vercel Blob, and other external image sources
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.stripe.com" },
    ],
  },
};

export default nextConfig;
