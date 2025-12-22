"use client";

import { useState, useRef } from "react";
import { Copy, Check, Edit3, Share2, Camera, Info, Rocket, Loader2, X, AlertTriangle } from "lucide-react";
import { publishPost } from "@/app/actions/publish-post"; 
import { toast } from "sonner"; // ✅ Pour les jolies notifications

// Algorithme simple de conseil photo (Coach IA)
// ... (Gardez la même fonction getPhotoAdvice qu'avant, je l'abrège ici pour la lisibilité)
const getPhotoAdvice = (businessType: string, reviewContent: string) => {
    const content = reviewContent.toLowerCase();
    const type = businessType.toLowerCase();
    if (type.includes("garage") || type.includes("auto")) return "📸 Conseil : Une belle voiture propre devant l'enseigne ou une réparation technique en cours.";
    if (type.includes("boulangerie") || type.includes("resto")) return "📸 Conseil : Gros plan sur le produit avec un fond flou pour l'appétence.";
    return "📸 Conseil : Montrez votre équipe en action. Lumière naturelle recommandée !";
};

export function PostCard({ post }: { post: any }) {
    // --- ÉTATS ---
    const [isEditing, setIsEditing] = useState(false);
    const [caption, setCaption] = useState(post.caption);
    const [imageSrc, setImageSrc] = useState(post.imageUrl);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    
    // ✅ Nouvel état pour la Modale de confirmation
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // --- LOGIQUE ---

    // 1. Changement de photo
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setImageSrc(objectUrl);
            toast.info("Nouvelle photo chargée. N'oubliez pas de sauvegarder si vous éditez.");
        }
    };

    // 2. Partage Manuel (Amélioré UX)
    const handleShare = async () => {
        // Mobile Natif
        if (navigator.share && imageFile) {
            try {
                await navigator.share({ title: 'Nouveau Post', text: caption, files: [imageFile] });
                return;
            } catch (err) { console.log("Partage natif annulé"); }
        }

        // Fallback Desktop
        navigator.clipboard.writeText(caption);
        setCopied(true);
        const link = document.createElement('a');
        link.href = imageSrc;
        // On force le téléchargement plutôt que l'ouverture dans un nouvel onglet
        link.setAttribute('download', `post-${post.platform?.toLowerCase()}-${post.id}.jpg`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setCopied(false), 3000);
        // ✅ JOLIE NOTIFICATION AU LIEU DE ALERT()
        toast.success("Texte copié et image téléchargée !", {
            description: "Collez le texte et sélectionnez l'image sur votre réseau social."
        });
    };

    // 3. Déclencheur Publication Auto (Ouvre la modale)
    const requestAutoPublish = () => {
        setShowConfirmModal(true);
    };

    // 4. Exécution Publication Auto (Appelé par la modale)
    const confirmAutoPublish = async () => {
        setShowConfirmModal(false); // Fermer modale
        setIsPublishing(true);
        const result = await publishPost(post.id);
        setIsPublishing(false);

        if (result.success) {
            toast.success("Post publié avec succès !", { duration: 5000 });
            setTimeout(() => window.location.reload(), 1000); 
        } else {
            toast.error("Échec de la publication", { description: result.error });
        }
    };

    const advice = post.business && post.review ? getPhotoAdvice(post.business.type || "commerce", post.review.content) : "📸 Mettez en valeur votre travail.";

    // --- RENDER ---
    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full transition hover:shadow-xl">
                {/* Header */}
                <div className={`p-3 flex justify-between items-center text-white text-xs font-bold px-4 ${post.status === 'PUBLISHED' ? 'bg-green-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}>
                    <span className="flex items-center gap-1 flex-wrap"><Share2 className="w-3 h-3"/> {post.platform}</span>
                    <span className="bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
                        {post.status === 'PUBLISHED' ? 'EN LIGNE' : 'BROUILLON'}
                    </span>
                </div>

                {/* Image & Caméra */}
                <div className="relative h-64 bg-gray-100 group">
                    <img src={imageSrc} alt="Post visual" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                    {post.status !== 'PUBLISHED' && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 p-4 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                             <p className="text-white text-xs font-medium max-w-xs mb-2">{advice}</p>
                            <button className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition transform hover:scale-105 pointer-events-none">
                                <Camera className="w-4 h-4" /> Remplacer la photo
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                        </div>
                    )}
                </div>

                {/* Contenu Texte */}
                <div className="p-5 flex-1 flex flex-col">
                    {isEditing ? (
                        <textarea className="w-full h-40 p-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-600 mb-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none" value={caption} onChange={(e) => setCaption(e.target.value)} />
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-4 flex-1 leading-relaxed">{caption}</p>
                    )}

                    {/* BOUTONS ACTIONS */}
                    <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                        {isEditing ? (
                             <button onClick={() => { setIsEditing(false); toast.success("Texte mis à jour !"); }} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold transition">Valider le texte</button>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(true)} className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition" title="Éditer"><Edit3 className="w-4 h-4"/></button>
                                    <button 
                                        onClick={requestAutoPublish}
                                        disabled={isPublishing || post.status === "PUBLISHED"}
                                        className="flex-1 bg-pink-600 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow-pink-200"
                                    >
                                        {isPublishing ? <Loader2 className="animate-spin w-4 h-4"/> : <Rocket className="w-4 h-4"/>}
                                        {post.status === "PUBLISHED" ? "En ligne" : "Publier Auto"}
                                    </button>
                                </div>
                                <button onClick={handleShare} className={`w-full text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm hover:shadow ${copied ? "bg-green-600" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}>
                                    {copied ? <Check className="w-4 h-4"/> : (imageFile ? <Share2 className="w-4 h-4"/> : <Copy className="w-4 h-4"/>)}
                                    {copied ? "Copié !" : "Partage Manuel / Mobile"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* ✅ NOUVELLE ZONE : BARRE DE STATS (Visible si publié) */}
            {post.status === 'PUBLISHED' && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 text-xs flex justify-around border-t border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1" title="J'aime"><Heart className="w-3 h-3"/> {post.statsLikes || 0}</span>
                    <span className="flex items-center gap-1" title="Vues"><Eye className="w-3 h-3"/> {post.statsViews || 0}</span>
                    <span className="flex items-center gap-1" title="Clics"><MousePointerClick className="w-3 h-3"/> {post.statsClicks || 0}</span>
                </div>
            )}

            {/* ✅ MODALE DE CONFIRMATION CUSTOM (remplace le confirm() natif) */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95">
                        <button onClick={() => setShowConfirmModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                        <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-4 mx-auto">
                            <Rocket className="w-6 h-6"/>
                        </div>
                        <h3 className="text-xl font-bold text-center mb-2 dark:text-white">Confirmer la publication ?</h3>
                        <p className="text-center text-gray-500 mb-6 text-sm">
                            Vous allez publier ce contenu sur <strong>{post.platform}</strong>. Cette action est irréversible.
                        </p>
                        
                        {/* Alerte si pas de clés API (Simulation) */}
                        {(!post.business?.facebookAccessToken && (post.platform === 'FACEBOOK' || post.platform === 'INSTAGRAM')) && (
                             <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm flex items-start gap-2 mb-4">
                                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0"/>
                                <p>Attention : Votre compte Facebook/Instagram ne semble pas connecté dans les réglages. La publication automatique échouera probablement.</p>
                             </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition">Annuler</button>
                            <button onClick={confirmAutoPublish} className="flex-1 py-3 rounded-xl font-bold text-white bg-pink-600 hover:bg-pink-700 transition flex items-center justify-center gap-2">
                                <Rocket className="w-4 h-4"/> Oui, publier !
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}