"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { saveSettings } from "@/app/actions/save-settings";

export default function SettingsPage() {
  const { user } = useUser();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [tone, setTone] = useState("professionnel");
  const [style, setStyle] = useState("standard");
  const [autoReply, setAutoReply] = useState(false);
  const [includeBusinessName, setIncludeBusinessName] = useState(true);

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await saveSettings({ tone, style, autoReply, includeBusinessName });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Erreur: " + result.error);
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 block">
          ← Retour au Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-6 dark:text-white">Paramètres</h1>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Compte</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="text" disabled value={user?.primaryEmailAddress?.emailAddress || ""} className="w-full p-2 border rounded bg-gray-100 mt-1" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">IA & Réponses</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ton</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full p-2 border rounded">
              <option value="professionnel">Professionnel</option>
              <option value="amical">Amical</option>
              <option value="luxe">Luxe</option>
            </select>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input type="checkbox" checked={includeBusinessName} onChange={(e) => setIncludeBusinessName(e.target.checked)} />
            <label>Inclure le nom de l'établissement</label>
          </div>

          <button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </button>
          
          {saved && <span className="ml-4 text-green-600">✅ Sauvegardé !</span>}
        </div>
      </div>
    </div>
  );
}