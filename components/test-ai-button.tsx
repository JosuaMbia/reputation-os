'use client'
import { useState } from "react";
import { testAiGeneration } from "@/app/actions/test-ai";

export function TestAiButton() {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    const result = await testAiGeneration();
    setReply(result || "Erreur");
    setLoading(false);
  };

  return (
    <div className="mt-4 p-4 border border-purple-200 bg-purple-50 rounded-lg">
      <h3 className="text-purple-900 font-bold mb-2">🧠 Test Cerveau IA</h3>
      <p className="text-xs text-purple-700 mb-3">Simulation : Réponse à un avis négatif (2/5) sur une boulangerie.</p>
      
      <button 
        onClick={handleTest} 
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold"
      >
        {loading ? "Génération..." : "✨ Générer une réponse IA"}
      </button>

      {reply && (
        <div className="mt-3 p-3 bg-white rounded border border-purple-100 text-sm text-gray-700 italic">
          "{reply}"
        </div>
      )}
    </div>
  );
}