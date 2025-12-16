'use client';

import { useGoogleBusiness } from '@/hooks/useGoogleBusiness';
import Link from 'next/link';

export function BusinessInfoCard() {
  const { business, loading, error } = useGoogleBusiness();

  // Fonction pour générer le lien Google Maps
  const getGoogleMapsLink = (placeId: string | null) => {
    // Si on a l'ID complet (accounts/.../locations/...), on extrait juste l'ID final si possible,
    // mais pour Maps, le mieux est de chercher par le nom + adresse si on n'a pas le CID.
    // Astuce simple : Recherche Google Maps query
    if (business?.name) {
      const query = encodeURIComponent(`${business.name} ${business.address || ''}`);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    return '#';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-gray-100 rounded mb-4"></div>
      </div>
    );
  }

  if (error || !business) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      
      {/* En-tête style "Google Maps" */}
      <div className="h-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-90"></div>
        {/* Décoration de fond */}
        <div className="absolute -right-6 -top-6 text-9xl opacity-10 text-white">🗺️</div>
      </div>

      <div className="px-6 pb-6">
        
        {/* Avatar / Logo de l'entreprise */}
        <div className="relative -mt-10 mb-4 flex justify-between items-end">
          <div className="bg-white p-1 rounded-full shadow-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl border border-gray-200">
               🏢
            </div>
          </div>
          
          {/* Badge Note */}
          <div className="bg-white dark:bg-gray-700 py-1 px-3 rounded-full shadow-sm border border-gray-100 dark:border-gray-600 flex items-center gap-1">
            <span className="font-bold text-gray-900 dark:text-white">{business.rating || 'N/A'}</span>
            <span className="text-yellow-500">★★★★★</span>
            <span className="text-xs text-gray-500">({business.reviewCount})</span>
          </div>
        </div>

        {/* Informations */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {business.name}
          </h3>
          <p className="text-sm text-blue-600 font-medium mb-3">
            {business.category || 'Commerce local'}
          </p>
          
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            {business.address && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">📍</span>
                <span>{business.address}</span>
              </div>
            )}
            
            {business.phone && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📞</span>
                <span>{business.phone}</span>
              </div>
            )}

            {business.website && (
               <div className="flex items-center gap-2">
                 <span className="text-gray-400">🌐</span>
                 <a href={business.website} target="_blank" className="text-blue-500 hover:underline truncate">
                   {business.website}
                 </a>
               </div>
            )}
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <Link 
            href={getGoogleMapsLink(business.googlePlaceId)} 
            target="_blank"
            className="flex items-center justify-center w-full gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 font-medium text-sm"
          >
            <span>👀</span> Voir la fiche sur Google
          </Link>
        </div>

      </div>
    </div>
  );
}