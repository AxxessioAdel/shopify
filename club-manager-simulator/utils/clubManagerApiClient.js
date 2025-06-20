import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// URL des Club Manager Endpoints aus Umgebungsvariablen laden
const CLUB_MANAGER_API_URL = process.env.CLUB_MANAGER_API_URL;
const isDebug = process.env.DEBUG === "true";
if (isDebug) {
  console.log(
    "[ClubManager] CLUB_MANAGER_API_URL geladen:",
    CLUB_MANAGER_API_URL
  );
}

// Funktion zum Senden der Zahlungsdaten an Club Manager
export async function sendPaymentDataToClubManager(orderData) {
  try {
    // Payload vorbereiten (hier können wir später das Mapping definieren)
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

    // HTTP POST Anfrage an Club Manager
    const response = await axios.post(
      `${CLUB_MANAGER_API_URL}/payment-confirmation`,
      payload
    );

    console.log(
      `[ClubManager] Anfrage erfolgreich gesendet: ${response.status} ${response.statusText}`
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(
        `[ClubManager] Fehler beim Senden: ${error.response.status} ${error.response.statusText}`
      );
    } else if (error.request) {
      console.error(
        `[ClubManager] Fehler beim Senden: Keine Antwort erhalten (${error.message})`
      );
    } else {
      console.error(`[ClubManager] Fehler beim Senden: ${error.message}`);
    }
    throw error;
  }
}
