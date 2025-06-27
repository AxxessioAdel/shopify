# Shopify Produktbereitstellung & Headless Checkout Product Synchronization

---

Dieses Projekt bietet eine vollständige Headless-Product-Synchronization zwischen Club Manager, Shopify und einem Web-Frontend.

Es besteht aus zwei unabhängigen Modulen:

1️⃣ **Produktbereitstellungsdienst (Product Synchronization Backend)**

- Erstellt automatisch Produkte in Shopify basierend auf Webhooks vom Club Manager.

2️⃣ **Kunden-Checkout-Service (Customer Checkout Backend)**

- End-to-End-Testumgebung für Kundenerstellung, Warenkorb und Checkout-Prozess über die Storefront API.

---

## 📦 Repository Übersicht

```
git@github.com:AxxessioAdel/shopify.git
```

---

## ⚙️ Systemübersicht

- Headless Shopify-Product-Synchronization über die Admin API (Produktbereitstellung)
- Shopify Storefront API für Checkout-Demo
- Webhook-basierte Produktsynchronisation via Club Manager
- Separate Backends für Provisionierung und Checkout
- Lokale Simulationsmöglichkeiten über den Club Manager Simulator

---

## 📋 Voraussetzungen

- Node.js v18+ (erforderlich für ESModules und node-fetch)
- Ein Shopify-Store (mindestens Basic-Plan)
- Zugriff auf die Shopify Admin API mit folgenden Berechtigungen:
  - Produkte (Lesen & Schreiben)
  - Produktvarianten (Lesen & Schreiben)
- Club Manager Zugang (für zukünftige Live-Integration)
- ngrok (für öffentliche Webhook-Bereitstellung)
- Git

---

## 🔧 Projektstruktur (aktualisiert)

```
.env
.gitignore
Berichten.md
package-lock.json
package.json
README.md
server.js

club-manager-simulator/
│   index.js
│   package-lock.json
│   package.json
│   server-central.js
│
├── api/
│     fetchPaidOrders.js
│     triggerPaymentSync.js
│
├── db/
│     syncState.js
│     syncState.sqlite
│     testSyncState.js
│
├── routes/
│     paymentConfirmation.js
│
├── utils/
│     clubManagerApiClient.js
│
└── webhooks/
      ordersPaidWebhook.js

club-manager-simulator-ui/
├── product-manager/
│   create-product.html
│   delete-product.html
│   index.html
│   preview-product.html
│   update-product.html
│
│   js/
│     api-client.js
│     create-product.js
│     delete-product.js
│     preview-product.js
│     update-product.js
│     utils.js
│
└── purchase/
    create-customer.html
    demo-purchase.html
    script.js
    js/
      checkout-client.js
      create-customer.js

customer-checkout/
│   checkout-handler.js
│   checkout.js
│   create-customer.js
│   index.js
│   product-provisioning.js
│   test-simulator.js
│
└── api/
      checkout.js

product-synchronization/
    fetchPaidOrders.js
    index.js
    product-sync-simulator.js
    registerWebhook.js
    shopify-product-sync.js
```

### Kurze Beschreibung der Hauptordner und -dateien

- **club-manager-simulator/**: Zentrale Serverlogik, API-Endpunkte, Webhooks und Datenbanksynchronisation für Zahlungen und Produktdaten. Enthält alle Backend-Funktionen für die Integration zwischen Club Manager und Shopify.
- **club-manager-simulator-ui/**: Web-Frontend für Produktverwaltung und Testkäufe. Unterteilt in Produktmanagement und Kauf-/Checkout-Simulation.
- **customer-checkout/**: Backend-Logik für den Checkout-Prozess, Kundenerstellung und Test-Simulationen. Wird als Router im zentralen Server eingebunden.
- **product-synchronization/**: Backend für Produktsynchronisation, Webhook-Registrierung und Kommunikation mit der Shopify Admin API.
- **.env**: Zentrale Konfigurationsdatei für alle Umgebungsvariablen (API-Keys, Ports, Tokens etc.).
- **server-central.js**: Startpunkt des zentralen Servers, der alle Module als Router einbindet und die gesamte API sowie statische Inhalte bereitstellt.
- **README.md**: Diese Dokumentation.

Jede Komponente ist klar abgegrenzt und unterstützt eine modulare, wartbare Projektstruktur.

---

## 🛠 Installation & Setup

### 1️⃣ Abhängigkeiten installieren

Führen Sie im Hauptverzeichnis des Projekts folgenden Befehl aus, um alle benötigten Pakete für alle Server zentral zu installieren:

```bash
npm install
```

_Installiert alle in der zentralen `package.json` definierten Pakete (z.B. express, axios, dotenv, node-fetch, cors, chalk, better-sqlite3, usw.)._

> **Hinweis:** Sie müssen keine weiteren `npm install`-Befehle in Unterordnern ausführen. Die zentrale Installation reicht für alle Backends und Services aus.

> **Hinweis für Windows-Nutzer:** Für die Installation von `better-sqlite3` werden ggf. Build Tools benötigt. Siehe [Troubleshooting-Guide](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md) für Details zur Einrichtung auf Windows.

### 2️⃣ `.env`-Datei konfigurieren

Alle Umgebungsvariablen wurden jetzt in einer einzigen `.env`-Datei im Hauptverzeichnis des Projekts zusammengeführt. Diese Datei enthält sämtliche Konfigurationswerte für alle Backends und Services (Shopify, Club Manager, Product Synchronization, Tokens, Ports usw.).

**Beispielhafte Inhalte der `.env`:**

```
# Shopify-Konfiguration
SHOPIFY_STORE_DOMAIN=...
SHOPIFY_WEBHOOK_SECRET=...
SHOPIFY_API_URL=...
WEBHOOK_ADDRESS=...

# API-URLs
PROVISIONING_API_URL=...
CLUB_MANAGER_API_URL=...

# Tokens
CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN=...
PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN=...
CUSTOM_CHECKOUT_APP_TOKEN=...

# Ports
CLUB_MANAGER_PORT=...
PRODUCT_SYNCHRONIZATION_PORT=...
CUSTOM_CHECKOUT_PORT=...

# Weitere Einstellungen
DEBUG=...
USE_WEBHOOK=...
CONTENT_TYPE=...
DEBUG_MODE=...
```

> **Hinweis:** Die `.env`-Datei muss im Hauptverzeichnis (`/shopify/.env`) liegen und vor dem Starten der Server korrekt ausgefüllt werden. Alle Services lesen ihre Konfiguration zentral aus dieser Datei.

---

## 🌐 Webhook Public Deployment & Live Product Synchronization

### Ziel

Der Produktbereitstellungsdienst muss öffentlich erreichbar sein, damit Club Manager Webhooks auslösen kann, sobald eine Preisgruppe gespeichert wird.

---

### 1️⃣ Lokale Bereitstellung mit ngrok (für Product Synchronization-Tests & Demo)

#### a) ngrok Setup

- Installiere ngrok: [https://ngrok.com/download](https://ngrok.com/download)
- Authentifiziere deinen Account:

```powershell
ngrok config add-authtoken <YOUR_AUTH_TOKEN>
```

#### b) ngrok Tunnel starten

```powershell
ngrok http 4000
```

ngrok erzeugt eine öffentliche URL, z.B.:

```
https://abcd-1234.ngrok-free.app
```

#### c) Webhook-Endpunkt für Club Manager

Dieser Endpunkt wird dem Club Manager bereitgestellt:

```
https://abcd-1234.ngrok-free.app/webhooks/orders-paid
```

> Hinweis: Die URL ändert sich bei jedem Neustart von ngrok!

---

## 📤 Webhook für Zahlungsbestätigung (orders/paid)

1️⃣ **Aktivierung des Webhooks im Shopify Admin**

Gehe im Shopify Admin zu:

    Einstellungen → Benachrichtigungen → Webhooks
    Klicke auf „Webhook erstellen“

- Wähle als Ereignis: **Order payment (orders/paid)**
- Setze das Format auf **JSON**
- Füge als URL folgendes ein (von ngrok erzeugt):

  https://xyz123.ngrok-free.app/webhooks/orders-paid

💡 Hinweis: Diese URL ändert sich bei jedem Neustart von ngrok!

2️⃣ **Verwendung von ngrok**

Starte vor jedem Test einen öffentlichen Tunnel zu deinem lokalen Server mit:

```powershell
ngrok http 4000
```

- Notiere die öffentliche URL
- Aktualisiere die Webhook-URL im Shopify Admin (siehe oben)

3️⃣ **Datenfluss bei erfolgreicher Zahlung**

Sobald ein Kunde einen Kauf abgeschlossen hat:

- Shopify sendet einen Webhook an `/webhooks/orders-paid`
- Der Server empfängt die Bestellung und prüft die HMAC-Signatur
- Bei `financial_status === "paid"` werden die Daten an Club Manager weitergeleitet

**Beispielausgabe im Terminal bei erfolgreichem Ablauf:**

```
[Webhook] Order #1039 () verarbeitet.
[Webhook] Zahlungsstatus ist "paid". Sende Daten an Club Manager...
[ClubManager] Zahlungsdaten empfangen: {
  order_id: 7...248,
  email: '',
  phone: '+491...',
  total_price: '9.95',
  ...
}
```

---

## 🧭 Architekturübersicht

### End-to-End-Workflow

```
Club Manager → Webhook → Produktbereitstellungsdienst → Shopify Admin API → Shopify Store
```

### Detaillierter Ablauf

1️⃣ **Produktverwaltung im Club Manager**

- Preisgruppe wird gespeichert.
- Webhook wird ausgelöst.

2️⃣ **Webhook-Empfang**

- Club Manager sendet Produktdaten per Webhook an den Produktbereitstellungsdienst.

3️⃣ **Produktsynchronisation**

- Der Produktbereitstellungsdienst transformiert die Daten ins Shopify Admin API-Format.
- Produkt wird in Shopify erstellt, inkl. Varianten, Tags und Bildern.

4️⃣ **Produkt live im Store**

- Produkte erscheinen sofort im Shopify-Store.
- Kunden können sie direkt kaufen.

---

## 🛠 Club Manager Simulator UI

### Funktionen

1️⃣ **Produkte erstellen**

- Benutzerfreundliche Oberfläche zum Anlegen neuer Produkte.
- Unterstützt das Hinzufügen von Produktdetails, Varianten und Tags.
- Sendet Daten ans Backend zur Shopify-Product-Synchronization.

2️⃣ **Produkte aktualisieren**

- Ermöglicht das Bearbeiten bestehender Produkte.
- Lädt Produktdetails inkl. Varianten dynamisch.
- Unterstützt die Vorschau von Änderungen vor dem Update.

---

## 🔒 Sicherheit & Fehlerbehandlung

- Umfassende Eingabevalidierung in den Bereitstellungsdiensten
- Fehlerhafte Webhooks liefern standardisierte Fehlermeldungen
- Sicherer Zugriff auf die Shopify Admin API über API-Token

---

## 🔒 Austausch sensibler Informationen

Um Datenlecks zu vermeiden, wurden sensible Tokens im Projekt wie folgt ersetzt:

- `STOREFRONT_ACCESS_TOKEN` → `<STOREFRONT_ACCESS_TOKEN>`
- `CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN` → `<CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN>`
- `PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN` → `<PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN>`

Diese Platzhalter werden in den Projektdateien verwendet. Für Zugriff auf die echten Tokens bitte Kontakt aufnehmen mit:
✉️ adel.ahmadi.informatiker@gmail.com

---

## 🏗 Zukünftige Erweiterungen

- Webhook-Retry-Mechanismen für höhere Zuverlässigkeit
- Produkt-Updates: Bestehende Produkte bei Änderungen im Club Manager anpassen
- Vorschau-Modus: Produkte als Entwurf anlegen und später veröffentlichen
- Monitoring & Logging: Verbesserte Überwachungslogik

---

## 🚀 Deployment-Roadmap für Produktionsumgebungen

- Deployment auf dedizierten Servern (z.B. Hetzner Cloud, AWS Lightsail)
- Statische öffentliche DNS statt ngrok für dauerhafte Erreichbarkeit
- CI/CD-Pipeline via GitHub Actions für automatisierte Releases
- Secrets-Management für API-Tokens (z.B. AWS Secrets Manager, HashiCorp Vault)

---

## 📦 Prüfung erfolgreicher Kunden-Zahlungen

In diesem Projekt wurden zwei Strategien zur Erkennung erfolgreicher Zahlungen im Shopify-Shop implementiert:

### ✅ Kombinierte Strategie: Webhook + API Polling

Für eine stabile, echtzeitnahe und ausfallsichere Lösung nutzen wir einen kombinierten Ansatz aus zwei Methoden:

---

### 🔁 Methode 1: API-basiertes Polling (periodische Kontrolle)

Erfolgreiche Zahlungen werden regelmäßig über die Shopify Admin API abgefragt. Diese Methode umfasst folgende Schritte:

- Abruf der Bestellungen mit `financial_status=paid` über `fetchPaidOrders.js`
- Filterung der Bestellungen mit `processed_at_min`, um Duplikate zu vermeiden
- Speicherung des letzten Sync-Zeitpunkts in einer SQLite-Datenbank (`syncState.sqlite`)
- Übermittlung neuer Bestellungen an Club Manager via `sendPaymentDataToClubManager`
- Automatische Ausführung alle 60 Sekunden mittels `setInterval` in `index.js`

#### 📁 Relevante Dateien:

- `club-manager-simulator/api/fetchPaidOrders.js`
- `club-manager-simulator/api/triggerPaymentSync.js`
- `club-manager-simulator/db/syncState.js`
- `club-manager-simulator/index.js`

---

### ⚡ Methode 2: Webhook-basiert (Echtzeit)

Hierbei wird der offizielle Shopify-Webhook für Zahlungen genutzt:

- Bei erfolgreicher Zahlung sendet Shopify einen POST-Request an `/webhooks/orders/paid`
- Die Bestellung wird per HMAC validiert, verarbeitet und an Club Manager weitergeleitet
- Der Webhook-Endpunkt ist nur aktiv, wenn `USE_WEBHOOK=true` in der `.env` gesetzt ist

#### 📁 Relevante Datei:

- `club-manager-simulator/webhooks/ordersPaidWebhook.js`

---

Die Umschaltung zwischen Webhook- und API-Polling-Modus erfolgt nun automatisch im zentralen Server. Es ist keine manuelle Anpassung der `.env`-Datei mehr erforderlich. Der Server erkennt selbstständig, welche Strategie verwendet werden soll und steuert den Synchronisationsprozess entsprechend.

---

## 🚀 Server starten

Nach der Integration aller Module in einen zentralen Server erfolgt der Projektstart wie folgt:

1. Setzen Sie den gewünschten Port als Umgebungsvariable (z.B. 4000) und starten Sie den Server:

```powershell
$env:CLUB_MANAGER_PORT=4000; node ./club-manager-simulator/server-central.js
```

2. Für öffentliche Webhook-Tests öffnen Sie einen Tunnel mit ngrok:

```powershell
ngrok http 4000
```

Nun sind alle APIs und HTML-Seiten über diesen zentralen Server erreichbar.

---

### 📝 Zugriff auf HTML-Seiten und neue Pfade

Alle HTML-Dateien des Projekts sind jetzt über folgende (bzw. ähnliche) Pfade erreichbar:

- http://localhost:4000/purchase/create-customer.html
- http://localhost:4000/purchase/demo-purchase.html
- http://localhost:4000/product-manager/index.html
- http://localhost:4000/product-manager/create-product.html
- http://localhost:4000/product-manager/update-product.html
- http://localhost:4000/product-manager/delete-product.html
- http://localhost:4000/product-manager/preview-product.html

> Hinweis: Die Pfade orientieren sich an den Unterordnern in `club-manager-simulator-ui` und werden alle vom zentralen Server bereitgestellt.

---

### 🛒 Testen von Checkout und weiteren Funktionen

Um Checkout und andere Funktionen zu testen, genügt es, den zentralen Server zu starten und die gewünschten Seiten im Browser zu öffnen. Es ist kein separater Start mehrerer Server oder die Nutzung verschiedener Ports nötig.

---

## Zusammenfassung der Änderungen

- Alle Module werden über einen zentralen Server (`server-central.js`) ausgeführt
- Zugriff auf sämtliche APIs und HTML-Seiten über einen Port und einen Server
- Kein separater Start von customer-checkout und product-synchronization mehr nötig
- Vereinfachtes Testen und Entwickeln des Projekts

---

## 🏷️ Gutscheincodes & Rabattlogik (Shopify Discount Codes)

### Überblick

Dieses Projekt unterstützt die Anwendung von Shopify-Gutscheincodes (Discount Codes) direkt im Headless-Checkout-Prozess. Die Integration erfolgt vollständig über die Storefront API und ist unabhängig von Hydrogen oder Shopify-Frontend-Komponenten.

### Funktionsweise

- Im Checkout-Formular (`demo-purchase.html`) kann der Kunde einen Gutscheincode eingeben.
- Der Gutscheincode wird zusammen mit den anderen Bestelldaten an das Backend übermittelt.
- Im Backend (`customer-checkout/api/checkout.js`) wird der Code nach dem Anlegen des Warenkorbs (`createCart`) und vor dem Hinzufügen des Produkts (`addProductToCart`) per GraphQL-Mutation (`cartDiscountCodesUpdate`) auf den Warenkorb angewendet.
- Die Anwendung des Codes wird geloggt. Bei aktivierter Umgebungsvariable `DEBUG_DISCOUNT=true` werden alle relevanten API-Antworten und Fehler detailliert im Terminal ausgegeben.
- Nach Anwendung des Codes wird der Warenkorb erneut abgefragt, um den Status des Rabatts und die finale Preiskalkulation zu prüfen.

### Beispiel für die Integration

1. **Frontend:**

   - Feld für Gutscheincode im Checkout-Formular:
     ```html
     <label for="discountCode">Gutscheincode</label>
     <input
       type="text"
       id="discountCode"
       name="discountCode"
       placeholder="z. B. SUMMER2024"
     />
     ```
   - Übergabe an das Backend via JS:
     ```js
     const discountCode = document.getElementById("discountCode").value.trim();
     // ...
     body: JSON.stringify({
       // ...
       discountCode,
     });
     ```

2. **Backend:**
   - Extraktion und Anwendung des Codes:
     ```js
     const { discountCode } = req.body;
     // ...
     if (discountCode) {
       await applyDiscountToCart(cart.id, discountCode);
       await getCart(cart.id); // Status nach Anwendung prüfen
     }
     ```
   - Logging (nur bei aktiviertem DEBUG_DISCOUNT):
     ```js
     if (isDebugDiscount) {
       console.log("[Discount][Raw Response]", ...);
       // ...
     }
     ```

### Hinweise zur Nutzung

- Die Rabattlogik funktioniert nur, wenn der Gutscheincode zuvor im Shopify Admin unter "Rabatte" angelegt wurde.
- Die Prüfung, ob ein Code gültig oder anwendbar ist, erfolgt direkt über die API und wird im Terminal ausgegeben.
- Für die Aktivierung des detaillierten Loggings muss in der `.env`-Datei stehen:
  ```
  DEBUG_DISCOUNT=true
  ```
- Die gesamte Logik ist modular und kann für weitere Rabatt-Features (z.B. automatische Rabatte) erweitert werden.

### Beispiel für ein Terminal-Log bei erfolgreicher Anwendung

```
[Discount][Raw Response] { ...komplette API-Antwort... }
[Discount] Erfolgreich angewendeter Code: [ { code: 'SUMMER2024', applicable: true } ]
[Cart][State after discount] { ...Warenkorb mit Rabatt... }
[Checkout URL] https://.../checkouts/...?...
```

### Fehlerbehandlung

- Bei ungültigen oder nicht anwendbaren Codes werden die Fehler im Terminal ausgegeben:
  ```
  [Discount] Fehler beim Anwenden des Codes: [ { field: ..., message: ... } ]
  ```
- Die Anwendung des Codes beeinflusst die Checkout-URL und die finale Preisberechnung.

---
