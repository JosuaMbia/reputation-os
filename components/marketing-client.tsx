"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { CreatePostModal } from "@/components/create-post-modal";

export function CreatePostButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition transform hover:-translate-y-1"
            >
                <Sparkles className="w-5 h-5 text-yellow-300" />
                Nouveau Post IA
            </button>

            <CreatePostModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    );
}