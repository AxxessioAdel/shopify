import express from "express";

const router = express.Router();

// Route zur Verarbeitung der Zahlungsbestätigung
router.post("/payment-confirmation", (req, res) => {
  console.log("[ClubManager] Zahlungsdaten empfangen:", req.body);
  res.status(200).json({ status: "ok", received: true });
});

export default router;
