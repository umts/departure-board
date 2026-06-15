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
  const scrollRef = useRef(0);
  const rafRef = useRef(null);
  const runningRaf = useRef(true);
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    scrollRef.current = element.scrollTop || 0;
    let lastTime = performance.now();
    const speed = 15;
    const animate = (now) => {
      if (!runningRaf.current) return;

      if (!lastTime) lastTime = now;

      const delta = (now - lastTime) / 1000;
      lastTime = now;
      scrollRef.current += speed * delta;
      const maxScroll = element.scrollHeight - element.clientHeight;
      if (scrollRef.current >= maxScroll) {
        scrollRef.current = 0;
      }

      element.scrollTop = scrollRef.current;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div ref={containerRef} className={classNames["departure-board"]} style={style}>
      {migrateWarning && <MigrateWarning />}
      <StopGrid stops={stops} width={width} />
      <AlertCarousel alerts={alerts} />
    </div>
  );
}
