// Test für syncState.js
// Führt setLastProcessedAt und getLastProcessedAt aus und gibt das Ergebnis aus

import { getLastProcessedAt, setLastProcessedAt } from './syncState.js';

(async () => {
  await setLastProcessedAt('2025-06-21T12:00:00Z');
  const last = await getLastProcessedAt();
  console.log('Last Processed At:', last);
})();
