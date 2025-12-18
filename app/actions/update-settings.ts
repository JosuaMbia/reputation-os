'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBusinessSettings(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Non authentifié" };

  try {
    const business = await prisma.business.findFirst({ where: { userId } });
    if (!business) return { success: false, error: "Business introuvable" };

    await prisma.business.update({
      where: { id: business.id },
      data: {
        type: formData.get("type") as string,
        city: formData.get("city") as string,
        seoKeywords: formData.get("seoKeywords") as string,
        tone: formData.get("tone") as string,
        signature: formData.get("signature") as string,
      }
    });

    revalidatePath("/dashboard/settings");
    return { success: true, message: "Paramètres mis à jour avec succès !" };
  } catch (error) {
    return { success: false, error: "Erreur lors de la sauvegarde" };
  }
}