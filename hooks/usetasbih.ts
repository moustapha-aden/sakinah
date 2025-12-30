import { useState } from "react";

export function useTasbih(initial = 0) {
  const [count, setCount] = useState(initial);

  const increment = () => setCount((c) => c + 1);
  const reset = () => setCount(0);

  return { count, increment, reset };
}
