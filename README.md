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

## 🔧 Projektstruktur

```
.gitignore
Berichten.md
package-lock.json
package.json
README.md

club-manager-simulator/           # Simulations- und Sync-Backend für Club Manager & Shopify
│   .env                         # Umgebungsvariablen für den Simulator
│   index.js                     # Einstiegspunkt, steuert API, Webhook & Auto-Sync
│
│   api/                         # API-Logik für Zahlungsabgleich
│       fetchPaidOrders.js       # Holt bezahlte Bestellungen von Shopify
│       triggerPaymentSync.js    # Synchronisiert neue Zahlungen mit Club Manager
│
│   db/                          # Persistenz für Sync-Status
│       syncState.js             # SQLite-Helper für letzten Sync-Zeitpunkt
│       syncState.sqlite         # SQLite-Datenbank
│
│   routes/                      # Express-Routen
│       paymentConfirmation.js   # Route für Zahlungsbestätigung
│
│   utils/                       # Hilfsfunktionen
│       clubManagerApiClient.js  # API-Client für Club Manager
│
│   webhooks/                    # Webhook-Handler
│       ordersPaidWebhook.js     # Webhook für bezahlte Bestellungen
│
club-manager-simulator-ui/       # Frontend für Produktverwaltung & Test
│   create-product.html
│   index.html
│   update-product.html
│   js/
│       api-client.js
│       utils.js
│
customer-checkout/       # Backend für Checkout- und Kundensimulation
│   checkout-handler.js
│   checkout.js
│   create-customer.js
│   index.js
│   product-provisioning.js
│   test-simulator.js
│
product-synchronization/             # Backend für Produktbereitstellung & Webhook-Registrierung
│   fetchPaidOrders.js
│   index.js
│   product-sync-simulator.js
│   registerWebhook.js
│   shopify-product-sync.js
│
public/                          # Statische Testseiten
│   create-customer.html
│   demo-purchase.html
│   script.js
│   test-product.html
```

### Kurzbeschreibung der Hauptmodule:

- **club-manager-simulator/**: Simuliert und synchronisiert Zahlungen zwischen Shopify und Club Manager. Enthält API, Webhook, Datenbank und Auto-Sync-Logik.
- **club-manager-simulator-ui/**: Einfache Weboberfläche zur Produktverwaltung und Testzwecken.
- **customer-checkout/**: Simuliert den Checkout-Prozess und die Kundenerstellung für Testzwecke.
- **product-synchronization/**: Verantwortlich für die Produktbereitstellung in Shopify und die Registrierung von Webhooks.
- **public/**: Enthält statische HTML-Seiten für Demo- und Testzwecke.

Jedes Modul ist klar abgegrenzt und unterstützt eine saubere, wartbare Projektstruktur.

---

## 🛠 Installation & Setup

### 1️⃣ Grundinstallation pro Service

Navigiere in die jeweiligen Unterverzeichnisse und führe aus:

```bash
npm install
```

**Hinweis:** Jeder Service hat eine eigene `package.json`.

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
DEBUG_LEVEL=...
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

### 🧠 Umschalten zwischen den Methoden

Über die Umgebungsvariable `USE_WEBHOOK` in der Datei `.env`:

- `USE_WEBHOOK=true` → Nur Webhook-Modus ist aktiv
- `USE_WEBHOOK=false` → Nur API-Polling ist aktiv

---

Diese Struktur ermöglicht eine präzise Vergleichbarkeit, Testbarkeit und bessere Entscheidungsfindung im Projekt.

---

## 🚀 Server starten

Um die verschiedenen Server-Komponenten des Projekts zu starten, verwenden Sie die folgenden Befehle:

- **Club Manager Simulator starten:**
  ```
  npm run start:club
  ```
- **Customer Checkout Backend starten:**
  ```
  npm run start:checkout
  ```
- **Product Synchronization Backend starten:**
  ```
  npm run start:productsync
  ```

Jeder Befehl startet den jeweiligen Server auf dem in der `.env`-Datei konfigurierten Port.

---

### 📝 Aufgaben der einzelnen Server

- **Club Manager Simulator**

  - Simuliert das Verhalten des Club Manager-Systems.
  - Sendet Testdaten und Webhooks an die anderen Komponenten.
  - Dient zur lokalen Entwicklung und zum Testen der Integration.

- **Customer Checkout Backend**

  - Stellt eine API für den Kunden-Checkout-Prozess bereit.
  - Verwaltet die Erstellung von Kunden, Warenkörben und Checkout-Links.
  - Kommuniziert mit Shopify über die Storefront API.

#### 🛒 Testkauf über das Demo-Frontend

Um den Checkout-Prozess zu testen, steht eine Beispielseite zur Verfügung:

1. **Server starten:**  
   Starten Sie das Customer Checkout Backend mit  
   ```
   npm run start:checkout
   ```
   (Standard-Port: 3000, siehe `.env`)

2. **Demo-Seite aufrufen:**  
   Öffnen Sie im Browser  
   ```
   http://localhost:3000/demo-purchase.html
   ```

3. **Formular ausfüllen:**  
   Geben Sie die erforderlichen Kundendaten und eine Variant-ID ein.

4. **Kauf abschließen:**  
   Nach Klick auf „Kaufen“ wird ein Test-Checkout über die Shopify Storefront API durchgeführt.  
   Sie werden automatisch zum generierten Checkout-Link weitergeleitet.

> Diese Seite dient ausschließlich zu Test- und Entwicklungszwecken.

- **Product Synchronization Backend**
  - Synchronisiert Produkte zwischen Club Manager und Shopify.
  - Empfängt Webhooks vom Club Manager und erstellt/aktualisiert Produkte in Shopify.
  - Dient als Bindeglied für die Produktbereitstellung.
