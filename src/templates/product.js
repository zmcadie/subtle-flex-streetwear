import React, { useMemo, useContext, useEffect, useState } from "react"
import { graphql } from 'gatsby'
import Image from "gatsby-image"
import StoreContext from "../context/StoreContext"
import { Layout, AddToCart } from "../components"

import "./product.scss"

const ImageDisplay = ({ images }) => {
  const [ selected, setSelected ] = useState(images[0].localFile.childImageSharp.fluid)

  const getDimensions = () => {
    const vw = window.innerWidth
    let selectedDimensions = selected.aspectRatio > 1
      ? { width: 500, height: 500 / selected.aspectRatio }
      : { height: 500, width: 500 * selected.aspectRatio }
    if (vw < 500) {
      selectedDimensions = selected.aspectRatio > 1
        ? { width: "100vw", height: `calc(100vw / ${selected.aspectRatio})` }
        : { height: "100vw", width: `calc(100vw * ${selected.aspectRatio})` }
    }
    return selectedDimensions
  }

  return (
    <div className="image-display-container">
      <div className="image-display">
        <Image
          fluid={ selected }
          style={ getDimensions() }
        />
      </div>
      <ul className="image-thumbnail-container">
        { images.map((img, i) => {
          const { fluid } = img.localFile.childImageSharp
          const isSelected = fluid === selected
          return (
            <li
              key={ i }
              className={`image-thumbnail ${isSelected ? "selected" : ""}`}
              onMouseEnter={() => setSelected(fluid)}
              onClick={() => setSelected(fluid)}
            >
              <Image
                fluid={ fluid }
                style={{ width: "50px" }}
              />
            </li>
          )
        }) }
      </ul>
    </div>
  )
}

const CurrencyDisplay = ({ cost }) => {
  const { store: { selected_currency: { code, symbol }}} = useContext(StoreContext)
  const price = cost[code]
  const float = Number.parseFloat(price)
  const isRound = Math.round(float) === float
  const displayPrice = (Math.round(float * 100) / 100).toFixed(isRound ? 0 : 2)
  return <div className="currency-display">{symbol}{displayPrice}</div>
}

const ProductTemplate = ({ data }) => {
  const {
    title,
    images,
    descriptionHtml,
    variants: [{
      shopifyId,
      presentmentPrices
    }]
  } = data.shopifyProduct

  const cost = useMemo(() => presentmentPrices.edges.reduce((acc, cur) => {
    const { price: { amount, currencyCode }} = cur.node
    return {
      ...acc,
      [currencyCode]: amount
    }
  }, {}), [ presentmentPrices ])

  return (
    <Layout className="product-layout">
      <div className="product-container">
        <h1 className="mobile-header">{ title }</h1>
        <ImageDisplay {...{ images }} />
        <div className="product-details">
          <h1>{ title }</h1>
          {/* { product.images.map(({originalSrc: src}, i) => <img {...{key:i, alt:"", src}} />) } */}
          <div className="product-description" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          <CurrencyDisplay {...{ cost }} />
          <AddToCart productId={ shopifyId } />
        </div>
      </div>
    </Layout>
  )
}

export default ProductTemplate

export const productTypeQuery = graphql`
  query ProductQuery($id: String!) {
    shopifyProduct(id: { eq: $id }) {
      descriptionHtml
      ...ProductFragment
    }
  }
`