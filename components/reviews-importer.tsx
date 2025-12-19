"use client";

import { useState } from "react";
import { scrapeAndSaveReviews } from "@/app/actions/import-reviews";

export function ReviewsImporter() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{success: boolean, message: string} | null>(null);

    const handleImport = async () => {
        if (!url) return;
        setLoading(true);
        setStatus(null);

        try {
            const result = await scrapeAndSaveReviews(url);
            setStatus({ success: result.success, message: result.message || result.error || "Erreur" });
            if (result.success) setUrl(""); // Reset si succès
        } catch (e) {
            setStatus({ success: false, message: "Une erreur inattendue est survenue." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">📥 Importer des avis</h2>
            <div className="flex flex-col md:flex-row gap-4">
                <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Collez ici l'URL Google Maps ou Trustpilot..." 
                    className="flex-1 p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                    onClick={handleImport}
                    disabled={loading || !url}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2 min-w-[150px]"
                >
                    {loading ? (
                        <>🔄 Analyse...</>
                    ) : (
                        <>🚀 Importer</>
                    )}
                </button>
            </div>
            
            {/* Message de statut */}
            {status && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${status.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.message}
                </div>
            )}
            
            <p className="text-xs text-gray-400 mt-2">
                Le processus peut prendre 10 à 30 secondes. Ne fermez pas la page.
            </p>
        </div>
    );
}