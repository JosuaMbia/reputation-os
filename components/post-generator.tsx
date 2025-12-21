"use client";

import { useState } from "react";
import { generateSocialPost } from "@/app/actions/generate-post";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function PostGenerator({ review }: { review: any }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        setLoading(true);
        await generateSocialPost(review.id);
        setLoading(false);
        router.refresh(); // Rafraîchit la page pour afficher le nouveau post
    };

    return (
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition">
            <p className="text-sm text-indigo-100 mb-3 italic">"{review.content.substring(0, 60)}..."</p>
            <p className="text-xs font-bold text-white mb-3">- {review.authorName}</p>
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-white text-indigo-600 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:shadow-lg transition"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                Créer un post
            </button>
        </div>
    );
}