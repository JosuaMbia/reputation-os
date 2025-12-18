'use client'

import { useState } from "react";
import { saveReply } from "@/app/actions/save-reply";

// On définit le type localement pour éviter les soucis d'import
interface ReviewProps {
  id: string;
  authorName: string;
  rating: number;
  content: string;
  reviewDate: Date;
  response?: string | null;
  isReplied: boolean;
  businessId: string; // Nécessaire pour l'IA
}

export function ReviewCard({ review }: { review: ReviewProps }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState(review.response || "");
  const [isEditing, setIsEditing] = useState(!review.isReplied);
  const [isSaved, setIsSaved] = useState(review.isReplied);

  // 1. Appelle l'IA (Modifié pour gérer le quota)
  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            body: JSON.stringify({ 
                businessId: review.businessId,
                reviewText: review.content,
                reviewerName: review.authorName,
                starRating: review.rating
            })
        });

        const data = await response.json();

        // 👇 NOUVEAU : On vérifie si le quota est dépassé
        if (response.status === 403 && data.limitReached) {
            alert("🔒 Oups ! Limite gratuite atteinte.\n\nPassez à la version Pro pour générer des réponses illimitées.");
            // Optionnel : Rediriger vers la page d'abonnement
            // window.location.href = "/dashboard/subscription"; 
            return;
        }

        // Si tout va bien, on met à jour le brouillon
        if (data.reply) {
            setDraft(data.reply);
        }

    } catch (e) {
        alert("Erreur lors de la génération IA");
    } finally {
        setIsGenerating(false);
    }
  };

  // 2. Sauvegarde la réponse
  const handleSave = async () => {
    if (!draft) return;
    await saveReply(review.id, draft);
    setIsSaved(true);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 transition hover:shadow-md">
      {/* En-tête de l'avis */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
            {review.authorName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{review.authorName}</h3>
            <div className="flex text-yellow-400 text-sm">
              {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(review.reviewDate).toLocaleDateString()}
        </span>
      </div>

      {/* Contenu de l'avis */}
      <p className="text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border-l-4 border-gray-200">
        "{review.content}"
      </p>

      {/* Zone de Réponse */}
      <div className="pl-4 border-l-2 border-indigo-100 dark:border-indigo-900">
        
        {isSaved && !isEditing ? (
          // CAS 1 : Déjà répondu (Mode Lecture)
          <div>
            <p className="text-xs text-indigo-600 font-bold mb-1 uppercase tracking-wide">Votre Réponse :</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{draft}</p>
            <button 
                onClick={() => setIsEditing(true)} 
                className="text-xs text-gray-400 underline mt-2 hover:text-indigo-600"
            >
                Modifier
            </button>
          </div>
        ) : (
          // CAS 2 : Mode Édition / Génération
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500">Brouillon de réponse :</span>
                <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold transition"
                >
                    {isGenerating ? "Reflexion..." : "✨ Générer avec l'IA"}
                </button>
             </div>
             
             <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Cliquez sur le bouton magique ou écrivez votre réponse..."
                className="w-full p-3 border rounded-lg text-sm h-32 focus:ring-2 focus:ring-purple-500 outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
             />
             
             <div className="flex justify-end gap-2">
                {isSaved && <button onClick={() => setIsEditing(false)} className="px-3 py-2 text-sm text-gray-500">Annuler</button>}
                <button 
                    onClick={handleSave}
                    disabled={!draft}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50"
                >
                    Publier la réponse
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}