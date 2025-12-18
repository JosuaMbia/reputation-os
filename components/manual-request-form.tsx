'use client'

import { useState } from "react";
import { sendReviewInvitation } from "@/app/actions/send-review-invitation";

export function ManualRequestForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await sendReviewInvitation(formData);

    if (result.success) {
      alert("✅ " + result.message);
      (event.target as HTMLFormElement).reset(); // Vider le formulaire
    } else {
      alert("❌ " + result.error);
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-6">
        <h3 className="font-bold text-lg text-gray-900">Nouvelle Demande</h3>
        <p className="text-xs text-gray-500">Envoi manuel d'un SMS d'avis</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
        <input 
          type="text" 
          name="name" 
          placeholder="Ex: Julie" 
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone mobile</label>
        <input 
          type="tel" 
          name="phone" 
          placeholder="+33 6..." 
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition transform active:scale-95 flex justify-center items-center"
      >
        {isLoading ? (
          <span className="animate-pulse">Envoi en cours... 🚀</span>
        ) : (
          "Envoyer l'invitation 📩"
        )}
      </button>

      <p className="text-xs text-center text-gray-400 mt-2">
        Coût estimé : 1 crédit
      </p>
    </form>
  );
}