import { useMemo } from "react";

export default function AlertRoute({ name, color }) {
  const style = useMemo(
    () => ({ textDecorationLine: "underline", textDecorationColor: `#${color}` }),
    [color],
  );
  return <span style={style}> {name} </span>;
}
