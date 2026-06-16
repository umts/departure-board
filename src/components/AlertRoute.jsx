import useRouteColors from "../hooks/useRouteColors.js";
import classNames from "./AlertRoute.module.css";

export default function AlertRoute({ name, color }) {
  const colorings = useRouteColors(color);
  return (
    <span className={classNames["alert-route"]} style={colorings}>
      {name}
    </span>
  );
}
