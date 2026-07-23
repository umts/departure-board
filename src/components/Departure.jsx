import { useContext, useMemo } from "react";
import DepartureTimeFormatterContext from "../contexts/DepartureTimeFormatterContext.js";
import useRouteColors from "../hooks/useRouteColors.js";
import useTripStatus from "../hooks/useTripStatus.js";
import classNames from "./Departure.module.scss";

export default function Departure({ route, destination, time, status, color }) {
  const timeFormatter = useContext(DepartureTimeFormatterContext);
  const colorings = useRouteColors(color);
  const decorations = useTripStatus(status);
  const styles = useMemo(() => ({...colorings, ...decorations}), [colorings, decorations]);

  return (
    <li className={classNames["departure-container"]}>
      <div className={classNames["departure-route"]} style={styles}>
        {route}
      </div>
      <div className={classNames["departure-destination"]} style={styles}>
        {destination}
      </div>
      <div className={classNames["departure-time"]} style={styles}>
        {timeFormatter(time)}
      </div>
    </li>
  );
}
