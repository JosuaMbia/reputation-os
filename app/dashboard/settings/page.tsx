import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings-form"; // ✅ On importe le nouveau composant

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const business = await prisma.business.findFirst({
    where: { userId: userId }
  });

  if (!business) {
    return redirect("/dashboard");
  }

  const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_test_placeholder";
  const isPro = !!business.stripeSubscriptionId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* ✅ On passe les données au composant Client */}
      <SettingsForm 
        business={business} 
        isPro={isPro} 
        stripePriceId={STRIPE_PRICE_ID} 
      />
    </div>
  );
}