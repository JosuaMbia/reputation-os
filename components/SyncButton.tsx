"use client";

import { useState } from "react";
import { syncBusinessData } from "@/app/actions/sync-business";

export function SyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleClick = async () => {
    setIsLoading(true);
    setProgress(10); // Démarrage

    // Simulation d'une barre de progression pour faire patienter
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // On bloque à 90% tant que ce n'est pas fini
        return prev + 10;
      });
    }, 800);

    try {
      // Appel réel au serveur
      await syncBusinessData();
      
      // Une fois fini
      clearInterval(interval);
      setProgress(100);
      
      // La page va se recharger automatiquement grâce au revalidatePath du serveur
    } catch (error) {
      console.error(error);
      clearInterval(interval);
      setIsLoading(false);
      alert("Une erreur est survenue lors de la synchronisation.");
    }
  };

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="space-y-3">
          {/* Barre de progression */}
          <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-blue-600 font-medium animate-pulse">
            🔍 Analyse des comptes Google en cours... ({progress}%)
          </p>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <span>🔄</span> Lancer la détection automatique
        </button>
      )}
    </div>
  );
}