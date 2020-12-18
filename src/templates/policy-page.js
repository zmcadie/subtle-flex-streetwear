import React from "react"
import { Layout } from "../components"

import "./policy-page.scss"

const PolicyPage = ({ pageContext }) => {
  return (
    <Layout>
      <div className="policy-page">
        <h1>{ pageContext.title }</h1>
        <div className="policy-content" dangerouslySetInnerHTML={{ __html: pageContext.body }} />
      </div>
    </Layout>
  )
}

export default PolicyPage