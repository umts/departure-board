import { useMemo } from "react";

export default function AlertRoute({ name, color, routeTextColor }) {
  const style = useMemo(
    () => ({ "background-color": `#${color}`, color: `#${routeTextColor}`, padding: "0 0.75rem" }),
    [color, routeTextColor],
  );
  return <span style={style}> {name} </span>;
}
