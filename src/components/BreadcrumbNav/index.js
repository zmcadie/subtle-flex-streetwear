import React, { useState, useEffect } from "react"
import { Link } from "gatsby"

import "./styles.scss"

const BreadcrumbNav = () => {
  const [ paths, setPaths ] = useState([])

  useEffect(() => {
    const from = window.history.state && window.history.state.from
    const pathname = window.location.pathname.split("/").filter(path => !!path)
    const pathsArr = from && from !== "/"
      ? [...from.split("/").filter(path => !!path), pathname[pathname.length - 1]]
      : pathname

    setPaths(pathsArr)
  }, [])
  
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
      <Link
        className="mobile-breadcrumb"
        to={`/${paths.slice(0, paths.length - 1).join("/")}`}
      >
        { paths[paths.length - 2] || "home" }
      </Link>
    </nav>
  )
}

export default BreadcrumbNav