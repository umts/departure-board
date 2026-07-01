import classNames from "./AlertCarousel.module.css";
import AlertRoute from "./AlertRoute.jsx";

export default function AlertList({ alerts }) {


  return (
    <div>
      {alerts.map((alert) => (
        <div role="alert" className={classNames["alert-carousel"]} key={alert.id}>
          <div className={classNames["alert-number"]}>
            <div>
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
          </div>
          <div className={classNames["alert-content"]}>
            <div className={classNames["alert-subject"]}>
              <div>
                <strong>{alert.header}</strong>
              </div>
              <div className={classNames["alert-routes"]}>
                {alert.routes.map((route) => (
                  <AlertRoute
                    key={`${alert.id}-${route.id}`}
                    name={route.name}
                    color={route.color}
                  />
                ))}
              </div>
            </div>
            <div>{alert.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
