'use client'

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { sendBulkCampaign } from '@/app/actions/bulk-send';

export function CsvImporter() {
  const [contacts, setContacts] = useState<{name: string, phone: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          // On mappe les colonnes (flexible : cherche 'nom'/'name' et 'tel'/'phone')
          const parsedContacts = results.data.map((row: any) => ({
            name: row.name || row.nom || row.Nom || row.Name || "Client",
            phone: row.phone || row.tel || row.telephone || row.Mobile || ""
          })).filter((c: any) => c.phone.length > 5); // Filtre les lignes vides

          setContacts(parsedContacts);
          setStatus(`✅ ${parsedContacts.length} contacts trouvés ! Prêts à envoyer.`);
        },
        error: (error: any) => {
          setStatus("❌ Erreur de lecture du fichier CSV.");
        }
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'text/csv': ['.csv'] } 
  });

  const handleLaunch = async () => {
    if (contacts.length === 0) return;
    if (!confirm(`Envoyer ${contacts.length} SMS maintenant ? (Coût estimé: ${contacts.length} crédits)`)) return;

    setIsUploading(true);
    const result = await sendBulkCampaign(contacts);
    setIsUploading(false);

    if (result.success) {
      alert(`🚀 Campagne terminée ! ${result.count} SMS envoyés.`);
      setContacts([]);
      setStatus(null);
    } else {
      alert("❌ Erreur: " + result.error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-lg mb-4">📂 Import CSV (Campagne de masse)</h3>
      
      {/* Zone de Drop */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {contacts.length > 0 ? (
          <div className="text-green-600 font-medium">
            📄 Fichier chargé !<br/>
            <span className="text-2xl">{contacts.length}</span><br/>
            contacts détectés
          </div>
        ) : (
          <p className="text-gray-500">
            Glissez un fichier CSV ici<br/>
            <span className="text-xs">(Colonnes requises : "nom", "telephone")</span>
          </p>
        )}
      </div>

      {status && <p className="text-sm mt-3 text-center font-medium text-blue-600">{status}</p>}

      {/* Bouton d'action */}
      {contacts.length > 0 && (
        <button
          onClick={handleLaunch}
          disabled={isUploading}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow transition transform active:scale-95"
        >
          {isUploading ? "Envoi en cours..." : `🚀 Lancer la campagne (${contacts.length})`}
        </button>
      )}
      
      {/* Exemple de format */}
      <div className="mt-6 text-xs text-gray-400 bg-gray-50 p-3 rounded">
        <strong>Format CSV accepté :</strong><br/>
        nom, telephone<br/>
        Jean Dupont, +33612345678<br/>
        Marie Curie, +33698765432
      </div>
    </div>
  );
}