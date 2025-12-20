"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Bot, Zap } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Bonjour ! Je suis votre Expert Marketing IA. 🤖\n\nJe surveille votre réputation 24/7. Je peux analyser vos avis, rédiger des réponses ou créer des posts pour vos réseaux sociaux.\n\nPar quoi on commence ?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // --- SIMULATION DU CERVEAU (En attendant le vrai backend) ---
    setTimeout(() => {
      let response = "Je n'ai pas encore accès à vos données en temps réel, mais je suis prêt à être connecté !";
      
      const lowerInput = userMessage.toLowerCase();
      
      if (lowerInput.includes("post") || lowerInput.includes("pub") || lowerInput.includes("instagram")) {
        response = "Excellente initiative ! 📸 J'ai repéré un avis 5 étoiles de 'Julie' avec une photo magnifique. \n\nJe peux générer un visuel 'Citation Client' pour Instagram. On le fait ?";
      } else if (lowerInput.includes("anal") || lowerInput.includes("stat") || lowerInput.includes("note")) {
        response = "📊 Analyse rapide : Votre note est stable à 4.8/5, bravo ! \n\nCependant, j'ai noté une baisse de réactivité le week-end (-15%). Voulez-vous que je prépare des réponses automatiques pour le samedi ?";
      } else if (lowerInput.includes("avis") || lowerInput.includes("mauvais")) {
        response = "Ne vous inquiétez pas pour cet avis négatif. Le mieux est de répondre avec empathie. \n\nJe vous ai préparé un brouillon de réponse qui invite le client à revenir tester le nouveau menu. Je vous le montre ?";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsLoading(false);
    }, 1500); // Délai pour faire "comme si" il réfléchissait
  };

  return (
    <>
      {/* BOUTON FLOTTANT (Toujours visible) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center gap-2 border-2 border-white/20 backdrop-blur-sm ${
          isOpen ? "bg-gray-900 rotate-90" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-110 hover:shadow-indigo-500/50"
        }`}
      >
        {isOpen ? <X className="text-white" /> : <Sparkles className="text-white w-6 h-6 animate-pulse" />}
      </button>

      {/* FENÊTRE DE CHAT */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 w-[90vw] md:w-96 h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 font-sans">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center gap-3 shadow-md">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Bot className="text-white w-6 h-6" />
            </div>
            <div>
                <h3 className="text-white font-bold text-sm">Reputation Copilot</h3>
                <p className="text-indigo-100 text-[10px] flex items-center gap-1 uppercase tracking-wider font-semibold">
                    <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    IA Active
                </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none shadow-md"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-none shadow-sm"
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

          {/* Input */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Demandez une analyse ou un post..."
                className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg hover:shadow-indigo-500/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-center text-gray-400 mt-2 font-medium">
                Propulsé par GPT-4o • Vos données restent privées
            </div>
          </div>
        </div>
      )}
    </>
  );
}