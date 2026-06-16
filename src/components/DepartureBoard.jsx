import { useMemo, useEffect, useRef } from "react";
import AlertCarousel from "./AlertCarousel.jsx";
import classNames from "./DepartureBoard.module.css";
import MigrateWarning from "./MigrateWarning.jsx";
import StopGrid from "./StopGrid.jsx";
import useOptimalGridDimensions from "../hooks/useOptimalGridDimensions.js";

export default function DepartureBoard({ migrateWarning, stops, alerts }) {
  const [width, height] = useOptimalGridDimensions(stops.length);
  const style = useMemo(
    () => ({ fontSize: `min(${3 / width}vw, ${3 / height}vh)` }),
    [width, height],
  );

  const containerRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const requestAnimationFrameRef = useRef(null);
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    scrollPositionRef.current = element.scrollTop || 0;
    let lastTimestamp = performance.now();
    const speed = 15;
    const animate = (now) => {
      if (!lastTimestamp) lastTimestamp = now;

      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;
      scrollPositionRef.current += speed * delta;
      const maxScroll = element.scrollHeight - element.clientHeight;
      if (scrollPositionRef.current >= maxScroll) {
        scrollPositionRef.current = 0;
      }

      element.scrollTop = scrollPositionRef.current;
      requestAnimationFrameRef.current = requestAnimationFrame(animate);
    };
    requestAnimationFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(requestAnimationFrameRef.current);
  }, []);

  return (
    <div ref={containerRef} className={classNames["departure-board"]} style={style}>
      {migrateWarning && <MigrateWarning />}
      <StopGrid stops={stops} width={width} />
      <AlertCarousel alerts={alerts} />
    </div>
  );
}
