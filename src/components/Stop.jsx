import classNames from "./Stop.module.css";
import Departure from "./Departure.jsx";
import { useRef } from "react";
import useAutoScroll from "../hooks/useAutoScroll.js";

export default function Stop({ name, departures }) {
  const containerRef = useRef(null);
  useAutoScroll(departures, containerRef);
  return (
    <article>
      <h1 className={classNames["stop-header"]}>{name}</h1>
      <hr />
      <div role="region" ref={containerRef} className={classNames["scroll-container"]}>
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
