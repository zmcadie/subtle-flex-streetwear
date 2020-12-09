import React from "react"
import { Link } from "gatsby"

const BreadcrumbNav = () => {
  const from = window.history.state && window.history.state.from
  let paths = window.location.pathname.slice(1).split("/")
  if (from && from !== "/") paths = [...from.slice(1).split("/"), paths[paths.length - 1]]
  return (
    <nav className="breadcrumb-nav">
      <Link to="/">home</Link>
      <span className="nav-break">/</span>
      { paths.map((path, i) => {
        const link = "/" + paths.slice(0, i + 1).join("/")
        const label = path.replace(/-/g, " ")

        if (i === paths.length - 1) return <span key={ i } className="current-label">{ label }</span>
        
        return (
          <React.Fragment key={ i }>
            <Link to={ link }>{ label }</Link>
            <span className="nav-break">/</span>
          </React.Fragment>
        )
      }) }
    </nav>
  )
}

export default BreadcrumbNav