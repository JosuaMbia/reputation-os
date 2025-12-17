import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// On initialise le client Twilio seulement si les clés sont là
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendSms(to: string, message: string) {
  if (!client) {
    console.error("❌ Twilio n'est pas configuré (Manque SID ou Token)");
    return { success: false, error: "Configuration manquante" };
  }

  try {
    console.log(`📤 Envoi SMS vers ${to}...`);
    
    const response = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: to,
    });

    console.log(`✅ SMS envoyé ! SID: ${response.sid}`);
    return { success: true, sid: response.sid };

  } catch (error: any) {
    console.error("❌ Erreur envoi SMS:", error.message);
    return { success: false, error: error.message };
  }
}