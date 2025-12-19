'use client'

import { useState } from "react";
// Assurez-vous que cette action existe toujours ou créez-en une simple si nécessaire
// Si elle n'existe plus, on peut la retirer pour le moment.
// import { saveReply } from "@/app/actions/save-reply"; 

// On définit le type localement pour éviter les soucis d'import
interface ReviewProps {
  id: string;
  source: string; // ✅ NOUVEAU
  externalId?: string | null;
  authorName: string;
  rating: number;
  content: string;
  reviewDate: Date;     // ✅ RENOMMÉ (était reviewDate)
  response?: string | null;
  businessId: string;
}

export function ReviewCard({ review }: { review: ReviewProps }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState(review.response || "");
  // const [isSaved, setIsSaved] = useState(!!review.response); // Simplifié pour le scraping

  // 1. Appelle l'IA
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

        if (response.status === 403 && data.limitReached) {
            alert("🔒 Oups ! Limite gratuite atteinte.\n\nPassez à la version Pro.");
            return;
        }

        if (data.reply) {
            setDraft(data.reply);
        }

    } catch (e) {
        alert("Erreur lors de la génération IA");
    } finally {
        setIsGenerating(false);
    }
  };

  // Petit utilitaire pour copier dans le presse-papier
  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
    alert("Réponse copiée ! Vous pouvez maintenant la coller sur Google/Trustpilot.");
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 transition hover:shadow-md">
      {/* En-tête de l'avis */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* Badge Source */}
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${review.source === 'google' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
             {review.source}
          </span>

          <div className="flex flex-col">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{review.authorName}</h3>
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
      <p className="text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-gray-200">
        "{review.content}"
      </p>

      {/* Zone de Réponse */}
      <div className="pl-4 border-l-2 border-indigo-100 dark:border-indigo-900 space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500">Votre réponse (Brouillon IA) :</span>
                <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold transition"
                >
                    {isGenerating ? "Reflexion..." : "✨ Générer réponse IA"}
                </button>
             </div>
             
             <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Cliquez sur le bouton magique pour générer une réponse..."
                className="w-full p-3 border rounded-lg text-sm h-32 focus:ring-2 focus:ring-purple-500 outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
             />
             
             {draft && (
                 <div className="flex justify-end gap-2">
                    <button 
                        onClick={copyToClipboard}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2"
                    >
                        📋 Copier la réponse
                    </button>
                    {/* Lien externe vers l'avis si dispo (pour aller coller) */}
                    <a 
                        href={review.source === 'google' ? 'https://business.google.com/reviews' : 'https://business.trustpilot.com/reviews'}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition"
                    >
                        Aller répondre ↗
                    </a>
                 </div>
             )}
      </div>
    </div>
  );
}