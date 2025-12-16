"use client";

import { useState, useEffect } from "react";
// Vous pouvez importer vos server actions ici plus tard

export function useGoogleBusiness() {
  const [business, setBusiness] = useState<any>(null); // Remplacez any par votre type Business plus tard
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBusiness() {
      try {
        setLoading(true);
        // Simulation d'appel API pour l'instant pour que le build passe
        // const response = await fetch('/api/business/me');
        // const data = await response.json();
        // setBusiness(data);
        
        // Pour le build, on simule un délai
        setTimeout(() => {
           setLoading(false);
        }, 1000);
        
      } catch (err) {
        setError("Erreur lors du chargement");
        setLoading(false);
      }
    }

    fetchBusiness();
  }, []);

  return { business, loading, error };
}
