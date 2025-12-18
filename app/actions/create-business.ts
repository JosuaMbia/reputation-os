'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createBusiness(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Non autorisé" };

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const city = formData.get("city") as string;
  const website = formData.get("website") as string;

  if (!name || !city) {
    return { error: "Le nom et la ville sont obligatoires." };
  }

  try {
    // 1. Création du Business dans la DB
    await prisma.business.create({
      data: {
        userId,
        name,
        type,
        city,
        website,
        // On initialise avec des valeurs par défaut pour l'IA
        tone: "professional",
      }
    });

  } catch (error) {
    console.error("Erreur création business:", error);
    return { error: "Une erreur est survenue lors de la création." };
  }

  // 2. Redirection vers le Dashboard une fois créé
  redirect("/dashboard");
}