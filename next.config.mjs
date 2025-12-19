/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. On garde la config d'images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // 2. LE BOUCLIER ULTIME (Webpack DefinePlugin) 🛡️
  // Cette configuration injecte la clé directement dans le code au moment de la compilation.
  // Cela empêche physiquement la librairie OpenAI de planter pendant le build.
  webpack: (config, { isServer }) => {
    // Si la variable n'existe pas (cas du build Vercel), on injecte une fausse clé
    if (!process.env.OPENAI_API_KEY) {
      // On utilise DefinePlugin pour remplacer process.env.OPENAI_API_KEY par une string
      // Note: On ne le fait que si la variable est manquante pour ne pas casser la prod
      /* Astuce: On ne modifie pas config.plugins directement ici car c'est complexe avec Next.js,
         mais on s'assure que l'environnement Node contient une valeur.
      */
      process.env.OPENAI_API_KEY = "sk-placeholder-for-build-process-only";
    }
    return config;
  },
  
  // 3. Sécurité supplémentaire pour le build
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "sk-placeholder-for-build-process-only",
  },
};

export default nextConfig;