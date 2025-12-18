import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Check, CreditCard, Zap } from "lucide-react";

export default async function SubscriptionPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const business = await prisma.business.findFirst({
    where: { userId }
  });

  if (!business) redirect("/onboarding");

  // On vérifie si l'abonnement est actif
  // (Date de fin existe ET est dans le futur)
  const isPro = business.stripeCurrentPeriodEnd 
    && new Date(business.stripeCurrentPeriodEnd) > new Date();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Abonnement</h1>
        <p className="text-gray-500 mb-8">Gérez votre plan et vos factures.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* PLAN GRATUIT */}
          <div className={`p-8 rounded-2xl border-2 ${!isPro ? 'border-blue-500 bg-white shadow-lg' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
            <h3 className="text-xl font-bold text-gray-900">Découverte</h3>
            <p className="text-4xl font-extrabold mt-4">0€ <span className="text-base font-normal text-gray-500">/ mois</span></p>
            <p className="text-gray-500 mt-2">Pour tester la puissance de l'IA.</p>
            
            <ul className="mt-8 space-y-4">
              <li className="flex gap-3 text-sm"><Check className="w-5 h-5 text-green-500"/> 3 Réponses IA / mois</li>
              <li className="flex gap-3 text-sm"><Check className="w-5 h-5 text-green-500"/> QR Code basique</li>
              <li className="flex gap-3 text-sm text-gray-400"><Check className="w-5 h-5"/> Pas d'analytics avancés</li>
            </ul>

            {isPro ? (
              <button className="mt-8 w-full py-3 rounded-xl border border-gray-300 font-bold text-gray-500 cursor-not-allowed">
                Inclus
              </button>
            ) : (
              <button className="mt-8 w-full py-3 rounded-xl bg-gray-100 font-bold text-gray-600 border border-gray-200 cursor-default">
                Plan Actuel
              </button>
            )}
          </div>

          {/* PLAN PRO */}
          <div className={`p-8 rounded-2xl border-2 relative overflow-hidden ${isPro ? 'border-green-500 bg-white shadow-lg' : 'border-indigo-500 bg-white shadow-xl'}`}>
            {!isPro && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    RECOMMANDÉ
                </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Business Pro <Zap className="w-5 h-5 text-yellow-500 fill-current"/>
            </h3>
            <p className="text-4xl font-extrabold mt-4">29€ <span className="text-base font-normal text-gray-500">/ mois</span></p>
            <p className="text-gray-500 mt-2">Pour dominer votre secteur.</p>
            
            <ul className="mt-8 space-y-4">
              <li className="flex gap-3 text-sm"><Check className="w-5 h-5 text-indigo-500"/> Réponses IA illimitées</li>
              <li className="flex gap-3 text-sm"><Check className="w-5 h-5 text-indigo-500"/> Analytics & Ventes estimées</li>
              <li className="flex gap-3 text-sm"><Check className="w-5 h-5 text-indigo-500"/> Support prioritaire</li>
            </ul>

            {isPro ? (
              <button className="mt-8 w-full py-3 rounded-xl bg-green-100 text-green-700 font-bold border border-green-200 flex justify-center items-center gap-2">
                <Check className="w-5 h-5" /> Abonnement Actif
              </button>
            ) : (
              // On utilisera un formulaire ici pour déclencher Stripe
              <form action="/api/stripe/checkout" method="POST">
                 <button type="submit" className="mt-8 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-lg hover:shadow-indigo-500/30 flex justify-center items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Passer Pro maintenant
                 </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}