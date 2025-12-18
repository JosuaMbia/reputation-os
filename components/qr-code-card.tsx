'use client'

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeCardProps {
  placeId?: string | null;
  businessName: string;
}

export function QRCodeCard({ placeId, businessName }: QRCodeCardProps) {
  // Si on a l'ID Google, on fait un lien direct vers l'écriture d'avis
  // Sinon, on met un lien de recherche Google Maps générique
  const reviewUrl = placeId 
    ? `https://search.google.com/local/writereview?placeid=${placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName)}`;

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR-Avis-${businessName}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center h-full">
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">📱 QR Code Comptoir</h3>
      <p className="text-xs text-gray-500 mb-6">
        Faites scanner ce code à vos clients pour un avis immédiat (Gratuit).
      </p>

      <div className="bg-white p-4 rounded-xl border-2 border-gray-900 mb-6">
        <QRCodeSVG 
          id="qr-code-svg"
          value={reviewUrl} 
          size={150}
          level="H" // Haut niveau de correction d'erreur
          includeMargin={true}
        />
      </div>

      <div className="mt-auto w-full">
         <p className="text-xs text-gray-400 mb-3 break-all hidden">
           Lien : {reviewUrl}
         </p>
         <button 
           onClick={() => alert("Pour télécharger le PNG, nous ajouterons une petite fonction utilitaire plus tard. Pour l'instant, faites une capture d'écran !")}
           className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition"
         >
           🖨️ Imprimer / Télécharger
         </button>
      </div>
    </div>
  );
}