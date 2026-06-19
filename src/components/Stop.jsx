import classNames from "./Stop.module.css";
import Departure from "./Departure.jsx";

export default function Stop({ name, departures }) {
  return (
    <article className={classNames["stop-container"]}>
      <h1 className={classNames["stop-header"]}>{name}</h1>
      <hr />
      <div className={classNames["scroll-container"]}>
        <div className={classNames["scroll-track"]}>
          <ul className={classNames["stop-departures"]}>
            {departures.map((departure) => (
              <Departure
                key={departure.id}
                route={departure.route}
                destination={departure.destination}
                time={departure.time}
                color={departure.color}
              />
            ))}
          </ul>
          <ul className={classNames["stop-departures"]} aria-hidden="true">
            {departures.map((departure) => (
              <Departure
                key={departure.id}
                route={departure.route}
                destination={departure.destination}
                time={departure.time}
                color={departure.color}
              />
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
