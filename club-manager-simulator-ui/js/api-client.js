import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

const PORT = process.env.CLUB_MANAGER_PORT;
const CONTENT_TYPE = process.env.CONTENT_TYPE;
const isDebugLevelInfo = process.env.DEBUG_LEVEL === "info";

if (isDebugLevelInfo) {
  console.log(
    "[Debug] Club Manager Simulator API Client loaded with debug level info"
  );
  console.log("[Debug] PORT:", PORT);
  console.log("[Debug] CONTENT_TYPE:", CONTENT_TYPE);
}

export async function sendProvisioningRequest(payload) {
  const response = await fetch(`http://localhost:${PORT}/simulate-webhook`, {
    method: "POST",
    headers: { "Content-Type": CONTENT_TYPE },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  return result;
}
