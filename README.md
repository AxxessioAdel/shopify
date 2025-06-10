# Shopify Checkout Test

# Shopify Checkout Demo (2-stufige Testumgebung)

Dieses Projekt simuliert einen zweistufigen Shopify-Kaufprozess:

1. **Erstellung eines Kunden** über ein benutzerdefiniertes Webformular und Backend-API
2. **Demo-Kauf** eines Produkts mit Checkout-Weiterleitung über die Storefront API

---

## 📦 Repository

Du findest das Projekt unter:

```
git@github.com:AxxessioAdel/shopify.git
```

---

## 🧰 Voraussetzungen

Bitte stelle sicher, dass folgende Komponenten installiert sind:

- [Node.js](https://nodejs.org/) (empfohlen: v18 oder höher)
- [npm](https://www.npmjs.com/) oder [yarn](https://yarnpkg.com/)
- Ein Shopify-Testshop mit aktivierter **Storefront API** und **Admin API** (über eine private App)
- Optional: Live Server Extension (für lokale HTML-Tests)

---

## ⚙️ Einrichtung

1. **Projekt klonen**

   ```bash
   git clone git@github.com:AxxessioAdel/shopify.git
   cd shopify
   ```

2. **Abhängigkeiten installieren**

   ```bash
   npm install
   ```

3. **Umgebungsvariablen setzen**

   Erstelle im Projekt-Hauptverzeichnis eine Datei `.env` mit folgendem Inhalt:

   ```env
   SHOPIFY_ADMIN_TOKEN=<SHOPIFY_ADMIN_TOKEN>
   SHOPIFY_STORE_DOMAIN=<SHOPIFY_STORE_DOMAIN>
   ```

   Beispiel:

   ```env
   SHOPIFY_ADMIN_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SHOPIFY_STORE_DOMAIN=my-shop.xxxxx.com
   ```

4. **Backend starten**

   ```bash
   node index.js
   ```

   ➜ Der Server läuft unter: `http://localhost:3000`

---

## 🔑 Token-Konfiguration (Frontend)

Die Datei `public/checkout-handler.js` benötigt zusätzlich den **Storefront Access Token**.  
Ersetze innerhalb der Datei:

```js
"X-Shopify-Storefront-Access-Token": "<Access-Token>"
```

mit deinem gültigen Token.

---

## 🧪 Testablauf

1. Öffne im Browser die Datei `create-customer.html` (z. B. über Live Server)
2. Fülle das Kundenformular aus → Daten werden über das Backend sicher an Shopify gesendet
3. Nach erfolgreicher Erstellung wirst du automatisch zu `demo-purchase.html` weitergeleitet
4. Dort kannst du einen Demokauf durchführen, der über die Storefront API im Warenkorb landet
5. Die Weiterleitung erfolgt automatisch zur Shopify-Checkout-Seite

---

## 📁 Projektstruktur

```
shopify-checkout-server/
│   .env                      # Umgebungsvariablen (lokal, nicht im Repo)
│   .gitignore
│   package-lock.json
│   package.json
│   README.md
│
├───backend/
│   ├── checkout-handler.js   # Storefront API (GraphQL-Logik)
│   ├── checkout.js           # JS-Logik für Demo-Kauf
│   ├── create-customer.js    # JS-Logik für Kundenerstellung
│   └── index.js              # Express-Backend (API-Endpunkt)
│
└───public/
    ├── create-customer.html  # Schritt 1: Kundenformular
    ├── demo-purchase.html    # Schritt 2: Demo-Kaufseite
    └── script.js             # Gemeinsame Zusatzlogik (optional)
```

---

## 🧼 Hinweise

- Vermeide doppelte Telefonnummern/Emails bei mehreren Tests – Shopify erlaubt keine Duplikate
- Dieses Projekt ist **nicht für Produktion** gedacht, sondern dient ausschließlich Test- und Evaluierungszwecken
- Die API-Tokens sollten **niemals im Frontend** (öffentlich) sichtbar sein

---

## 🙋 Kontakt

Für Rückfragen steht Adel Ahmadi zur Verfügung  
✉️ adel.ahmadi.informatiker@gmail.com

---

```

```
