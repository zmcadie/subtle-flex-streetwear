import React, { useMemo, useContext, useEffect, useState } from "react"
import { graphql } from 'gatsby'
import Image from "gatsby-image"
import StoreContext from "../context/StoreContext"
import { Layout, AddToCart, ProductCarousel } from "../components"
import Client from 'shopify-buy'

import "./product.scss"

const client = Client.buildClient(
  {
    storefrontAccessToken: process.env.GATSBY_SHOPIFY_ACCESS_TOKEN,
    domain: `${process.env.GATSBY_SHOPIFY_SHOP_NAME}.myshopify.com`,
  },
  fetch
)

const ImageDisplay = ({ images }) => {
  const [ selected, setSelected ] = useState(images[0].localFile.childImageSharp.fluid)
  const [ viewWidth, setViewWidth ] = useState()
  // const [ ]

  useEffect(() => {
    setViewWidth(document.documentElement.clientWidth)
    const updateViewWidth = () => setViewWidth(document.documentElement.clientWidth)
    window.addEventListener("resize", updateViewWidth)
    return () => window.removeEventListener("resize", updateViewWidth)
  }, [])

  const dimensions = useMemo(() => {
    let selectedDimensions = selected.aspectRatio > 1
      ? { width: 500, height: 500 / selected.aspectRatio }
      : { height: 500, width: 500 * selected.aspectRatio }
    if (viewWidth && viewWidth < 500) {
      selectedDimensions = selected.aspectRatio > 1
        ? { width: "100vw", height: `calc(100vw / ${selected.aspectRatio})` }
        : { height: "100vw", width: `calc(100vw * ${selected.aspectRatio})` }
    }
    return selectedDimensions
  }, [viewWidth, selected])

  return (
    <div className="image-display-container">
      <div className="image-display">
        <Image
          fluid={ selected }
          style={ dimensions }
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
              onMouseEnter={e => e.target.focus()}
              onClick={e => e.target.focus()}
              onFocus={() => setSelected(fluid)}
              tabIndex="0"
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
  
  const displayPrice = `${symbol}${Number.parseFloat(cost[code][0]).toFixed(2)}`
  const original = cost[code][1] ? `${symbol}${Number.parseFloat(cost[code][1]).toFixed(2)}` : null
  
  return (
    <div className="currency-display">
      { displayPrice }
      { original ? <span className="discounted">{original}</span> : "" }
    </div>
  )
}

const Recommended = ({ tags }) => {
  const [ products, setProducts ] = useState([])

  useEffect(() => {
    const query = `availableForSale:true AND (${tags.join(" OR ")})`
    if (!products.length) client.product.fetchQuery({ query }).then(recommended => {
      if (recommended) setProducts(recommended)
    })
  }, [])

  return (
    <ProductCarousel
      title="Recommended Products"
      {...{ products }}
    />
  )
}

const ProductTemplate = ({ data }) => {
  const {
    title,
    images,
    descriptionHtml,
    tags,
    variants: [{
      shopifyId,
      presentmentPrices,
      selectedOptions
    }]
  } = data.shopifyProduct

  const cost = useMemo(() => presentmentPrices.edges.reduce((acc, cur) => {
    const { compareAtPrice, price: { amount, currencyCode }} = cur.node
    return {
      ...acc,
      [currencyCode]: [amount, compareAtPrice ? compareAtPrice.amount : null]
    }
  }, {}), [ presentmentPrices ])

  return (
    <Layout className="product-layout">
      <div className="product-container">
        <h1 className="mobile-header">{ title }</h1>
        <ImageDisplay {...{ images }} />
        <div className="product-details">
          <h1>{ title }</h1>
          { selectedOptions.filter(({name}) => name !== "Title").map(({name, value}, i) => <div className="product-option" key={ i }><b>{name}:</b> {value}</div>) }
          <div className="product-description" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          { tags.map((tag, i) => <span key={ i } className="product-tag">•&nbsp;&nbsp;{ tag }</span>)}
          <CurrencyDisplay {...{ cost }} />
          <AddToCart productId={ shopifyId } />
        </div>
      </div>
      <Recommended {...{ tags }} />
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