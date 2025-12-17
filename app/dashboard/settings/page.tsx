"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useUser();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Configuration IA
  const [tone, setTone] = useState("professionnel");
  const [style, setStyle] = useState("standard");
  const [autoReply, setAutoReply] = useState(false);
  const [includeBusinessName, setIncludeBusinessName] = useState(true);

  const handleSave = async () => {
    setLoading(true);
    // Simuler la sauvegarde (vous devrez implémenter l'API route)
    setTimeout(() => {
      setSaved(true);
      setLoading(false);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:underline mb-4 block"
        >
          ← Retour au Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-6 dark:text-white">Paramètres</h1>

        {/* Section Compte */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
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
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
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
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section Configuration IA */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            🤖 Configuration des réponses IA
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
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="professionnel">Professionnel</option>
                <option value="amical">Amical</option>
                <option value="formel">Formel</option>
                <option value="décontracté">Décontracté</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Le ton détermine comment l'IA s'adresse aux clients
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
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="standard">Standard</option>
                <option value="concis">Concis</option>
                <option value="détaillé">Détaillé</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                La longueur et le détail des réponses générées
              </p>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeBusinessName"
                  checked={includeBusinessName}
                  onChange={(e) => setIncludeBusinessName(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label
                  htmlFor="includeBusinessName"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Inclure le nom de l'établissement dans les réponses
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoReply"
                  checked={autoReply}
                  onChange={(e) => setAutoReply(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label
                  htmlFor="autoReply"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Réponse automatique (exécute automatiquement les réponses)
                </label>
              </div>
            </div>

            {/* Exemple de réponse */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                💡 Aperçu d'une réponse avec ces paramètres:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                {tone === "professionnel" &&
                  "Merci pour votre avis. Nous sommes ravis que vous ayez apprécié votre expérience chez nous."}
                {tone === "amical" &&
                  "Merci beaucoup ! On est super contents que tu aies passé un bon moment avec nous ! 😊"}
                {tone === "formel" &&
                  "Nous vous remercions pour votre retour. Votre satisfaction est notre priorité."}
                {tone === "décontracté" &&
                  "Trop cool ! Merci d'avoir pris le temps de nous laisser un avis ! 🙌"}
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
          {saved && (
            <div className="px-4 py-3 bg-green-100 text-green-700 rounded-lg">
              ✓ Enregistré avec succès !
            </div>
          )}
        </div>
      </div>
    </div>
  );
}