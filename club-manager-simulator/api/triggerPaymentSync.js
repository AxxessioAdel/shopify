// Aufgabe: Manuelles oder geplantes Auslösen zum Senden bezahlter Bestellungen an Club Manager
import fetchPaidOrders from "./fetchPaidOrders.js";
import clubManagerApiClient from "../utils/clubManagerApiClient.js";
import chalk from "chalk";

/**
 * Führt die Zahlungssynchronisation mit Club Manager aus
 * @returns {Promise<Object>} Ergebnis der Operation
 */
export default async function triggerPaymentSync() {
  console.log(chalk.cyan("[AutoSync] triggerPaymentSync gestartet"));

  try {
    const paidOrders = await fetchPaidOrders();
    const results = [];
    for (const order of paidOrders) {
      // Annahme: clubManagerApiClient hat eine Methode zum Senden der Bestellung
      // Verwendung des korrekten exportierten Funktionsnamens
      const res = await clubManagerApiClient.sendeBezahlteBestellung(order);
      console.log(chalk.yellow(`[ClubManager] Antwort: ${res.status || res}`));
      results.push({ orderId: order.id, status: res.status });
    }
    return { success: true, results };
  } catch (error) {
    console.error(
      chalk.red("[Error] [AutoSync] Fehler bei triggerPaymentSync:", error)
    );
    return { success: false, error: error.message };
  }
}
