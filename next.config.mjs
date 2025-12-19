/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Injection de clé bidon pour que le build ne plante pas si une lib OpenAI traîne
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "sk-placeholder-for-build",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
