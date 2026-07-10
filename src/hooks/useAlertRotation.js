import { useEffect } from "react";

export default function useAlertRotation(alertsLength, setAlertIndex) {
  useEffect(() => {
    if (alertsLength <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setAlertIndex((index) => (index + 1) % alertsLength);
    }, 20000);
    return () => clearInterval(interval);
  }, [alertsLength, setAlertIndex]);
}
