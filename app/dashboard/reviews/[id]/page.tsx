import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function SettingsPage() {
  const { user } = useUser();
  const [businessName, setBusinessName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // TODO: Implémenter l'enregistrement dans la base de données
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 block">
          ← Retour au Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Paramètres</h1>
        
        {/* Section Compte */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Compte</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.primaryEmailAddress?.emailAddress || ''}
                disabled
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={user?.fullName || ''}
                disabled
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        {/* Section Business */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Informations Business</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de l'établissement
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Mon Restaurant"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google Business Profile ID
              </label>
              <input
                type="text"
                placeholder="accounts/{accountId}/locations/{locationId}"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        {/* Section API */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Clés API</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        {/* Section Notifications */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span className="text-gray-700 dark:text-gray-300">Recevoir des notifications pour les nouveaux avis</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span className="text-gray-700 dark:text-gray-300">Recevoir un rapport hebdomadaire</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <span className="text-gray-700 dark:text-gray-300">Alertes pour les avis négatifs</span>
            </label>
          </div>
        </div>
        
        {/* Bouton Sauvegarder */}
        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
        >
          Enregistrer les modifications
        </button>
        
        {saved && (
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg">
            ✓ Paramètres enregistrés avec succès !
          </div>
        )}
      </div>
    </div>
  );
}

export default async function ReviewsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const reviews = await prisma.review.findMany({
    where: { userId },
    include: { business: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 block">
          ← Retour au Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Gestion des Avis</h1>
        
        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
            <p className="text-gray-600 dark:text-gray-300">Aucun avis pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg dark:text-white">{review.authorName}</h3>
                  <span className="text-yellow-500">
                    {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                  </span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">{review.content}</p>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                </div>
                
                {review.response && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Votre réponse:</p>
                    <p className="text-gray-700 dark:text-gray-300">{review.response}</p>
                  </div>
                )}
                
                <Link 
                  href={`/dashboard/reviews/${review.id}`}
                  className="inline-block mt-4 text-blue-600 hover:underline"
                >
                  Voir détails →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ReviewDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: { business: true }
  });

  if (!review) {
    return <div className="p-8">Avis non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard/reviews" className="text-blue-600 hover:underline mb-4 block">
          ← Retour aux avis
        </Link>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">{review.authorName}</h2>
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < review.rating ? '⭐' : '☆'}</span>
            ))}
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{review.content}</p>
          <p className="text-sm text-gray-500">
            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
          </p>
          
          {review.response ? (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Votre réponse:</h3>
              <p className="text-gray-700 dark:text-gray-300 mt-2">{review.response}</p>
            </div>
          ) : (
            <form action="/api/ai/generate-response" method="POST" className="mt-6">
              <input type="hidden" name="reviewId" value={review.id} />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
              >
                🤖 Générer une réponse avec IA
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
