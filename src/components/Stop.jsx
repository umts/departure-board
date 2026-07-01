import classNames from "./Stop.module.css";
import Departure from "./Departure.jsx";
import { useEffect, useRef } from "react";

export default function Stop({ name, departures }) {
  const containerRef = useRef(null);
  UseAutoScroll(departures, containerRef);
  return (
    <article>
      <h1 className={classNames["stop-header"]}>{name}</h1>
      <hr />
      <div ref={containerRef} className={classNames["scroll-container"]}>
        <ul className={classNames["stop-departures"]}>
          {departures.map((departure) => (
            <Departure
              key={departure.id}
              route={departure.route}
              destination={departure.destination}
              time={departure.time}
              color={departure.color}
            />
          ))}
        </ul>
      </div>
    </article>
  );
}

function UseAutoScroll(departures, containerRef) {
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
