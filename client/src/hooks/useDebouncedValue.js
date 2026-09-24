import { useEffect, useState } from 'react';

/** Delays updating the returned value until `value` stops changing for `delay` ms — used for the search box. */
export default function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
