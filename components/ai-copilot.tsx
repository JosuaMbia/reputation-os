"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Bot, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { getCopilotContext } from "@/app/actions/get-copilot-context"; // ✅ On importe l'action

interface Message {
  role: "user" | "assistant";
  content: string | React.ReactNode; // On autorise du JSX pour faire de jolies listes
}

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<any>(null); // Stocke les vraies données
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Bonjour ! Je connecte mes neurones à vos données... Un instant. 🧠" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. CHARGEMENT DES DONNÉES RÉELLES AU DÉMARRAGE
  useEffect(() => {
    const initContext = async () => {
        const data = await getCopilotContext();
        setContext(data);
        
        // Message d'accueil personnalisé une fois les données reçues
        if (data) {
            setMessages([{
                role: "assistant",
                content: `Je suis prêt ! Je vois que votre note actuelle est de ${data.rating}/5 avec ${data.reviewCount} avis. \n\nJe peux analyser vos points forts et faibles ou créer du contenu. Que souhaitez-vous faire ?`
            }]);
        }
    };
    initContext();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. LOGIQUE D'ANALYSE INTELLIGENTE (Simulation locale améliorée)
  const generateSmartResponse = (userInput: string) => {
    if (!context) return "Je n'arrive pas à lire vos données pour l'instant.";

    const lowerInput = userInput.toLowerCase();
    const rating = parseFloat(context.rating);

    // CAS A : DEMANDE D'ANALYSE (Forces / Faiblesses)
    if (lowerInput.includes("anal") || lowerInput.includes("problème") || lowerInput.includes("fonctionne")) {
        let analysis = "";
        
        // Logique conditionnelle basée sur la VRAIE note
        if (rating < 3.8) {
            return (
                <div className="space-y-3">
                    <p className="font-bold text-red-600 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Diagnostic Critique ({context.rating}/5)</p>
                    <p>Votre note est en dessous du seuil de confiance (4.0). Voici ce qui ne va pas :</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                        <li><strong>Volume faible :</strong> Avec seulement {context.reviewCount} avis, chaque note négative plombe votre moyenne.</li>
                        <li><strong>Impact SEO :</strong> Google pénalise les fiches sous 4.0. Vous perdez de la visibilité locale.</li>
                    </ul>
                    <p className="font-bold text-green-600 mt-2 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Plan d'action :</p>
                    <p>Il faut "noyer" les mauvais avis. Lancez une campagne SMS auprès de 10 clients fidèles dès aujourd'hui.</p>
                </div>
            );
        } else if (rating >= 4.5) {
            return `🚀 Excellent ! Votre note de ${context.rating} est un atout majeur. \n\n✅ Ce qui fonctionne : Vos clients sont ravis. \n⚠️ Ce qu'il faut faire : Ne pas relâcher. Transformez ces avis 5 étoiles en posts Instagram via la commande "Post".`;
        } else {
             return `Vous êtes dans la moyenne (${context.rating}). C'est bien, mais pas suffisant pour dominer la zone. Il vous manque environ 15 avis 5 étoiles pour passer à 4.5.`;
        }
    }

    // CAS B : DEMANDE DE POST MARKETING
    if (lowerInput.includes("post") || lowerInput.includes("pub")) {
        // On cherche le meilleur avis récent
        const bestReview = context.recentReviews.find((r: any) => r.rating === 5);
        if (bestReview) {
            return `📸 J'ai trouvé un super avis de ${bestReview.authorName} ! \n\nVoici une idée de légende pour Instagram :\n\n"${bestReview.content.substring(0, 50)}..." \n\nMerci à nos clients en or ! ⭐⭐⭐⭐⭐ #Satisfaction #${context.name}`;
        } else {
            return "Je n'ai pas trouvé d'avis récent 5 étoiles avec du texte pour créer un post. Essayez d'obtenir plus d'avis !";
        }
    }

    // DÉFAUT
    return "Je peux analyser vos forces/faiblesses ou générer un post. Dites 'Analyse' ou 'Post'.";
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    setTimeout(() => {
      const response = generateSmartResponse(userMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center gap-2 border-2 border-white/20 backdrop-blur-sm ${
          isOpen ? "bg-gray-900 rotate-90" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-110 hover:shadow-indigo-500/50"
        }`}
      >
        {isOpen ? <X className="text-white" /> : <Sparkles className="text-white w-6 h-6 animate-pulse" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 w-[90vw] md:w-96 h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 font-sans">
          
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center gap-3 shadow-md">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Bot className="text-white w-6 h-6" />
            </div>
            <div>
                <h3 className="text-white font-bold text-sm">Reputation Copilot</h3>
                <p className="text-indigo-100 text-[10px] flex items-center gap-1 uppercase tracking-wider font-semibold">
                    <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    Connecté à vos données
                </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none shadow-md" : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-600 shadow-sm flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ex: Analyse ma note..."
                className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
              />
              <button onClick={handleSend} disabled={!input.trim() || isLoading} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}