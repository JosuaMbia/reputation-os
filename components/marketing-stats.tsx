"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Eye, Heart, Share2, Zap } from "lucide-react";
import { getMarketingStats } from "@/app/actions/get-marketing-stats";

export function MarketingStats() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            const stats = await getMarketingStats();
            setData(stats);
            setIsLoading(false);
        };
        loadStats();
    }, []);

    if (isLoading) return <div className="h-64 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"/></div>;

    if (!data || data.kpi.views === 0) return null; // On n'affiche rien si pas de données

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 1. CARTES KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                        <Eye className="w-4 h-4 text-blue-500"/> Vues Totales
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.kpi.views.toLocaleString()}</p>
                    <span className="text-xs text-green-600 font-bold">+12% cette semaine</span>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                        <Heart className="w-4 h-4 text-pink-500"/> J'aime
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.kpi.likes.toLocaleString()}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                        <Share2 className="w-4 h-4 text-purple-500"/> Partages
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.kpi.shares.toLocaleString()}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Zap className="w-12 h-12 text-yellow-500"/>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-2">
                        <TrendingUp className="w-4 h-4 text-yellow-500"/> Engagement
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.kpi.engagementRate}%</p>
                    <span className="text-xs text-gray-400">Moyenne du secteur: 3.2%</span>
                </div>
            </div>

            {/* 2. GRAPHIQUE PRINCIPAL & INSIGHTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Graphique */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6">📈 Évolution de l'audience (7 jours)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chartData}>
                                <defs>
                                    <linearGradient id="colorVues" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="vues" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVues)" />
                                <Area type="monotone" dataKey="engagement" stroke="#ec4899" strokeWidth={3} fillOpacity={0} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Insights IA */}
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-xl text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse"/>
                            <h3 className="font-bold text-lg">Analyse IA</h3>
                        </div>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                            "Vos posts publiés le <span className="font-bold text-white">Mardi</span> et contenant des <span className="font-bold text-white">photos lumineuses</span> génèrent 25% plus d'interactions."
                        </p>
                        <div className="bg-white/10 p-3 rounded-lg text-xs space-y-2">
                            <p>✅ <strong>Top Format :</strong> Carrousel</p>
                            <p>❌ <strong>À éviter :</strong> Textes trop longs (> 3 lignes)</p>
                        </div>
                    </div>
                    <button className="w-full bg-white text-indigo-900 font-bold py-2 rounded-lg text-sm mt-4 hover:bg-indigo-50 transition">
                        Générer un post optimisé
                    </button>
                </div>
            </div>

            {/* 3. TABLEAU TOP CONTENU */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white">🏆 Vos Meilleurs Posts</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-medium">
                            <tr>
                                <th className="p-4">Contenu</th>
                                <th className="p-4">Plateforme</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Performance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {data.topPosts.map((post: any) => (
                                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <td className="p-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                                        {post.caption}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${post.platform === 'INSTAGRAM' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {post.platform}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {new Date(post.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-xs font-bold"><Eye className="w-3 h-3"/> {post.statsViews}</span>
                                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500" style={{ width: `${Math.min(post.statsViews / 10, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}