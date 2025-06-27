import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// URL des Club Manager Endpoints aus Umgebungsvariablen laden
const CLUB_MANAGER_API_URL = process.env.CLUB_MANAGER_API_URL;
const isDebugLevelInfo = process.env.DEBUG_MODE === "true";
if (isDebugLevelInfo) {
  console.log("[Debug] Club Manager API Client mit Debug-Level info geladen");
  console.log("[Debug] CLUB_MANAGER_API_URL:", CLUB_MANAGER_API_URL);
}

// Funktion zum Senden der Zahlungsdaten an Club Manager
export async function sendPaymentDataToClubManager(orderData) {
  const payload = {
    order_id: orderData.id,
    email: orderData.email,
    phone: orderData.phone,
    total_price: orderData.total_price,
    processed_at: orderData.processed_at,
    line_items: orderData.line_items.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      price: item.price,
    })),
  };

  const maxRetries = 3;
  const retryDelay = 1000; // milliseconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        `${CLUB_MANAGER_API_URL}/payment-confirmation`,
        payload
      );
      console.log(
        `[ClubManager] Erfolgreiche Antwort (Versuch ${attempt}): ${response.status} ${response.statusText}`
      );
      return response.data;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const errorMsg = error.response
        ? `${error.response.status} ${error.response.statusText}`
        : error.message;

      console.warn(
        `[ClubManager] Fehler beim Senden (Versuch ${attempt}): ${errorMsg}`
      );

      if (isLastAttempt) throw error;
      await new Promise((r) => setTimeout(r, retryDelay));
    }
  }
}

// API-basierte Synchronisationsfunktion
export default {
  sendeBezahlteBestellung: sendPaymentDataToClubManager,
};
