'use client';

import { useGoogleBusiness } from '@/hooks/useGoogleBusiness';

export function BusinessInfoCard() {
  const { business, loading, error } = useGoogleBusiness();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
        <p className="font-semibold">Erreur de connexion</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* En-tête de la carte */}
      <div className="bg-blue-600 px-6 py-4">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <span>🏢</span> Votre Établissement
        </h3>
      </div>

      {/* Contenu */}
      <div className="p-6 space-y-6">
        
        {/* Nom et Adresse */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">
            Nom
          </p>
          <p className="text-gray-900 dark:text-gray-100 font-medium text-lg">
            {business.name}
          </p>
          {business.address && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              📍 {business.address}
            </p>
          )}
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Note et Avis */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">
              Réputation
            </p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {business.rating || '-'}
              </span>
              <div className="flex flex-col">
                <span className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐</span>
                <span className="text-xs text-gray-500">
                  {business.reviewCount ? `${business.reviewCount} avis` : 'Aucun avis'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Catégorie */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">
            Catégorie
          </p>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            {business.category || 'Non spécifiée'}
          </span>
        </div>

      </div>
    </div>
  );
}