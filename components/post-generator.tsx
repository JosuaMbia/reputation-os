"use client";

import { useState } from "react";
import { generateSocialPost } from "@/app/actions/generate-post";
import { Sparkles, Loader2 } from "lucide-react";

export function PostGenerator({ review }: { review: any }) {
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        await generateSocialPost(review.id);
        setLoading(false);
    };

    return (
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition flex flex-col justify-between">
            <div>
                <p className="text-sm text-indigo-100 mb-2 italic">"{review.content.substring(0, 50)}..."</p>
                <div className="flex items-center gap-1 mb-3">
                    <span className="text-yellow-400 text-xs">★★★★★</span>
                    <span className="text-xs font-bold text-white">- {review.authorName}</span>
                </div>
            </div>
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-white text-indigo-600 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:shadow-lg transition"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                Générer un post
            </button>
        </div>
    );
}