import type { NextConfig } from "next";

const directusUrl = process.env.DIRECTUS_URL;
const directusHost = directusUrl ? new URL(directusUrl).hostname : undefined;

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.88.164'],
  images: {
    remotePatterns: [
      ...(directusHost
        ? [{ protocol: "https" as const, hostname: directusHost }]
        : []),
      { protocol: "http" as const, hostname: "localhost", port: "8055" },
    ],
  },  
};

export default nextConfig;
