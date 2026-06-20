import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add jwks-rsa to the external packages array
  serverExternalPackages: ["firebase-admin", "jwks-rsa"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['wide-hotels-stare.loca.lt'],
};

export default nextConfig;
