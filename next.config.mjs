/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // On garde l'injection de la clé pour le build
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "sk-placeholder-for-build-process-only",
  },
  // On ignore les erreurs TS pour le build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;