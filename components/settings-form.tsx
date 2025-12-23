"use client";

import { useState } from "react";
import { Save, Loader2, Store, Brain, Link as LinkIcon, Facebook, Linkedin, Power, CheckCircle, AlertCircle } from "lucide-react";
import { updateSettings } from "@/app/actions/update-settings";
import { disconnectSocial } from "@/app/actions/social-actions"; // ✅ Import de l'action
import { toast } from "sonner";

interface SettingsFormProps {
    initialData: any;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // Gestion de la sauvegarde globale
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const result = await updateSettings(formData);
        setIsLoading(false);

        if (result.success) {
            toast.success("Paramètres sauvegardés ! ✅");
        } else {
            toast.error("Erreur", { description: result.error });
        }
    };

    // Gestion de la déconnexion sociale
    const handleDisconnect = async (platform: "FACEBOOK" | "LINKEDIN") => {
        if(!confirm(`Voulez-vous vraiment déconnecter ${platform === 'FACEBOOK' ? 'Facebook & Instagram' : 'LinkedIn'} ?`)) return;
        
        setIsDisconnecting(true);
        const result = await disconnectSocial(platform);
        setIsDisconnecting(false);

        if (result.success) {
            toast.success("Compte déconnecté avec succès.");
        } else {
            toast.error("Erreur lors de la déconnexion.");
        }
    };

    // Vérification de l'état des connexions (Basé sur la présence des tokens)
    const isFbConnected = !!initialData?.facebookAccessToken;
    const isLiConnected = !!initialData?.linkedinAccessToken;
    

    const handleConnectFacebook = () => {
        const APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID; // ⚠️ On va devoir l'ajouter aux env publics
        // URL de redirection (doit correspondre exactement à celle déclarée sur Meta)
        const REDIRECT_URI = `${window.location.origin}/api/auth/facebook/callback`;
        
        // Permissions demandées (Scopes)
        // pages_manage_posts : Pour publier sur FB
        // pages_read_engagement : Pour lire les stats
        // instagram_basic + instagram_content_publish : Pour Insta
        const SCOPE = "pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish";
        
        // Construction de l'URL OAuth
        const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_type=code&state=reputation_os_connect`;
        
        // Redirection
        window.location.href = authUrl;
    };
    
  
    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            
            {/* --- COLONNE GAUCHE : IDENTITÉ & RÉSEAUX --- */}
            <div className="space-y-6 lg:col-span-2">
                
                {/* 1. CONNEXIONS SOCIALES (Nouveau Module) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <LinkIcon className="w-5 h-5 text-blue-600"/> Connexions Réseaux Sociaux
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">Connectez vos comptes pour permettre à l'IA de publier automatiquement.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* CARTE FACEBOOK / INSTAGRAM */}
                        <div className={`border rounded-xl p-4 flex flex-col justify-between transition ${isFbConnected ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                                        <Facebook className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm dark:text-white">Meta (FB & Insta)</h4>
                                        <p className="text-xs text-gray-500">Pages & Compte Pro</p>
                                    </div>
                                </div>
                                {isFbConnected ? (
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3"/> ACTIF
                                    </span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3"/> INACTIF
                                    </span>
                                )}
                            </div>
                            
                            {isFbConnected ? (
                                <button 
                                    type="button"
                                    onClick={() => handleDisconnect("FACEBOOK")}
                                    disabled={isDisconnecting}
                                    className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
                                >
                                    <Power className="w-3 h-3"/> Déconnecter
                                </button>
                            ) : (
                                // NOTE: Ici, vous devrez mettre le vrai lien OAuth vers Facebook plus tard
                                <button type="button" onClick={() => toast.info("Intégration OAuth à venir")} className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition">
                                    Connecter le compte
                                </button>
                            )}
                        </div>

                        {/* CARTE LINKEDIN */}
                        <div className={`border rounded-xl p-4 flex flex-col justify-between transition ${isLiConnected ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-700 p-2 rounded-lg text-white">
                                        <Linkedin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm dark:text-white">LinkedIn</h4>
                                        <p className="text-xs text-gray-500">Profil & Page Entreprise</p>
                                    </div>
                                </div>
                                {isLiConnected ? (
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3"/> ACTIF
                                    </span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3"/> INACTIF
                                    </span>
                                )}
                            </div>

                            {isLiConnected ? (
                                <button 
                                    type="button"
                                    onClick={() => handleDisconnect("LINKEDIN")}
                                    disabled={isDisconnecting}
                                    className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
                                >
                                    <Power className="w-3 h-3"/> Déconnecter
                                </button>
                            ) : (
                                <button type="button" onClick={() => toast.info("Intégration OAuth à venir")} className="w-full py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition">
                                    Connecter le compte
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {/* 2. IDENTITÉ (Existant) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <Store className="w-5 h-5 text-indigo-500"/> Identité & SEO
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom de l'établissement</label>
                            <input name="name" defaultValue={initialData?.name} required className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ville</label>
                            <input name="city" defaultValue={initialData?.city} className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"/>
                        </div>
                        <div className="md:col-span-2">
                             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type d'activité</label>
                             <input name="type" defaultValue={initialData?.type} placeholder="Ex: Restaurant Italien" className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description courte</label>
                            <textarea name="description" defaultValue={initialData?.description} rows={2} className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"/>
                        </div>
                    </div>
                </div>
                
                {/* 3. MOTS CLÉS (Existant) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        🚀 Mots-clés Cibles
                    </h3>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Liste de mots-clés (séparés par des virgules)</label>
                    <input name="seoKeywords" defaultValue={initialData?.seoKeywords} placeholder="ex: disponible, maison vendu au bon prix" className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"/>
                </div>

            </div>

            {/* --- COLONNE DROITE : IA & ACTIONS --- */}
            <div className="space-y-6">
                
                {/* 4. CONFIG IA */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-purple-500"/> Configuration IA
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ton de réponse</label>
                            <select name="tone" defaultValue={initialData?.tone || "Professionnel"} className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                                <option value="Professionnel">👔 Professionnel</option>
                                <option value="Amical">🤝 Amical (Tutoiement)</option>
                                <option value="Luxe">✨ Luxe & Vouvoiement</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Signature automatique</label>
                            <input name="signature" defaultValue={initialData?.signature} className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"/>
                        </div>
                    </div>
                </div>

                {/* 5. URL GOOGLE */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        ⭐ Source Avis
                    </h3>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL Fiche Google</label>
                    <input name="googleUrl" defaultValue={initialData?.googleUrl} placeholder="https://g.page/..." className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 text-sm"/>
                </div>

                {/* BOUTON SAUVEGARDER (Sticky) */}
                <div className="sticky top-6">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition hover:scale-105"
                    >
                        {isLoading ? <Loader2 className="animate-spin"/> : <Save className="w-5 h-5"/>}
                        Sauvegarder tout
                    </button>
                </div>

            </div>
        </form>
    );
}