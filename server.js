// Universal server launcher for all project servers
import dotenv from "dotenv";
dotenv.config();

const arg = process.argv[2];

if (!arg) {
  console.log("Usage: node server.js [club|checkout|productsync]");
  process.exit(1);
}

switch (arg) {
  case "club":
    import("./club-manager-simulator/index.js");
    break;
  case "checkout":
    import("./customer-checkout/index.js");
    break;
  case "productsync":
    import("./product-synchronization/index.js");
    break;
  default:
    console.log("Unknown server type. Use one of: club, checkout, productsync");
    process.exit(1);
}
