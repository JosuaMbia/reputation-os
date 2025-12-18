'use client'

import { useState } from "react";
import { createBusiness } from "@/app/actions/create-business";
import { Rocket, MapPin, Briefcase, Globe, Building2 } from "lucide-react";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    // Le formulaire sera envoyé à l'action serveur via l'attribut action du form
    // Mais on gère le loading state ici
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* En-tête coloré */}
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Rocket className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Bienvenue sur Reputation OS</h1>
          <p className="text-blue-100 text-sm">Configurons votre espace de travail en 30 secondes.</p>
        </div>

        {/* Formulaire */}
        <form action={createBusiness} onSubmit={() => setLoading(true)} className="p-8 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" /> Nom de l'établissement
            </label>
            <input 
              name="name" 
              required 
              placeholder="Ex: Boulangerie Ange"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" /> Activité
              </label>
              <input 
                name="type" 
                placeholder="Ex: Restaurant"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Ville
              </label>
              <input 
                name="city" 
                required 
                placeholder="Ex: Paris"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" /> Site Web (Optionnel)
            </label>
            <input 
              name="website" 
              placeholder="www.mon-site.com"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">Création en cours...</span>
            ) : (
              <>C'est parti ! <Rocket className="w-5 h-5" /></>
            )}
          </button>

        </form>
      </div>
      
      <p className="mt-8 text-center text-gray-400 text-xs">
        Étape 1 sur 2 • Configuration Initiale
      </p>
    </div>
  );
}