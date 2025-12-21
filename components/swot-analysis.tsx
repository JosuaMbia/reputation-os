"use client";

import { useState } from "react";
import { X, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface SwotProps {
    strengths: string[];
    weaknesses: string[];
}

export function SwotAnalysis({ strengths, weaknesses }: SwotProps) {
    const [selectedItem, setSelectedItem] = useState<{ type: 'strength' | 'weakness', text: string } | null>(null);

    // Simulation de conseils stratégiques basés sur le mot clé
    const getStrategy = (item: string, type: 'strength' | 'weakness') => {
        const keyword = item.split('(')[0].trim().toLowerCase();
        
        if (type === 'strength') {
            return {
                title: "Maintenir l'excellence",
                advice: `Vos clients adorent votre "${keyword}".`,
                action: "Utilisez ce point fort dans vos pubs Instagram. Demandez à vos clients satisfaits de mentionner spécifiquement ce point.",
                kpi: "Objectif : Maintenir > 4.8/5 sur ce critère."
            };
        } else {
             if (keyword.includes("service") || keyword.includes("accueil")) {
                return {
                    title: "Urgence SAV / Formation",
                    advice: "L'accueil est souvent cité négativement.",
                    action: "Briefer l'équipe sur le sourire à l'entrée. Rappeler chaque client mécontent sous 24h.",
                    kpi: "Objectif : Réduire les plaintes de 50% le mois prochain."
                };
             }
             if (keyword.includes("prix") || keyword.includes("cher")) {
                 return {
                    title: "Justifier la valeur",
                    advice: "Les clients trouvent ça cher.",
                    action: "Mieux expliquer la qualité des matériaux/ingrédients. Offrir une petite attention pour faire passer la pilule.",
                    kpi: "Objectif : Augmenter la valeur perçue."
                 };
             }
             return {
                 title: "Plan d'amélioration",
                 advice: `Le point "${keyword}" pose problème.`,
                 action: "Investiguez les 3 derniers avis concernés. Répondez avec empathie et proposez une solution.",
                 kpi: "Objectif : Repasser au dessus de 4.0/5."
             };
        }
    };

    const details = selectedItem ? getStrategy(selectedItem.text, selectedItem.type) : null;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* FORCES */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-xl flex flex-col h-full">
                    <h3 className="flex items-center gap-2 font-bold text-green-800 dark:text-green-300 mb-4">
                        <span className="bg-green-200 p-1 rounded">💪</span> Vos Forces
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {strengths.map((item, i) => (
                            <button key={i} onClick={() => setSelectedItem({ type: 'strength', text: item })} className="px-3 py-1 bg-white hover:bg-green-100 text-green-700 rounded-full text-sm font-medium shadow-sm border border-green-100 transition text-left">
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAIBLESSES */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl flex flex-col h-full">
                    <h3 className="flex items-center gap-2 font-bold text-red-800 dark:text-red-300 mb-4">
                        <span className="bg-red-200 p-1 rounded">⚠️</span> À Améliorer
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {weaknesses.map((item, i) => (
                            <button key={i} onClick={() => setSelectedItem({ type: 'weakness', text: item })} className="px-3 py-1 bg-white hover:bg-red-100 text-red-700 rounded-full text-sm font-medium shadow-sm border border-red-100 transition text-left">
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODALE DE CONSEIL STRATÉGIQUE */}
            {selectedItem && details && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
                        <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5"/>
                        </button>

                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${selectedItem.type === 'strength' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {selectedItem.type === 'strength' ? <TrendingUp className="w-6 h-6"/> : <AlertTriangle className="w-6 h-6"/>}
                        </div>

                        <h3 className="text-xl font-bold mb-1">{selectedItem.text}</h3>
                        <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider font-bold">{details.title}</p>

                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border-l-4 border-indigo-500">
                                <h4 className="font-bold text-sm mb-1 flex items-center gap-2"><Info className="w-4 h-4"/> Analyse</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{details.advice}</p>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                                <h4 className="font-bold text-sm mb-1 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Action Recommandée</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{details.action}</p>
                            </div>

                             <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h4 className="font-bold text-sm mb-1 text-gray-400">Suivi KPI</h4>
                                <p className="text-sm font-mono text-gray-800 dark:text-white">{details.kpi}</p>
                            </div>
                        </div>

                        <button onClick={() => setSelectedItem(null)} className="mt-6 w-full py-3 bg-gray-900 dark:bg-white dark:text-black text-white rounded-xl font-bold">
                            Compris, je m'en occupe
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}