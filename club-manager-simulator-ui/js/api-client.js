export async function sendProvisioningRequest(payload) {
  const response = await fetch("http://localhost:3002/simulate-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  return result;
}
