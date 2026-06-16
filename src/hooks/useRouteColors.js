import { useMemo } from "react";

export default function useRouteColors(color) {
  return useMemo(() => ({ backgroundColor: `${color}55`, borderColor: color }), [color]);
}
