'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function disconnectSocial(platform: "FACEBOOK" | "LINKEDIN") {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Non autorisé" };

    try {
        const updateData: any = {};

        // On vide les champs correspondants
        if (platform === "FACEBOOK") {
            updateData.facebookAccessToken = null;
            updateData.facebookPageId = null;
            updateData.instagramAccessToken = null;
            updateData.instagramAccountId = null;
        } else if (platform === "LINKEDIN") {
            updateData.linkedinAccessToken = null;
            updateData.linkedinUrn = null;
        }

        await prisma.business.updateMany({
            where: { userId },
            data: updateData
        });

        revalidatePath("/dashboard/settings");
        return { success: true };

    } catch (error) {
        return { success: false, error: "Erreur lors de la déconnexion." };
    }
}