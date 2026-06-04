import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'bklnjjnyrwfwaypfnmmy.supabase.co' },
    ],
  },
};

export default nextConfig;
