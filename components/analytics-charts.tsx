'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// On active les modules de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsChartsProps {
  distribution: number[]; // [nb 1 étoile, nb 2 étoiles, ... , nb 5 étoiles]
  timelineLabels: string[]; // ["Jan", "Fév", "Mars"]
  timelineData: number[];   // [12, 15, 28]
}

export function AnalyticsCharts({ distribution, timelineLabels, timelineData }: AnalyticsChartsProps) {
  
  // Config du Graphique en Barres (Distribution 1-5 étoiles)
  const barData = {
    labels: ['1 ⭐', '2 ⭐', '3 ⭐', '4 ⭐', '5 ⭐'],
    datasets: [
      {
        label: "Nombre d'avis",
        data: distribution,
        backgroundColor: [
          '#ef4444', // Rouge (1)
          '#f97316', // Orange (2)
          '#eab308', // Jaune (3)
          '#84cc16', // Vert clair (4)
          '#22c55e', // Vert (5)
        ],
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Répartition des Notes' },
    },
    scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  // Config du Graphique en Ligne (Croissance)
  const lineData = {
    labels: timelineLabels,
    datasets: [
      {
        label: 'Nouveaux Avis',
        data: timelineData,
        borderColor: '#4f46e5', // Indigo
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        tension: 0.3, // Courbe lissée
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Évolution Mensuelle' },
    },
    scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Graphique 1 : Distribution */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <Bar data={barData} options={barOptions} />
      </div>

      {/* Graphique 2 : Évolution */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        {timelineData.length > 0 ? (
             <Line data={lineData} options={lineOptions} />
        ) : (
             <div className="h-64 flex items-center justify-center text-gray-400 italic">
                Pas assez de données temporelles
             </div>
        )}
      </div>
    </div>
  );
}