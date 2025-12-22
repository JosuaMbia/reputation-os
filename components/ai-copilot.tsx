"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Send, Sparkles, X, Bot, Zap, RefreshCw, ChevronDown, Loader2 } from "lucide-react";
import { getDashboardData } from "@/app/actions/get-dashboard-data"; 
import { chatWithCopilot } from "@/app/actions/chat-copilot"; // ✅ IMPORT DU CERVEAU

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  // États du Cerveau
  const [context, setContext] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Initialisation de l'analyse..." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. OUVERTURE AUTO
  useEffect(() => {
    if (pathname === "/dashboard") {
       const timer = setTimeout(() => setIsOpen(true), 1000);
       return () => clearTimeout(timer);
    }
  }, [pathname]);

  // 2. CONNEXION INITIALE (Récupération des stats pour l'affichage "En ligne")
  useEffect(() => {
    let isMounted = true;
    const connectToBrain = async () => {
        try {
            const data = await getDashboardData();
            if (isMounted && data) {
                setContext(data);
                const firstName = user?.firstName ? ` ${user.firstName}` : "";
                
                // Message d'accueil PROACTIF
                setMessages([{
                    role: "assistant",
                    content: `Bonjour${firstName} ! 👋\n\nJ'ai lu vos ${data.totalReviews} avis.\nJe suis prêt à analyser vos forces/faiblesses ou à rédiger du contenu.\n\nPosez-moi une question comme :\n"Quels sont mes points faibles ?" ou "Génère un post sur le dernier avis 5 étoiles".`
                }]);
            }
        } catch (e) { console.error(e); }
    };
    if (user) connectToBrain();
    return () => { isMounted = false };
  }, [user]); 

  // Scroll auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ 3. ENVOI DU MESSAGE À L'IA (Le Vrai Moteur)
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input;
    setInput(""); // Vider l'input tout de suite
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
        // On prépare un petit historique pour le contexte (les 4 derniers messages)
        const conversationHistory = messages.slice(-4).map(m => ({ 
            role: m.role, 
            content: m.content 
        }));

        // APPEL SERVEUR RÉEL
        const response = await chatWithCopilot(userMessage, conversationHistory);

        if (response.error) {
            setMessages(prev => [...prev, { role: "assistant", content: "⚠️ " + response.error }]);
        } else {
            setMessages(prev => [...prev, { role: "assistant", content: response.message }]);
        }

    } catch (error) {
        setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion au cerveau IA." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 transition-all duration-300`}>
      
      {/* --- FENÊTRE DE CHAT --- */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 w-[90vw] md:w-[400px] h-[500px] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white shadow-md z-10">
            <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                    <Bot className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Copilot Expert</h3>
                    <p className="text-[10px] opacity-90 flex items-center gap-1 font-semibold">
                        {context ? <><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/> Connecté aux données</> : "Initialisation..."}
                    </p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
                <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Zone */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-tl-none'
                    }`}>
                        {msg.content}
                    </div>
                </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border shadow-sm flex items-center gap-2 text-xs text-gray-500">
                        <Loader2 className="w-3 h-3 animate-spin text-indigo-500"/>
                        Analyse en cours...
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Zone */}
          <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div className="relative flex items-center">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Posez une question sur vos avis..."
                    className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    disabled={isLoading}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
            <div className="text-center mt-2">
                 <p className="text-[9px] text-gray-400">Powered by GPT-4o • Analyse temps réel</p>
            </div>
          </div>
        </div>
      )}

      {/* --- BOUTON FLOTTANT --- */}
      {!isOpen && (
        <button 
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-110"
        >
            <span className="absolute inset-0 rounded-full bg-indigo-500 opacity-75 animate-ping group-hover:animate-none"></span>
            <Sparkles className={`w-6 h-6 transition-transform duration-500 ${isHovered ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}