'use client'

import { useState } from "react"
import { sendTestSms } from "@/app/actions/test-sms"

export function TestSmsButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    // ⚠️ Remplacez par VOTRE numéro de portable perso (Vérifié sur Twilio)
    // Format international obligatoire : +336...
    const result = await sendTestSms("+33612345678") 
    
    if (result.success) {
      alert(`✅ SMS Envoyé ! SID: ${result.sid}`)
    } else {
      alert(`❌ Erreur: ${result.error}`)
    }
    setIsLoading(false)
  }

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition"
    >
      {isLoading ? "Envoi en cours..." : "📲 Tester l'envoi SMS"}
    </button>
  )
}