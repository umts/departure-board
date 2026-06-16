import { useMemo } from "react";
import classNames from "./AlertRoute.module.css";

export default function AlertRoute({ name, color }) {
  const style = useMemo(() => ({ "background-color": `#${color}` }), [color]);
  return (
    <span className={classNames["alert-route"]} style={style}>
      {name}
    </span>
  );
}
