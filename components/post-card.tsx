"use client";

import { useState, useRef } from "react";
import { Copy, Check, Edit3, Share2, Camera, Info, Rocket, Loader2 } from "lucide-react";
import { publishPost } from "@/app/actions/publish-post"; 

// Algorithme simple de conseil photo (Coach IA)
const getPhotoAdvice = (businessType: string, reviewContent: string) => {
    const content = reviewContent.toLowerCase();
    const type = businessType.toLowerCase();

    if (type.includes("garage") || type.includes("auto")) {
        if (content.includes("rapide") || content.includes("urgence")) return "📸 Conseil : Prenez une photo d'une réparation en cours ou d'une clé à molette posée sur un pneu.";
        if (content.includes("accueil") || content.includes("sympa")) return "📸 Conseil : Un selfie souriant de l'équipe ou une photo de l'accueil.";
        return "📸 Conseil : Une belle voiture propre devant l'enseigne.";
    }
    if (type.includes("boulangerie") || type.includes("resto") || type.includes("food")) {
        if (content.includes("frais") || content.includes("chaud")) return "📸 Conseil : Gros plan sur le produit avec un fond flou. La texture doit se voir.";
        return "📸 Conseil : Une vue d'ensemble de la vitrine bien remplie.";
    }
    return "📸 Conseil : Montrez le produit mentionné dans l'avis ou votre équipe en action. Lumière naturelle recommandée !";
};

export function PostCard({ post }: { post: any }) {
    // --- ÉTATS ---
    const [isEditing, setIsEditing] = useState(false);
    const [caption, setCaption] = useState(post.caption);
    
    // États Image
    const [imageSrc, setImageSrc] = useState(post.imageUrl);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // États Actions
    const [copied, setCopied] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // --- LOGIQUE ---

    // 1. Changement de photo
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setImageSrc(objectUrl);
        }
    };

    // 2. Partage Manuel (Mobile / Copier-Coller)
    const handleShare = async () => {
        if (navigator.share && imageFile) {
            try {
                await navigator.share({
                    title: 'Nouveau Post',
                    text: caption,
                    files: [imageFile]
                });
                return;
            } catch (err) {
                console.log("Partage annulé ou non supporté.");
            }
        }

        navigator.clipboard.writeText(caption);
        setCopied(true);
        
        // Téléchargement pour PC
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = `post-${post.platform?.toLowerCase() || 'social'}-${post.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => setCopied(false), 3000);
        alert("Texte copié ! L'image a été téléchargée.");
    };

    // 3. Publication Auto (API)
    const handleAutoPublish = async () => {
        if(!confirm("Voulez-vous vraiment publier ce post maintenant sur " + post.platform + " ?")) return;

        setIsPublishing(true);
        const result = await publishPost(post.id);
        setIsPublishing(false);

        if (result.success) {
            alert("✅ Post publié avec succès !");
            window.location.reload(); 
        } else {
            alert("❌ Erreur (Configuration requise) : " + result.error);
        }
    };

    const advice = post.business && post.review 
        ? getPhotoAdvice(post.business.type || "commerce", post.review.content) 
        : "📸 Mettez en valeur votre travail.";

    // --- RENDER ---
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full transition hover:shadow-xl">
            
            {/* Header */}
            <div className={`p-3 flex justify-between items-center text-white text-xs font-bold px-4 ${post.status === 'PUBLISHED' ? 'bg-green-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}>
                <span className="flex items-center gap-1"><Share2 className="w-3 h-3"/> {post.platform}</span>
                <span className="bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {post.status === 'PUBLISHED' ? 'EN LIGNE' : 'BROUILLON'}
                </span>
            </div>

            {/* Image */}
            <div className="relative h-64 bg-gray-100 group">
                <img src={imageSrc} alt="Post visual" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <p className="text-white text-xs font-medium max-w-xs">{advice}</p>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition transform hover:scale-105"
                    >
                        <Camera className="w-4 h-4" />
                        Remplacer la photo
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                </div>
            </div>

            {/* Info Coach */}
            {post.imageUrl === imageSrc && post.status !== 'PUBLISHED' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border-b border-blue-100 dark:border-blue-800 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
                        {advice}
                    </p>
                </div>
            )}

            {/* Contenu */}
            <div className="p-5 flex-1 flex flex-col">
                {isEditing ? (
                    <textarea 
                        className="w-full h-40 p-3 text-sm border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white dark:border-gray-600 mb-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    />
                ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mb-4 flex-1 leading-relaxed">
                        {caption}
                    </p>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    {isEditing ? (
                         <button onClick={() => setIsEditing(false)} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold transition">
                            Valider le texte
                        </button>
                    ) : (
                        <>
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(true)} className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition" title="Éditer le texte">
                                    <Edit3 className="w-4 h-4"/>
                                </button>
                                
                                <button 
                                    onClick={handleAutoPublish}
                                    disabled={isPublishing || post.status === "PUBLISHED"}
                                    className="flex-1 bg-pink-600 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow-pink-200"
                                >
                                    {isPublishing ? <Loader2 className="animate-spin w-4 h-4"/> : <Rocket className="w-4 h-4"/>}
                                    {post.status === "PUBLISHED" ? "En ligne" : "Publier Auto"}
                                </button>
                            </div>

                            <button 
                                onClick={handleShare} 
                                className={`w-full text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm hover:shadow ${copied ? "bg-green-600" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
                            >
                                {copied ? <Check className="w-4 h-4"/> : (imageFile ? <Share2 className="w-4 h-4"/> : <Copy className="w-4 h-4"/>)}
                                {copied ? "Copié !" : "Partage Manuel / Mobile"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}