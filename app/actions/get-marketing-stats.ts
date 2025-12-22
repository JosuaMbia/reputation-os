'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getMarketingStats() {
    const { userId } = await auth();
    if (!userId) return null;

    const business = await prisma.business.findFirst({
        where: { userId },
        include: {
            SocialPost: {
                // On ne prend que les posts PUBLIÉS pour les stats
                where: { status: "PUBLISHED" },
                orderBy: { publishedAt: 'desc' }
            }
        }
    });

    if (!business) return null;

    const posts = business.SocialPost;

    // Calcul des VRAIS totaux (Pas de simulation)
    let totalViews = 0;
    let totalLikes = 0;
    let totalShares = 0;

    const enrichedPosts = posts.map(post => {
        // On prend les valeurs par défaut à 0 si null
        const views = post.statsViews || 0;
        const likes = post.statsLikes || 0;
        const shares = post.statsClicks || 0; 

        totalViews += views;
        totalLikes += likes;
        totalShares += shares;

        return { ...post, statsViews: views, statsLikes: likes, statsClicks: shares };
    });

    // Construction du Graphique (30 derniers jours)
    // Pour une V1, si on n'a pas de données historiques, on affiche 0
    const chartData = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' });
        
        // Ici, dans une V2, on ferait une requête groupée par date. 
        // Pour la V1, on met 0 par défaut sauf si on connecte l'API historique plus tard.
        chartData.push({
            name: dayName,
            vues: 0, // En attente du Cron Job de mise à jour quotidienne
            engagement: 0,
        });
    }

    const engagementRate = totalViews > 0 ? ((totalLikes + totalShares) / totalViews) * 100 : 0;

    return {
        kpi: {
            views: totalViews,
            likes: totalLikes,
            shares: totalShares,
            engagementRate: engagementRate.toFixed(1)
        },
        chartData, // Sera plat au début, c'est normal pour une V1 sans historique
        topPosts: enrichedPosts.slice(0, 3) // Top 3 réel
    };
}