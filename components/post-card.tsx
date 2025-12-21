"use client";

import { useState } from "react";
import { Copy, Check, Edit3, Share2 } from "lucide-react";

export function PostCard({ post }: { post: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [caption, setCaption] = useState(post.caption);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(caption);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 flex justify-between items-center text-white text-xs font-bold px-4">
                <span>INSTAGRAM</span>
                <span className="bg-black/20 px-2 py-0.5 rounded-full">BROUILLON</span>
            </div>

            {/* Image */}
            <div className="h-48 bg-gray-100 relative">
                <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
            </div>

            {/* Contenu */}
            <div className="p-4 flex-1 flex flex-col">
                {isEditing ? (
                    <textarea 
                        className="w-full h-32 p-2 text-sm border rounded bg-gray-50 dark:bg-gray-900 mb-2 focus:ring-2 focus:ring-purple-500 outline-none"
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
                        <button onClick={() => setIsEditing(false)} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold">
                            Terminer
                        </button>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                <Edit3 className="w-4 h-4"/>
                            </button>
                            <button onClick={handleCopy} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700">
                                {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                                {copied ? "Copié !" : "Copier texte"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}