'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function publishPost(postId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Non autorisé" };

    // 1. Récupérer le post et les tokens du business
    const post = await prisma.socialPost.findUnique({
        where: { id: postId },
        include: { business: true }
    });

    if (!post || !post.business) return { success: false, error: "Post introuvable" };
    if (post.status === "PUBLISHED") return { success: false, error: "Déjà publié" };

    try {
        let externalId = "";

        // --- CAS 1 : PUBLICATION INSTAGRAM / FACEBOOK ---
        if (post.platform === "INSTAGRAM" || post.platform === "FACEBOOK") {
            const pageAccessToken = post.business.facebookAccessToken;
            const pageId = post.business.facebookPageId; // Ou instagramAccountId

            if (!pageAccessToken || !pageId) throw new Error("Compte Facebook/Instagram non connecté.");

            // Note: L'API Graph de Facebook nécessite une URL d'image publique pour poster une photo.
            // Si l'utilisateur a uploadé une photo locale, il faut d'abord l'héberger (Vercel Blob, S3, etc.)
            const imageUrl = post.imageUrl; 

            // Exemple d'appel API pour Facebook (pseudo-code valide)
            const apiUrl = `https://graph.facebook.com/${pageId}/photos?url=${encodeURIComponent(imageUrl || "")}&caption=${encodeURIComponent(post.caption)}&access_token=${pageAccessToken}`;
            
            const response = await fetch(apiUrl, { method: 'POST' });
            const data = await response.json();

            if (data.error) throw new Error(data.error.message);
            externalId = data.id || data.post_id;
        }

        // --- CAS 2 : PUBLICATION LINKEDIN ---
        else if (post.platform === "LINKEDIN") {
            const token = post.business.linkedinAccessToken;
            const authorUrn = post.business.linkedinUrn; // ex: urn:li:person:12345

            if (!token || !authorUrn) throw new Error("Compte LinkedIn non connecté.");

            // LinkedIn API est complexe (nécessite d'enregistrer l'image d'abord via "Assets API" puis de créer le post)
            // Ici je mets le code pour un post TEXTE simple pour l'exemple
            const body = {
                author: authorUrn,
                lifecycleState: "PUBLISHED",
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        shareCommentary: { text: post.caption },
                        shareMediaCategory: "NONE"
                    }
                },
                visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
            };

            const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0'
                },
                body: JSON.stringify(body)
            });
            
            const data = await response.json();
            if (response.status !== 201) throw new Error("Erreur LinkedIn API");
            externalId = data.id;
        }

        // 3. Mise à jour du statut en base
        await prisma.socialPost.update({
            where: { id: postId },
            data: {
                status: "PUBLISHED",
                externalPostId: externalId,
                scheduledFor: new Date() // Marque la date de publication réelle
            }
        });

        return { success: true };

    } catch (error: any) {
        console.error("Erreur Publication:", error);
        return { success: false, error: error.message };
    }
}