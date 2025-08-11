import classNames from './Stop.module.css'

export default function Stop ({ name, children }) {
  return (
    <article className={classNames['stop-container']}>
      <h1 className={classNames['stop-header']}>
        {name}
      </h1>
      <hr />
      <ul className={classNames['stop-departures']}>{children}</ul>
    </article>
  )
}
