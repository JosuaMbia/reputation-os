import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔵</span>
            <span className="text-xl font-bold text-gray-900">Reputation OS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            ⚡ Powered by GPT-4 & Google Reviews API
          </span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Gérez vos avis Google avec<br />
          <span className="text-blue-600">l'intelligence artificielle</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Reputation OS automatise la gestion de vos avis clients. Réponses personnalisées, analyses de sentiment et amélioration continue de votre réputation en ligne.
        </p>
        
        <div className="flex gap-4 justify-center mb-16">
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            ⚡ Accéder au Dashboard
          </Link>
          <button className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all border border-gray-300">
            En savoir plus
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfaction</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">-75%</div>
            <div className="text-gray-600">Temps gagné</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Automatisation</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Fonctionnalités principales</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Réponses IA</h3>
            <p className="text-gray-700">
              Génération automatique de réponses personnalisées et authentiques pour chaque avis grâce à GPT-4.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Analyse de sentiment</h3>
            <p className="text-gray-700">
              Comprendre les émotions de vos clients et identifier les points d'amélioration automatiquement.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Synchronisation Google</h3>
            <p className="text-gray-700">
              Importation automatique de vos avis Google My Business en temps réel.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Prêt à transformer votre réputation ?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Rejoignez les entreprises qui utilisent l'IA pour gérer leur réputation en ligne.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          Accéder à votre Dashboard
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          © 2024 Reputation OS. Powered by AI.
        </div>
      </footer>
    </div>
  );
}