import { useEffect } from "react";

export default function useAutoScroll(departures, containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    const topPause = 10000;
    const bottomPause = 2000;
    const scrollTime = 20;

    let timeout;
    let direction = 1;

    const scroll = () => {
      const maxScroll = container.scrollHeight - container.clientHeight;

      if (maxScroll <= 0) {
        return;
      }

      if (direction === 1 && container.scrollTop < maxScroll) {
        container.scrollTop += 1;
        timeout = setTimeout(scroll, scrollTime);
      } else if (direction === 1 && container.scrollTop >= maxScroll) {
        direction = -1;
        timeout = setTimeout(scroll, bottomPause);
      } else if (container.scrollTop > 0) {
        container.scrollTop -= 1;
        timeout = setTimeout(scroll, scrollTime);
      } else {
        direction = 1;
        timeout = setTimeout(scroll, topPause);
      }
    };

    timeout = setTimeout(scroll, topPause);

    return () => {
      clearTimeout(timeout);
    };
  }, [departures, containerRef]);
}
