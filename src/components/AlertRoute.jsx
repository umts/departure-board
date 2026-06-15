import { useMemo } from "react";

export default function AlertRoute({ name, color, routeTextColor }) {
  const style = useMemo(
    () => ({ "background-color": `#${color}`, color: `#${routeTextColor}` }),
    [color, routeTextColor],
  );
  return <span style={style}> {name} </span>;
}
