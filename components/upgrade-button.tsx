"use client";

import { useState } from "react";

export const UpgradeButton = ({ 
  priceId, 
  businessId 
}: { 
  priceId: string, 
  businessId: string 
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: priceId,
          businessId: businessId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirection vers Stripe
      } else {
        alert("Erreur lors de la création de la session de paiement");
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
    >
      {loading ? "Chargement..." : "S'abonner maintenant 🚀"}
    </button>
  );
};