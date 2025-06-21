// Aufgabe: Manuelles oder geplantes Auslösen zum Senden bezahlter Bestellungen an Club Manager
import fetchPaidOrders from "./fetchPaidOrders.js";
import clubManagerApiClient from "../utils/clubManagerApiClient.js";

/**
 * Führt die Zahlungssynchronisation mit Club Manager aus
 * @returns {Promise<Object>} Ergebnis der Operation
 */
export default async function triggerPaymentSync() {
  try {
    const paidOrders = await fetchPaidOrders();
    const results = [];
    for (const order of paidOrders) {
      // Annahme: clubManagerApiClient hat eine Methode zum Senden der Bestellung
      const res = await clubManagerApiClient.sendPaidOrder(order);
      results.push({ orderId: order.id, status: res.status });
    }
    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
