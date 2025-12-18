import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, Star, MessageSquare, Smartphone, Zap, BarChart3, ShieldCheck } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();

  // Si l'utilisateur est déjà connecté, on le redirige directement vers le dashboard
  // (Optionnel : vous pouvez retirer ça si vous voulez qu'ils voient quand même la landing page)
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Star className="fill-current" /> Reputation OS
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
              Connexion
            </Link>
            <Link href="/sign-up" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30">
              Essayer Gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Fond décoratif (Gradient) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-50 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-6 border border-blue-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Nouveau : L'IA répond à vos avis automatiquement
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
            Transformez vos Avis Google en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Aimant à Clients</span>
          </h1>
          
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            La solution tout-en-un pour les commerçants locaux. Collectez plus d'avis, répondez en 1 clic grâce à l'IA et grimpez dans les résultats Google.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl text-lg hover:bg-blue-700 transition shadow-xl hover:shadow-blue-600/20 flex items-center justify-center gap-2">
              Commencer maintenant <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 font-bold rounded-xl text-lg hover:bg-gray-50 transition flex items-center justify-center">
              Voir la démo
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Pas de carte requise</span>
            <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> Installation en 2 min</span>
          </div>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tout ce dont vous avez besoin pour briller 🌟</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Fini la gestion manuelle et fastidieuse. Reputation OS automatise votre e-réputation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 text-2xl">
                <Smartphone />
              </div>
              <h3 className="text-xl font-bold mb-3">Collecte par SMS & QR</h3>
              <p className="text-gray-500">
                Envoyez des demandes d'avis directement sur le mobile de vos clients ou via un QR Code comptoir. Taux de conversion x3.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 text-2xl">
                <MessageSquare />
              </div>
              <h3 className="text-xl font-bold mb-3">Réponses IA Magiques</h3>
              <p className="text-gray-500">
                Ne cherchez plus vos mots. Notre IA analyse le sentiment et rédige une réponse personnalisée et parfaite en 1 seconde.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 text-2xl">
                <BarChart3 />
              </div>
              <h3 className="text-xl font-bold mb-3">Boost SEO Local</h3>
              <p className="text-gray-500">
                Plus d'avis et des réponses régulières signalent à Google que votre établissement est actif. Remontez dans les recherches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF (Mock) --- */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Ils nous font confiance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center justify-center font-bold text-2xl">BOULANGERIE<span className="text-orange-500">.</span></div>
            <div className="flex items-center justify-center font-bold text-2xl">GARAGE<span className="text-blue-500">PRO</span></div>
            <div className="flex items-center justify-center font-bold text-2xl">COIFFURE<span className="text-pink-500">STYLE</span></div>
            <div className="flex items-center justify-center font-bold text-2xl">RESTAURANT<span className="text-red-500">ITALIA</span></div>
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">Prêt à faire décoller votre établissement ?</h2>
          <p className="text-blue-100 text-lg mb-10">
            Rejoignez les commerçants qui ont compris que la réputation est leur meilleur atout marketing.
          </p>
          <Link href="/sign-up" className="inline-block px-10 py-5 bg-white text-blue-600 font-bold rounded-full text-xl hover:bg-gray-100 transition shadow-2xl">
            Essayer gratuitement maintenant
          </Link>
          <p className="mt-6 text-sm text-blue-200 opacity-80">Aucune carte bancaire requise pour le test.</p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <Star className="fill-current text-blue-500" /> Reputation OS
            </div>
            <p className="text-sm">
              L'outil de gestion d'avis nouvelle génération pour les pros.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li>Fonctionnalités</li>
              <li>Tarifs (Bientôt)</li>
              <li>Témoignages</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li>Mentions légales</li>
              <li>Confidentialité</li>
              <li>CGV</li>
            </ul>
          </div>
          <div>
            <p className="text-xs">© 2024 Reputation OS. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}