# Shopify Produktbereitstellung & Headless Checkout Integration

---

Dieses Projekt bietet eine vollständige Headless-Integration zwischen Club Manager, Shopify und einem Web-Frontend.

Es besteht aus zwei unabhängigen Modulen:

1️⃣ **Produktbereitstellungsdienst (Integration Backend)**

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

- Headless Shopify-Integration über die Admin API (Produktbereitstellung)
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

## 🔧 Projektstruktur

```
.gitignore
Berichten.md
package-lock.json
package.json
README.md

club-manager-simulator/
│   .env
│   index.js
│   package-lock.json
│   package.json
│
├───routes/
│       paymentConfirmation.js
│
├───utils/
│       clubManagerApiClient.js
│
└───webhooks/
        ordersPaidWebhook.js

club-manager-simulator-ui/
│   create-product.html
│   index.html
│   update-product.html
│
└───js/
        api-client.js
        utils.js

customer-checkout-backend/
    .env
    checkout-handler.js
    checkout.js
    create-customer.js
    index.js
    product-provisioning.js
    test-simulator.js

integration-backend/
    .env
    index.js
    product-sync-simulator.js
    registerWebhook.js
    shopify-product-sync.js

public/
    create-customer.html
    demo-purchase.html
    script.js
    test-product.html
```

---

### Bereichs- und Dateibeschreibungen

#### Projekt-Root

- `.gitignore`, `package.json`, `package-lock.json`, `README.md`, `Berichten.md`: Konfigurations- und Dokumentationsdateien für das gesamte Projekt.

#### club-manager-simulator

- **index.js**: Startpunkt und Server für den Club Manager Simulator.
- **.env**: Umgebungsvariablen für den Simulator.
- **routes/paymentConfirmation.js**: Route für Zahlungsbestätigungen.
- **utils/clubManagerApiClient.js**: Hilfsfunktionen für die Kommunikation mit der Club Manager API.
- **webhooks/ordersPaidWebhook.js**: Webhook-Handler für eingehende Zahlungsbenachrichtigungen von Shopify.

#### club-manager-simulator-ui

- **index.html, create-product.html, update-product.html**: Benutzeroberfläche zur Produktverwaltung.
- **js/api-client.js**: API-Client für Backend-Kommunikation.
- **js/utils.js**: UI-Hilfsfunktionen.

#### customer-checkout-backend

- **index.js**: Einstiegspunkt für den Checkout-Backend-Server.
- **.env**: Umgebungsvariablen.
- **checkout.js, checkout-handler.js**: Checkout-Logik und Handler.
- **create-customer.js**: Anlage neuer Kunden in Shopify.
- **product-provisioning.js**: Produktbereitstellung für den Checkout.
- **test-simulator.js**: Test- und Simulationswerkzeuge für den Checkout-Prozess.

#### integration-backend

- **index.js**: Einstiegspunkt für den Produktbereitstellungsservice.
- **.env**: Umgebungsvariablen.
- **shopify-product-sync.js**: Synchronisation von Produkten mit Shopify.
- **product-sync-simulator.js**: Test-Simulator für die Produktsynchronisation.
- **registerWebhook.js**: Registrierung und Verwaltung von Webhooks in Shopify.

#### public

- **create-customer.html, demo-purchase.html, test-product.html**: Demo-Seiten für Kundenanlage und Testkäufe.
- **script.js**: Clientseitige Skripte für die Demo-Seiten.

---

## 🛠 Installation & Setup

### 1️⃣ Grundinstallation pro Service

Navigiere in die jeweiligen Unterverzeichnisse und führe aus:

```bash
npm install
```

**Hinweis:** Jeder Service hat eine eigene `package.json`.

### 2️⃣ `.env`-Dateien konfigurieren

#### integration-backend/.env

```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=shpat_xxx
```

#### club-manager-simulator/.env

```
PROVISIONING_API_URL=http://localhost:3001/api/product-provisioning
CLUB_MANAGER_PORT=3002
```

---

## 🚀 Lokale Startreihenfolge

1️⃣ Integration Backend starten:

```bash
cd integration-backend
node index.js
```

2️⃣ Club Manager Simulator starten:

```bash
cd club-manager-simulator
node index.js
```

3️⃣ Test-Webhooks auslösen:

```bash
Invoke-WebRequest -Method POST http://localhost:3002/simulate-webhook
```

---

## 🌐 Webhook Public Deployment & Live Integration

### Ziel

Der Produktbereitstellungsdienst muss öffentlich erreichbar sein, damit Club Manager Webhooks auslösen kann, sobald eine Preisgruppe gespeichert wird.

---

### 1️⃣ Lokale Bereitstellung mit ngrok (für Integrationstests & Demo)

#### a) ngrok Setup

- Installiere ngrok: [https://ngrok.com/download](https://ngrok.com/download)
- Authentifiziere deinen Account:

```bash
ngrok config add-authtoken <YOUR_AUTH_TOKEN>
```

#### b) ngrok Tunnel starten

```bash
ngrok http 3001
```

ngrok erzeugt eine öffentliche URL, z.B.:

```
https://abcd-1234.ngrok-free.app
```

#### c) Webhook-Endpunkt für Club Manager

Dieser Endpunkt wird dem Club Manager bereitgestellt:

```
https://abcd-1234.ngrok-free.app/api/product-provisioning
```

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

Vor jedem Test muss ein neuer öffentlicher Tunnel zu deinem lokalen Server gestartet werden:

```bash
ngrok http 3002
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
  order_id: 7280665002248,
  email: '',
  phone: '+4917658869339',
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
- Sendet Daten ans Backend zur Shopify-Integration.

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
