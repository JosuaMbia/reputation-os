import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUserWithBusiness(userId: string) {
  try {
    // Récupérer l'utilisateur depuis Clerk
    const clerkUser = await (await clerkClient()).users.getUser(userId);

    if (!clerkUser) {
      return null;
    }

    // Chercher ou créer l'utilisateur dans Prisma
    let user = await prisma.user.findUnique({
      where: { id: userId }, // ✅ Correct : on cherche par 'id'
      include: {
        businesses: {
          include: {
            reviews: true
          }
        }
      }
    });

    // Si l'utilisateur n'existe pas dans Prisma, le créer
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId, // ✅ CORRECTION ICI : on utilise 'id' et non 'clerkUserId'
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Utilisateur"
        },
        include: {
          businesses: {
            include: {
              reviews: true
            }
          }
        }
      });
    }

    return {
      user,
      clerkUser
    };
  } catch (error) {
    console.error("Error in getCurrentUserWithBusiness:", error);
    return null;
  }
}