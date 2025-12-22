"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation"; // ✅ Pour savoir sur quelle page on est
import { useUser } from "@clerk/nextjs"; // ✅ Pour récupérer le prénom
import { Send, Sparkles, X, Bot, Zap, RefreshCw, ChevronDown } from "lucide-react";
import { getDashboardData } from "@/app/actions/get-dashboard-data"; 

export function AICopilot() {
  // --- ÉTATS UX (Vision Proactive) ---
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  // --- ÉTATS LOGIQUES (Cerveau) ---
  const [context, setContext] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0); 
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Initialisation du système..." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ 1. EFFET PROACTIF : Ouverture auto sur le dashboard
  useEffect(() => {
    if (pathname === "/dashboard") {
       const timer = setTimeout(() => {
           // On n'ouvre que si ce n'est pas déjà ouvert
           setIsOpen(true);
       }, 1000); // 1 seconde de délai pour ne pas être agressif
       return () => clearTimeout(timer);
    }
  }, [pathname]);

  // ✅ 2. CONNEXION INTELLIGENTE (Mise à jour avec Prénom)
  useEffect(() => {
    let isMounted = true;

    const connectToBrain = async () => {
        try {
            const data = await getDashboardData();
            
            if (isMounted && data) {
                setContext(data);
                const score = parseFloat(data.ratingDisplay);
                
                // Analyse contextuelle
                const analysis = score < 4.0 
                    ? `⚠️ Note critique (${score}/5).` 
                    : `✅ Note solide (${score}/5).`;

                const firstName = user?.firstName ? ` ${user.firstName}` : "";

                setMessages([{
                    role: "assistant",
                    content: `Bonjour${firstName} ! 👋\nJe suis connecté à vos données.\n\n${analysis} J'ai analysé ${data.totalReviews} avis.\n\nJe suis prêt à rédiger des réponses ou créer des posts. Quelle est la priorité ?`
                }]);
            } else if (isMounted) {
                 setMessages([{
                    role: "assistant",
                    content: "Je n'arrive pas à lire les données. Cliquez sur l'icône de rafraîchissement 🔄 en haut."
                }]);
            }
        } catch (e) {
            console.error(e);
        }
    };
    
    // On lance la connexion seulement si l'utilisateur est chargé
    if (user) {
        connectToBrain();
    }

    return () => { isMounted = false };
  }, [retryCount, user]); 

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Simulation intelligente (V1)
    setTimeout(() => {
        let response = "Je ne comprends pas.";
        
        if (!context) {
            response = "Je ne suis pas encore synchronisé. Cliquez sur le petit bouton 'Refresh' 🔄.";
        } else {
            const lower = userMessage.toLowerCase();
            
            if (lower.includes("analy") || lower.includes("note") || lower.includes("audit")) {
                response = `📊 Audit Rapide :\n- Note : ${context.ratingDisplay}/5\n- Volume : ${context.totalReviews} avis\n- État : ${context.rating < 4 ? "Critique 🔴" : "Sain 🟢"}`;
            } else if (lower.includes("post") || lower.includes("pub") || lower.includes("insta")) {
                const fiveStarCount = context.distribution ? context.distribution[4] : 0;
                response = `📸 Super idée ! J'ai trouvé ${fiveStarCount} avis 5 étoiles parfaits pour Instagram.\n\nAllez dans l'onglet 'Marketing' pour voir les brouillons que j'ai préparés.`;
            } else if (lower.includes("avis") || lower.includes("répon")) {
                 response = "Pour les avis, je vous conseille de répondre d'abord aux négatifs. Voulez-vous une suggestion de réponse empathique ?";
            } else {
                response = "Je suis votre Copilote. Je peux :\n1. Analyser votre note\n2. Suggérer du contenu marketing\n3. Vous aider à répondre aux clients";
            }
        }

        setMessages(prev => [...prev, { role: "assistant", content: response }]);
        setIsLoading(false);
    }, 800);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 transition-all duration-300`}>
      
      {/* --- FENÊTRE DE CHAT --- */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 w-[90vw] md:w-[400px] h-[500px] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                    <Bot className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Copilot IA</h3>
                    <p className="text-[10px] opacity-90 flex items-center gap-1 font-semibold">
                        {context ? <><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/> Connecté</> : "🔴 Hors ligne"}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {!context && (
                    <button onClick={() => setRetryCount(c => c + 1)} className="hover:bg-white/20 p-1 rounded transition" title="Reconnecter">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                )}
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
                    <ChevronDown className="w-5 h-5" />
                </button>
            </div>
          </div>

          {/* Messages */}
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
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border shadow-sm flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"/>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"/>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"/>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div className="relative flex items-center">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Posez une question..."
                    className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BOUTON FLOTTANT (PULSE) --- */}
      {!isOpen && (
        <button 
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-110"
        >
            {/* ✅ L'ANIMATION PULSE POUR ATTIRER L'OEIL */}
            <span className="absolute inset-0 rounded-full bg-indigo-500 opacity-75 animate-ping group-hover:animate-none"></span>
            
            {/* Icône qui change au survol */}
            <Sparkles className={`w-6 h-6 transition-transform duration-500 ${isHovered ? 'rotate-180' : ''}`} />
            
            {/* Bulle d'info */}
            <span className="absolute right-16 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Ouvrir le Copilot
            </span>
        </button>
      )}
    </div>
  );
}