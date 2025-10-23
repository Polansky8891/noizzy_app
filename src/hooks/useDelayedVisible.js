import { useEffect, useState } from "react";

export default function useDelayedVisible(loading, delay = 220) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading) { setVisible(false); return; }
    const id = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(id);
  }, [loading, delay]);

  return visible; // true => ya podemos mostrar skeleton
}