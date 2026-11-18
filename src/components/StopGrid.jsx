import { useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import TimeFormatterContext from "../contexts/DepartureTimeFormatterContext.js";
import Stop from "./Stop.jsx";
import classNames from "./StopGrid.module.css";

const ABSOLUTE_TIME = (time) => format(time, "h:mm aaa");
const RELATIVE_TIME = formatDistanceToNow;

export default function StopGrid({ stops, width }) {
  const [timeFormatter, setTimeFormatter] = useState(() => ABSOLUTE_TIME);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeFormatter(timeFormatter === ABSOLUTE_TIME ? () => RELATIVE_TIME : () => ABSOLUTE_TIME);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [timeFormatter]);

  const style = useMemo(() => ({ gridTemplateColumns: `repeat(${width}, 1fr)` }), [width]);

  return (
    <div className={classNames["stop-grid"]} style={style}>
      <TimeFormatterContext value={timeFormatter}>
        {stops.map((stop) => (
          <Stop key={stop.id} name={stop.name} departures={stop.departures} />
        ))}
      </TimeFormatterContext>
    </div>
  );
}
