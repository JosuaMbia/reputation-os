'use server'

import { sendSms } from "@/lib/sms";

export async function sendTestSms(phoneNumber: string) {
  // On envoie un message simple
  const result = await sendSms(
    phoneNumber, 
    "👋 Salut depuis Reputation OS ! Ceci est un test de configuration Twilio."
  );
  
  return result;
}