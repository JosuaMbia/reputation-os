"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { saveSettings } from "@/app/actions/save-settings"; // On importe la vraie action serveur

export default function SettingsPage() {
  const { user } = useUser();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Configuration IA (valeurs par défaut)
  const [tone, setTone] = useState("professionnel");
  const [style, setStyle] = useState("standard");
  const [autoReply, setAutoReply] = useState(false);
  const [includeBusinessName, setIncludeBusinessName] = useState(true);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);

    try {
      // Appel à la Server Action
      const result = await saveSettings({
        tone,
        style,
        autoReply,
        includeBusinessName
      });

      if (result.success) {
        setSaved(true);
        // On cache le message de succès après 3 secondes
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Erreur : " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline mb-4 block flex items-center gap-1"
        >
          <span>←</span> Retour au Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-6 dark:text-white">Paramètres</h1>

        {/* Section Compte */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Compte</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={user?.fullName || ""}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section Configuration IA */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
            <span>🤖</span> Configuration des réponses IA
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Personnalisez le ton et le style des réponses générées automatiquement par l'IA.
          </p>

          <div className="space-y-6">
            {/* Ton */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ton des réponses
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              >
                <option value="professionnel">Professionnel</option>
                <option value="amical">Amical</option>
                <option value="formel">Formel</option>
                <option value="décontracté">Décontracté</option>
                <option value="luxe">Luxe / Haut de gamme</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Le ton détermine comment l'IA s'adresse aux clients.
              </p>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Style de réponse
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              >
                <option value="standard">Standard</option>
                <option value="concis">Concis (Court)</option>
                <option value="détaillé">Détaillé (Long)</option>
              </select>
            </div>

            {/* Options Checkboxes */}
            <div className="space-y-4 pt-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBusinessName}
                  onChange={(e) => setIncludeBusinessName(e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 select-none">
                  Inclure le nom de l'établissement dans les réponses
                </span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoReply}
                  onChange={(e) => setAutoReply(e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 select-none">
                  Réponse automatique (l'IA répond seule aux nouveaux avis)
                </span>
              </label>
            </div>

            {/* Aperçu dynamique */}
            <div className="mt-6 p