//** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "sk-placeholder-for-build",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Note : J'ai supprimé la section "eslint" car elle n'est plus supportée ici
};

export default nextConfig;