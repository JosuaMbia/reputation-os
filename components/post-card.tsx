"use client";

import { useState } from "react";
import { Calendar, CheckCircle, Edit3, Share2, Trash2 } from "lucide-react";

export function PostCard({ post }: { post: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [caption, setCaption] = useState(post.caption);
    const [status, setStatus] = useState(post.status);

    // Simulation de sauvegarde
    const handleSave = () => {
        setIsEditing(false);
        // Ici, on appellerait une Server Action pour update le post en BDD
    };

    const handlePublish = () => {
        if(confirm("Pour l'instant, la connexion API directe nécessite une validation Facebook (2 semaines). \n\nVoulez-vous copier le texte pour le poster manuellement ?")) {
            navigator.clipboard.writeText(caption);
            setStatus("PUBLISHED");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            {/* Header Platforme */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 flex justify-between items-center text-white text-xs font-bold px-4">
                <span>INSTAGRAM</span>
                <span className={`px-2 py-0.5 rounded-full bg-black/20 ${status === "PUBLISHED" ? "bg-green-500" : ""}`}>
                    {status === "PUBLISHED" ? "PUBLIÉ" : "BROUILLON"}
                </span>
            </div>

            {/* Image (Placeholder) */}
            <div className="h-48 bg-gray-200 relative group">
                <img src={post.imageUrl} alt="Post visual" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button className="text-white border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition">
                        Changer l'image
                    </button>
                </div>
            </div>

            {/* Contenu Editable */}
            <div className="p-4 flex-1 flex flex-col">
                {isEditing ? (
                    <textarea 
                        className="w-full h-32 p-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-900 mb-2"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    />
                ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-4 flex-1">
                        {caption}
                    </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    {isEditing ? (
                        <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold">
                            Valider
                        </button>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Éditer">
                                <Edit3 className="w-4 h-4"/>
                            </button>
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Planifier (Bientôt)">
                                <Calendar className="w-4 h-4"/>
                            </button>
                            <button onClick={handlePublish} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700">
                                <Share2 className="w-4 h-4"/> Publier
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}