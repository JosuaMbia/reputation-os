'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ✅ Le nom est maintenant 'updateSettings' pour correspondre au formulaire
export async function updateSettings(formData: FormData) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Non autorisé" };

    try {
        const name = formData.get("name") as string;
        const type = formData.get("type") as string;
        const city = formData.get("city") as string;
        const description = formData.get("description") as string;
        
        const tone = formData.get("tone") as string;
        const signature = formData.get("signature") as string;
        const seoKeywords = formData.get("seoKeywords") as string;
        
        const googleUrl = formData.get("googleUrl") as string;

        // Mise à jour ou Création (Upsert)
        await prisma.business.updateMany({
            where: { userId },
            data: {
                name,
                type,
                city,
                description,
                tone,
                signature,
                seoKeywords,
                googleUrl
            }
        });

        // On rafraîchit toutes les pages qui utilisent ces données
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/marketing");
        revalidatePath("/dashboard/settings");
        
        return { success: true };

    } catch (error) {
        console.error("Erreur Settings:", error);
        return { success: false, error: "Erreur lors de la sauvegarde." };
    }
}