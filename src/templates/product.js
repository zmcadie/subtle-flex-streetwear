import React from "react"

import {Layout} from "../components"

const ProductTemplate = ({ pageContext }) => {
  const { product } = pageContext
  return (
    <Layout>
      <h1>{product.title}</h1>
      { product.images.map(({originalSrc: src}, i) => <img {...{key:i, alt:"", src}} />) }
      <div>{product.description}</div>
    </Layout>
  )
}

export default ProductTemplate