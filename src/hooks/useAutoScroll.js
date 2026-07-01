import { useEffect } from "react";

export default function useAutoScroll(departures, containerRef) {
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const pauseTime = 5000;
    const scrollTime = 20;

    let timeout;
    let direction = 1;

    const scroll = () => {
      const maxScroll = container.scrollHeight - container.clientHeight;

      if (maxScroll <= 0) {
        timeout = setTimeout(scroll, pauseTime);
        return;
      }

      if (direction === 1 && container.scrollTop < maxScroll) {
        container.scrollTop += 1;
        timeout = setTimeout(scroll, scrollTime);
      } else if (direction === -1 && container.scrollTop > 0) {
        container.scrollTop -= 1;
        timeout = setTimeout(scroll, scrollTime);
      } else {
        direction *= -1;
        timeout = setTimeout(scroll, pauseTime);
      }
    };

    timeout = setTimeout(scroll, pauseTime);

    return () => {
      clearTimeout(timeout);
    };
  }, [departures, containerRef]);
}
