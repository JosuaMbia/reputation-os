import { CsvImporter } from "@/components/csv-importer";

export default function CampaignsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Campagnes SMS</h1>
      <p className="text-gray-500 mb-8">Importez une liste de clients pour solliciter des avis en masse.</p>
      <Breadcrumbs /> {/* ✅ AJOUT ICI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <CsvImporter />
        </div>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
             <h3 className="font-bold text-blue-900 mb-2">💡 Conseil Pro</h3>
             <p className="text-sm text-blue-800">
               Les campagnes fonctionnent mieux quand elles sont envoyées <br/><strong>entre 18h et 19h</strong> en semaine.
             </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-gray-900 mb-4">Historique récent</h3>
             <p className="text-sm text-gray-400 italic">Aucune campagne récente.</p>
             {/* On ajoutera la liste des campagnes ici plus tard */}
          </div>
        </div>
      </div>
    </div>
  );
}