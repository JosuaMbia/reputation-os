/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🛡️ LE FIX "NUCLÉAIRE" : On injecte une fausse clé pour le build
  // Cela empêche OpenAI de planter pendant la compilation sur Vercel
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "sk-placeholder-for-build-process-only",
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com', // Vos images utilisateur
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // (Bonus) Pour afficher les photos des avis Google
      },
    ],
  },
};

export default nextConfig;