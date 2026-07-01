import { useMemo } from "react";
import AlertCarousel from "./AlertCarousel.jsx";
import classNames from "./DepartureBoard.module.css";
import MigrateWarning from "./MigrateWarning.jsx";
import StopGrid from "./StopGrid.jsx";
import useOptimalGridDimensions from "../hooks/useOptimalGridDimensions.js";
import AlertList from "./AlertList.jsx";

export default function DepartureBoard({ migrateWarning, stops, alerts, displayMode }) {
  const [width, height] = useOptimalGridDimensions(stops.length);
  const style = useMemo(
    () => ({ fontSize: `min(${3 / width}vw, ${3 / height}vh)` }),
    [width, height],
  );
  return (
    <div className={classNames["departure-board"]} style={style}>
      {migrateWarning && <MigrateWarning />}
      {(displayMode === "all" || displayMode === "departures") && <StopGrid stops={stops} width={width} />}
      {displayMode === "all" && <AlertCarousel alerts={alerts} />}
      {displayMode === "alerts" && <AlertList alerts={alerts} />}
    </div>
  );
}
