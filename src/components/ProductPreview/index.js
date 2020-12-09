import React, { useMemo, useContext } from "react"
import { Link } from "gatsby"
import BackgroundImage from 'gatsby-background-image'
import StoreContext from "../../context/StoreContext"

import AddToCart from "../AddToCart"

const CurrencyDisplay = ({ cost }) => {
  const { store: { selected_currency: { code, symbol }}} = useContext(StoreContext)
  const price = cost[code]
  const float = Number.parseFloat(price)
  const isRound = Math.round(float) === float
  const displayPrice = (Math.round(float * 100) / 100).toFixed(isRound ? 0 : 2)
  return `${symbol}${displayPrice}`
}

const Img = ({ firstImage, secondImage, handle }) => {
  const hasFirst = firstImage && firstImage.localFile
  const hasSecond = secondImage && secondImage.localFile
  return hasFirst ? (
    <BackgroundImage
      className={`product-preview-image ${ !hasSecond ? "zoom-transition" : ""}`}
      fluid={ (hasSecond ? secondImage : firstImage).localFile.childImageSharp.fluid }
      alt={ handle }
    >
      <BackgroundImage
        className="product-preview-image transition-on-hover"
        fluid={ firstImage.localFile.childImageSharp.fluid }
        alt={ handle }
      />
    </BackgroundImage>
  ) : ""
}

const ProductPreview = ({ product, preventTab, ...innerProps }) => {
  const {
    shopifyId,
    images: [firstImage, secondImage],
    title,
    handle,
    variants
  } = product

  const prices = useMemo(() => variants.reduce((acc, cur) => {
    cur.presentmentPrices.edges.forEach(({ node }) => {
      const { price: { amount, currencyCode }} = node
      const missingPrice = !acc[currencyCode]
      const newAmountIsLower = Number.parseFloat(acc[currencyCode]) > Number.parseFloat(amount)
      if (missingPrice || newAmountIsLower) acc[currencyCode] = amount
    })
    return acc
  }, {}), [ variants ])

  return (
    <li className="product-preview-container" {...innerProps}>
      <Link to={ `/shop/${ handle }` } state={{ from: window.location.pathname }} {...preventTab && { tabIndex: "-1" }}>
        <Img {...{ firstImage, secondImage, handle }} />
        <h3>
          <p>{ title }</p>
          <p><CurrencyDisplay cost={ prices } /></p>
        </h3>
        <AddToCart {...preventTab && { tabIndex: "-1" }} productId={ variants[0].shopifyId } />
      </Link>
    </li>
  )
}

export default ProductPreview