'use client';

import { useGoogleBusiness } from '@/hooks/useGoogleBusiness';

export function BusinessInfoCard() {
  const { business, loading, error } = useGoogleBusiness();

  if (loading) {
    return (
      <div className="text-center p-6">
        <p>Chargement des informations de l'etablissement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
        <p className="font-semibold mb-2">Erreur de connexion</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="grid md:grid-cols-3 gap-8 mt-12">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Etablissement</h3>
        <p className="text-gray-600 dark:text-gray-300 font-medium">{business.name}</p>
        {business.address && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{business.address}</p>
        )}
      </div>
      
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Note moyenne</h3>
        <p className="text-3xl font-bold text-blue-600">{business.rating || 'N/A'}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {business.reviewCount} avis
        </p>
      </div>
      
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-2">Categorie</h3>
        <p className="text-gray-600 dark:text-gray-300">{business.category || 'Non specifiee'}</p>
      </div>
    </div>
  );
}
