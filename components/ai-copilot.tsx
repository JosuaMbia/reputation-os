"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Bot, Zap, RefreshCw } from "lucide-react";
import { getDashboardData } from "@/app/actions/get-dashboard-data"; // ✅ On utilise le connecteur principal

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0); // Pour forcer le rechargement
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Bonjour ! Je tente de me connecter à vos données..." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ CONNEXION ROBUSTE AU DÉMARRAGE
  useEffect(() => {
    let isMounted = true;

    const connectToBrain = async () => {
        try {
            console.log("Tentative de connexion IA...");
            const data = await getDashboardData();
            
            if (isMounted && data) {
                setContext(data);
                const score = parseFloat(data.ratingDisplay);
                const analysis = score < 4.0 
                    ? `⚠️ Note critique (${score}/5). Il faut agir sur les avis récents.` 
                    : `✅ Note solide (${score}/5). Vos clients sont contents !`;

                setMessages([{
                    role: "assistant",
                    content: `Connecté ! 🧠\n\nJ'ai analysé ${data.totalReviews} avis.\n${analysis}\n\nJe peux générer des réponses ou des posts marketing. Dites-moi quoi faire !`
                }]);
            } else if (isMounted) {
                 setMessages([{
                    role: "assistant",
                    content: "Je n'arrive pas à lire les données. Cliquez sur l'icône de rafraîchissement 🔄 en haut de cette fenêtre."
                }]);
            }
        } catch (e) {
            console.error(e);
        }
    };
    connectToBrain();

    return () => { isMounted = false };
  }, [retryCount]); // Se relance si on clique sur le bouton retry

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Simulation intelligente basée sur le contexte
    setTimeout(() => {
        let response = "Je ne comprends pas.";
        
        if (!context) {
            response = "Je ne suis pas encore synchronisé. Cliquez sur le petit bouton 'Refresh' (flèches) en haut à droite de cette fenêtre.";
        } else {
            const lower = userMessage.toLowerCase();
            
            // Logique de réponse
            if (lower.includes("analy") || lower.includes("note") || lower.includes("audit")) {
                response = `📊 Audit Rapide :\n- Note : ${context.ratingDisplay}/5\n- Volume : ${context.totalReviews} avis\n- État : ${context.rating < 4 ? "Critique 🔴" : "Sain 🟢"}`;
            } else if (lower.includes("post") || lower.includes("pub") || lower.includes("insta")) {
                const fiveStarCount = context.distribution ? context.distribution[4] : 0;
                response = `📸 J'ai trouvé ${fiveStarCount} avis 5 étoiles parfaits pour Instagram ! \n\nJe peux en transformer un en visuel citation. Voulez-vous voir un brouillon ?`;
            } else if (lower.includes("avis") || lower.includes("négatif")) {
                 response = "Pour les avis négatifs, la clé est la rapidité. Voulez-vous que je rédige une réponse type empathique ?";
            } else {
                response = "Je suis votre Copilote. Je peux :\n1. Analyser votre note ('Analyse')\n2. Créer du contenu ('Post')\n3. Vous aider à répondre ('Réponse')";
            }
        }

        setMessages(prev => [...prev, { role: "assistant", content: response }]);
        setIsLoading(false);
    }, 800);
  };

  return (
    <>
      {/* BOUTON FLOTTANT */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-50 transition-all duration-300 border-2 border-white/20 backdrop-blur-md ${isOpen ? "bg-gray-900 rotate-90" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-110"}`}
      >
        {isOpen ? <X className="text-white"/> : <Sparkles className="text-white w-6 h-6 animate-pulse"/>}
      </button>

      {/* FENÊTRE DE CHAT */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 w-[90vw] md:w-96 h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col font-sans animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center shadow-md rounded-t-2xl">
            <div className="flex items-center gap-3">
                <Bot className="text-white w-6 h-6" />
                <div>
                    <h3 className="text-white font-bold text-sm">Reputation Copilot</h3>
                    <p className="text-indigo-100 text-[10px] uppercase font-bold flex items-center gap-1">
                        {context ? <><Zap className="w-3 h-3 text-yellow-300 fill-yellow-300"/> En ligne</> : "🔴 Déconnecté"}
                    </p>
                </div>
            </div>
            {/* Bouton pour forcer la reconnexion */}
            {!context && (
                <button 
                    onClick={() => setRetryCount(c => c + 1)} 
                    className="text-white hover:bg-white/20 p-2 rounded-full transition animate-spin-slow" 
                    title="Forcer la connexion"
                >
                    <RefreshCw className="w-4 h-4"/>
                </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-none"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-600 shadow-sm flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input 
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Posez une question..." 
                className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
            />
            <button onClick={handleSend} disabled={!input.trim()} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md">
                <Send className="w-4 h-4"/>
            </button>
          </div>
        </div>
      )}
    </>
  );
}