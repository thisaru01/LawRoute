import { useEffect, useState } from "react";

export function useCountdownRedirect({ enabled, initialSeconds = 20, onComplete }) {
  const [countdown, setCountdown] = useState(initialSeconds);

  useEffect(() => {
    if (!enabled) {
      setCountdown(initialSeconds);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      onComplete?.();
    }
  }, [enabled, countdown, initialSeconds, onComplete]);

  return { countdown, setCountdown };
}
