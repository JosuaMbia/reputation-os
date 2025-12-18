'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";
import { revalidatePath } from "next/cache";

export async function sendReviewInvitation(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Non authentifié" };

  // 1. Récupérer les données du formulaire
  const customerName = formData.get("name") as string;
  const customerPhone = formData.get("phone") as string;
  
  if (!customerName || !customerPhone) {
    return { success: false, error: "Nom et téléphone requis" };
  }

  try {
    // 2. Trouver le business de l'utilisateur
    const business = await prisma.business.findFirst({
      where: { userId },
    });

    if (!business) return { success: false, error: "Aucun établissement trouvé" };

    // 3. Sauvegarder le client (ou le mettre à jour s'il existe déjà)
    // On utilise le numéro de téléphone comme identifiant unique ici
    let customer = await prisma.customer.findFirst({
      where: { 
        businessId: business.id,
        phone: customerPhone
      }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          businessId: business.id,
          name: customerName,
          phone: customerPhone,
          source: "MANUAL"
        }
      });
    }

    // 4. Construire le lien d'avis
    // ASTUCE : Si on n'a pas encore le PlaceID Google (à cause du bug quota), 
    // on met un lien Google Maps générique ou le site web pour l'instant.
    const reviewLink = business.googlePlaceId 
      ? `https://search.google.com/local/writereview?placeid=${business.googlePlaceId}`
      : "https://www.google.com/maps"; // Lien de secours

    const message = `Bonjour ${customerName}, merci de votre visite chez ${business.name} ! Cela nous aiderait beaucoup si vous partagiez votre expérience ici : ${reviewLink}`;

    // 5. Envoyer le SMS
    const smsResult = await sendSms(customerPhone, message);

    if (!smsResult.success) {
      throw new Error(smsResult.error);
    }

    // 6. Enregistrer la trace de l'envoi dans l'historique
    await prisma.reviewRequest.create({
      data: {
        businessId: business.id,
        customerId: customer.id,
        channel: "SMS",
        status: "SENT",
        cost: 0.06 // Coût estimé (à affiner plus tard)
      }
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Invitation envoyée avec succès !" };

  } catch (error: any) {
    console.error("Erreur envoi invitation:", error);
    return { success: false, error: error.message || "Erreur interne" };
  }
}