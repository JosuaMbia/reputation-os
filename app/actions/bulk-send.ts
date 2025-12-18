'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";
import { revalidatePath } from "next/cache";

interface BulkContact {
  name: string;
  phone: string;
}

export async function sendBulkCampaign(contacts: BulkContact[]) {
  const { userId } = await auth();
  if (!userId) return { success: false, count: 0, error: "Non authentifié" };

  try {
    // 1. Récupérer le business
    const business = await prisma.business.findFirst({
      where: { userId },
    });
    if (!business) return { success: false, count: 0, error: "Business introuvable" };

    let successCount = 0;
    const errors = [];

    // 2. Boucle sur chaque contact
    for (const contact of contacts) {
      // Validation basique
      if (!contact.phone || contact.phone.length < 10) continue;

      try {
        // A. Sauvegarder/Mettre à jour le client
        const customer = await prisma.customer.upsert({
          where: { 
            // Astuce : On utilise un index composé businessId + phone pour éviter les doublons
            // (Assurez-vous que votre schema le supporte, sinon create simple)
             id: "temp_skip_id_check" // Placeholder, on fera un findFirst logique juste après
          },
          update: { name: contact.name },
          create: {
            businessId: business.id,
            name: contact.name,
            phone: contact.phone,
            source: "CSV"
          }
        }).catch(async () => {
             // Fallback manuel si upsert pose problème sans index unique
             const existing = await prisma.customer.findFirst({
                 where: { businessId: business.id, phone: contact.phone }
             });
             if(existing) return existing;
             return await prisma.customer.create({
                 data: { businessId: business.id, name: contact.name, phone: contact.phone, source: "CSV" }
             });
        });

        // B. Générer le lien
        const reviewLink = business.googlePlaceId 
          ? `https://search.google.com/local/writereview?placeid=${business.googlePlaceId}`
          : "https://google.com"; // Lien secours

        const message = `Bonjour ${contact.name}, merci de votre visite chez ${business.name}. Un petit avis nous ferait plaisir : ${reviewLink}`;

        // C. Envoyer le SMS
        const smsResult = await sendSms(contact.phone, message);

        // D. Enregistrer la trace
        await prisma.reviewRequest.create({
          data: {
            businessId: business.id,
            customerId: customer.id,
            channel: "SMS",
            status: smsResult.success ? "SENT" : "FAILED",
            cost: 0.06
          }
        });

        if (smsResult.success) successCount++;

      } catch (err) {
        console.error(`Erreur pour ${contact.name}:`, err);
        errors.push(contact.name);
      }
    }

    revalidatePath("/dashboard");
    return { success: true, count: successCount, errors };

  } catch (error: any) {
    console.error("Erreur globale campagne:", error);
    return { success: false, count: 0, error: error.message };
  }
}