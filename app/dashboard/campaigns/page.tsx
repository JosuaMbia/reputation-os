import { Breadcrumbs } from "@/components/breadcrumbs";
import { CsvImporter } from "@/components/csv-importer";

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 1. FIL D'ARIANE */}
        <Breadcrumbs />

        {/* 2. EN-TÊTE */}
        <div className="mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📢 Campagnes SMS</h1>
            <p className="text-gray-500 dark:text-gray-400">
                Importez une liste de clients pour solliciter des avis en masse.
            </p>
        </div>

        {/* 3. CONTENU (Grille 2 colonnes) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLONNE GAUCHE : IMPORTATEUR */}
            {/* ✅ CORRECTION : On a retiré le cadre blanc et le titre h3 en doublon */}
            <div>
                <CsvImporter />
            </div>
            
            {/* COLONNE DROITE : CONSEILS & HISTORIQUE */}
            <div className="space-y-6">
                
                {/* Carte Conseil */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                        💡 Conseil Pro
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        Les campagnes fonctionnent mieux quand elles sont envoyées <br/>
                        <span className="font-bold bg-white/50 px-1 rounded">entre 18h et 19h</span> en semaine (mardi ou jeudi).
                    </p>
                </div>
                
                {/* Carte Historique */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Historique récent</h3>
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-400 italic">Aucune campagne récente.</p>
                    </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
}