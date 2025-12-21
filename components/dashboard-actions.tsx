"use client";

import { useState } from "react";
import { Download, Send, CheckCircle, Loader2 } from "lucide-react";

// --- BOUTON QR CODE ---
export function QrCodeCard({ googleUrl }: { googleUrl?: string | null }) {
    const [downloading, setDownloading] = useState(false);
    
    // ✅ CORRECTION : On encode l'URL pour éviter les bugs avec les caractères spéciaux
    const safeUrl = encodeURIComponent(googleUrl || "https://google.com");
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${safeUrl}`;

    const handleDownload = async () => {
        setDownloading(true);
        try {
            // 1. On récupère l'image
            const response = await fetch(qrApiUrl);
            const blob = await response.blob();
            
            // 2. On crée un lien de téléchargement invisible
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "mon-qr-code-avis.png"; // Nom du fichier téléchargé
            document.body.appendChild(link);
            
            // 3. On déclenche le clic
            link.click();
            
            // 4. Nettoyage
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert("Le téléchargement automatique a échoué. L'image va s'ouvrir dans un nouvel onglet.");
            window.open(qrApiUrl, '_blank'); // Solution de secours
        }
        setDownloading(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-indigo-300 transition group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                 <div className="text-3xl bg-purple-50 w-fit p-2 rounded-lg">🔳</div>
            </div>
            <h3 className="font-bold text-lg mb-1 dark:text-white">QR Code Comptoir</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1">
                Affiche à scanner pour vos clients sur place.
            </p>
            <div className="flex justify-center mb-4">
                {/* L'image s'affiche ici */}
                <img src={qrApiUrl} alt="QR Code" className="w-32 h-32 border p-1 rounded-lg shadow-sm"/>
            </div>
            <button 
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-gray-100 dark:bg-gray-700 dark:text-white text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex justify-center items-center gap-2"
            >
                {downloading ? <Loader2 className="animate-spin w-4 h-4"/> : <Download className="w-4 h-4"/>}
                {downloading ? "Téléchargement..." : "Télécharger PDF"}
            </button>
        </div>
    );
}

// --- BOUTON SMS UNITAIRE ---
export function SmsCard() {
    const [step, setStep] = useState<"idle" | "sending" | "success">("idle");
    const [phone, setPhone] = useState("");

    const handleSend = () => {
        if(!phone) return;
        setStep("sending");
        
        // Simulation d'envoi API (Pour l'instant, c'est une simulation visuelle)
        setTimeout(() => {
            setStep("success");
            setTimeout(() => setStep("idle"), 3000); // Reset après 3s
            setPhone("");
        }, 1500);
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-indigo-300 transition group flex flex-col h-full">
             <div className="flex justify-between items-start mb-4">
                 <div className="text-3xl bg-green-50 w-fit p-2 rounded-lg">📱</div>
            </div>
            <h3 className="font-bold text-lg mb-1 dark:text-white">SMS Unitaire</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1">
                Envoi rapide à un seul client après son passage.
            </p>
            
            {step === "success" ? (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg text-center font-bold flex flex-col items-center justify-center h-full animate-in fade-in">
                    <CheckCircle className="w-8 h-8 mb-2"/>
                    Envoyé avec succès !
                </div>
            ) : (
                <div className="space-y-3">
                    <input 
                        type="tel" 
                        placeholder="+33 6 12 34 56 78"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                    {/* ✅ CORRECTION : Bouton Bleu (Indigo) pour montrer qu'il est actif */}
                    <button 
                        onClick={handleSend}
                        disabled={step === "sending" || !phone}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                         {step === "sending" ? <Loader2 className="animate-spin w-4 h-4"/> : <Send className="w-4 h-4"/>}
                        {step === "sending" ? "Envoi..." : "Envoyer"}
                    </button>
                </div>
            )}
        </div>
    );
}