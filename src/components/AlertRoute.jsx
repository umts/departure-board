import { useMemo } from "react";
import classNames from "./AlertRoute.module.css";

export default function AlertRoute({ name, color, routeTextColor }) {
  const style = useMemo(
    () => ({ "background-color": `#${color}`, color: `#${routeTextColor}` }),
    [color, routeTextColor],
  );
  return (
    <span style={style} className={classNames["alert-route"]}>
      {name}
    </span>
  );
}
