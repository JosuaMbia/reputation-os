"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from "recharts";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";

interface TimelineSet {
    labels: string[];
    data: number[];
}

interface AnalyticsProps {
  distribution: number[];
  timelineData: {
      daily: TimelineSet;
      monthly: TimelineSet;
      yearly: TimelineSet;
  };
}

// ✅ C'EST ICI LE FIX : "export function" (pas de default)
export function AnalyticsCharts({ distribution, timelineData }: AnalyticsProps) {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<"daily" | "monthly" | "yearly">("monthly");

  // --- LOGIQUE GRAPHIQUE BARRES ---
  const barData = distribution.map((count, index) => ({
    name: `${index + 1} ★`,
    count: count,
    rating: index + 1
  }));

  const getBarColor = (index: number) => {
    if (index < 2) return "#EF4444"; 
    if (index === 2) return "#F59E0B"; 
    return "#10B981"; 
  };

  const handleBarClick = (data: any) => {
    const rating = data?.rating || data?.activePayload?.[0]?.payload?.rating;
    if (rating) router.push(`/dashboard/reviews?rating=${rating}`);
  };

  // --- LOGIQUE GRAPHIQUE COURBE ---
  const currentTimeline = timelineData[timeRange];
  
  const lineChartData = currentTimeline.labels.map((label, index) => ({
      name: label,
      avis: currentTimeline.data[index] || 0
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. RÉPARTITION */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-700 dark:text-gray-200">Répartition des Notes</h3>
            <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 cursor-pointer hover:bg-indigo-100">
                <Filter className="w-3 h-3"/> Filtre actif
            </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={30} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
              <Bar 
                dataKey="count" 
                radius={[0, 4, 4, 0]} 
                barSize={20} 
                onClick={handleBarClick} 
                style={{ cursor: 'pointer' }}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} cursor="pointer" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. ÉVOLUTION TEMPORELLE */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h3 className="font-bold text-gray-700 dark:text-gray-200">Volume d'avis</h3>
                <p className="text-xs text-gray-400">Impact des campagnes</p>
            </div>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button onClick={() => setTimeRange("daily")} className={`px-3 py-1 text-xs font-bold rounded-md transition ${timeRange === "daily" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}>Jours</button>
                <button onClick={() => setTimeRange("monthly")} className={`px-3 py-1 text-xs font-bold rounded-md transition ${timeRange === "monthly" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}>Mois</button>
                <button onClick={() => setTimeRange("yearly")} className={`px-3 py-1 text-xs font-bold rounded-md transition ${timeRange === "yearly" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"}`}>Année</button>
            </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineChartData}>
              <defs>
                <linearGradient id="colorAvis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px' }} />
              <Area type="monotone" dataKey="avis" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAvis)" animationDuration={500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}