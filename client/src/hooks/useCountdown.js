import { useEffect, useState } from 'react';
import { splitDuration } from '../utils/format.js';

/** Ticks once a second toward `targetDate`. Returns null once expired. */
export default function useCountdown(targetDate) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) return null;
  const remainingMs = new Date(targetDate).getTime() - now;
  if (remainingMs <= 0) return null;
  return splitDuration(remainingMs);
}
