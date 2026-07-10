import { useEffect } from "react";

export default function useAlertRotation(alertsLength, setAlertIndex, rotationInterval) {
  useEffect(() => {
    if (alertsLength <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setAlertIndex((index) => (index + 1) % alertsLength);
    }, rotationInterval);
    return () => clearInterval(interval);
  }, [alertsLength, setAlertIndex, rotationInterval]);
}
