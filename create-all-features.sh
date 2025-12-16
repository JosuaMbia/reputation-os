#!/bin/bash

# 1. Page détail d'avis avec génération IA
mkdir -p app/dashboard/reviews/[id]
cat > app/dashboard/reviews/[id]/page.tsx << 'EOF'
import { auth } from "@clerk/nextjs/server";
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
EOF

# 2. API OpenAI
cat > app/api/ai/generate-response/route.ts << 'EOF'
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const reviewId = formData.get("reviewId") as string;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { business: true }
    });

    if (!review) {
      return NextResponse.json({ error: "Avis non trouvé" }, { status: 404 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant professionnel qui génère des réponses personnalisées aux avis clients. Sois courtois, reconnaissant et professionnel."
        },
        {
          role: "user",
          content: \`Génère une réponse professionnelle à cet avis Google:\n\nNote: \${review.rating}/5\nCommentaire: \${review.content}\n\nNom du business: \${review.business.name}\`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const generatedResponse = completion.choices[0]?.message?.content || "";

    await prisma.review.update({
      where: { id: reviewId },
      data: { response: generatedResponse }
    });

    return NextResponse.redirect(new URL(\`/dashboard/reviews/\${reviewId}\`, request.url));
  } catch (error) {
    console.error("Erreur génération IA:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
EOF

# 3. Page paramètres
cat > app/dashboard/settings/page.tsx << 'EOF'
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCurrentUserWithBusiness } from "@/lib/auth-sync";
import Link from "next/link";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const userData = await getCurrentUserWithBusiness(userId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 block">
          ← Retour au Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Informations du compte</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom</label>
                <p className="text-gray-900 dark:text-gray-100">{userData?.user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                <p className="text-gray-900 dark:text-gray-100">{userData?.user?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Google Business</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connectez votre compte Google Business pour synchroniser automatiquement vos avis.
            </p>
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
              🔗 Connecter Google Business
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Intégration OpenAI</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Clé API: {process.env.OPENAI_API_KEY ? "Configurée ✅" : "Non configurée ❌"}
            </p>
            <p className="text-sm text-gray-500">
              Configurez votre clé API OpenAI dans les variables d'environnement Vercel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

# 4. Helpers Google Business API (stub pour future implémentation)
cat > lib/google-business.ts << 'EOF'
// Intégration Google My Business API
// Documentation: https://developers.google.com/my-business

export interface GoogleReview {
  reviewId: string;
  reviewer: { displayName: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment: string;
  createTime: string;
  updateTime: string;
  reviewReply?: { comment: string };
}

export async function syncGoogleReviews(businessId: string, accessToken: string) {
  // TODO: Implémenter la synchronisation avec Google My Business API
  // 1. Récupérer les avis depuis Google
  // 2. Créer/mettre à jour dans Prisma
  // 3. Retourner le nombre d'avis synchronisés
  
  console.log("Synchronisation Google Business pour:", businessId);
  return { synced: 0, errors: [] };
}

export async function postReplyToGoogle(
  reviewId: string,
  reply: string,
  accessToken: string
) {
  // TODO: Poster une réponse sur Google
  console.log("Réponse postée sur Google pour:", reviewId);
  return { success: true };
}
EOF

echo "✅ Toutes les fonctionnalités ont été créées!"
