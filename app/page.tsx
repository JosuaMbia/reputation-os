'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useGoogleBusiness } from '@/hooks/useGoogleBusiness';

export default function Home() {
  return (
      const { business, loading, error } = useGoogleBusiness();
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold">🎯 Reputation OS</h1>
          <div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Se connecter
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6">
            Gérez vos avis Google avec l'IA
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            SaaS intelligent pour générer des réponses personnalisées, analyser
            le sentiment et améliorer votre réputation en ligne.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">IA Générative</h3>
              <p className="text-gray-600 dark:text-gray-400">
                3 propositions de réponses personnalisées pour chaque avis
              </p>
            </div>

                  {/* Informations établissement Google */}
      {loading ? (
        <div className="text-center p-6">
          <p>Chargement des informations de l'établissement...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          <p className="font-semibold mb-2">Erreur de connexion</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : business ? (
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold mb-2">Établissement</h3>
            <p className="text-gray-600 dark:text-gray-300">{business.name}</p>
            {business.address && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{business.address}</p>
            )}
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">Note moyenne</h3>
            <p className="text-3xl font-bold text-blue-600">{business.rating || 'N/A'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {business.reviewCount} avis
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-2">Catégorie</h3>
            <p className="text-gray-600 dark:text-gray-300">{business.category || 'Non spécifiée'}</p>
          </div>
        </div>
      ) : null}

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Analyse IA</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sentiment et points forts/faibles identifiés automatiquement
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Synchronisation Google</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Récupération automatique via Google Business Profile API
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
