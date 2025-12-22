"use client";

import { useState } from "react";
import { Sparkles, X, Loader2, Instagram, Facebook, Linkedin } from "lucide-react";
import { generateMarketingPost } from "@/app/actions/generate-marketing";
import { toast } from "sonner";

export function CreatePostModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [topic, setTopic] = useState("");
    const [platform, setPlatform] = useState<"INSTAGRAM" | "FACEBOOK" | "LINKEDIN">("INSTAGRAM");
    const [tone, setTone] = useState("Engageant");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!topic.trim()) return toast.error("Veuillez décrire le sujet du post.");

        setIsLoading(true);
        const result = await generateMarketingPost({ topic, platform, tone });
        setIsLoading(false);

        if (result.success) {
            toast.success("✨ Post généré avec succès !", { description: "Il est apparu dans vos brouillons." });
            setTopic(""); // Reset
            onClose(); // Fermer la modale
        } else {
            toast.error("Oups !", { description: result.error });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-in slide-in-from-bottom-4">
                
                {/* Header */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X className="w-5 h-5"/>
                </button>
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Création Assistée par IA</h2>
                </div>

                {/* Formulaire */}
                <div className="space-y-4">
                    
                    {/* 1. Sujet */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            De quoi voulez-vous parler ?
                        </label>
                        <textarea 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ex: Offre spéciale -20% sur les burgers ce jeudi..."
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white h-24 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                        />
                    </div>

                    {/* 2. Plateforme */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Destination
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button 
                                onClick={() => setPlatform("INSTAGRAM")}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition ${platform === "INSTAGRAM" ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300" : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700"}`}
                            >
                                <Instagram className="w-5 h-5"/> <span className="text-xs font-bold">Instagram</span>
                            </button>
                            <button 
                                onClick={() => setPlatform("FACEBOOK")}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition ${platform === "FACEBOOK" ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700"}`}
                            >
                                <Facebook className="w-5 h-5"/> <span className="text-xs font-bold">Facebook</span>
                            </button>
                            <button 
                                onClick={() => setPlatform("LINKEDIN")}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition ${platform === "LINKEDIN" ? "border-blue-700 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700"}`}
                            >
                                <Linkedin className="w-5 h-5"/> <span className="text-xs font-bold">LinkedIn</span>
                            </button>
                        </div>
                    </div>

                    {/* 3. Ton */}
                    <div>
                         <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Ton du message
                        </label>
                        <select 
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                            <option>Engageant & Sympa</option>
                            <option>Professionnel & Sérieux</option>
                            <option>Urgent (Promo limitée)</option>
                            <option>Humoristique</option>
                        </select>
                    </div>

                    {/* Bouton Action */}
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" /> Rédaction en cours...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" /> Générer le Post
                            </>
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
}