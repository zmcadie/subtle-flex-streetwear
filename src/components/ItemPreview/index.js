import React, { useMemo, useContext, useEffect, useState } from "react"
import { Link } from "gatsby"
import BackgroundImage from 'gatsby-background-image'
import StoreContext from "../../context/StoreContext"

import AddToCart from "../AddToCart"

import "./styles.scss"

const CurrencyDisplay = ({ cost }) => {
  const { store: { selected_currency: { code, symbol }}} = useContext(StoreContext)
  
  const price = Number.parseFloat(cost[code][0])
  const isRound = Math.round(price) === price
  const displayPrice = `${symbol}${price.toFixed(isRound ? 0 : 2)}`

  const original = Number.parseFloat(cost[code][1])
  const originalIsRound = Math.round(original) === original
  const originalDisplay = `${symbol}${original.toFixed(originalIsRound ? 0 : 2)}`

  return (
    <p className="preview-currency-display">
      { displayPrice }
      { original ? <span className="discounted">{ originalDisplay }</span> : "" }
    </p>
  )
}

const Img = ({ firstImage, secondImage, alt }) => {
  const hasFirst = firstImage && firstImage.localFile
  const hasSecond = secondImage && secondImage.localFile
  return hasFirst ? (
    <BackgroundImage
      className={`item-preview-image ${ !hasSecond ? "zoom-transition" : ""}`}
      fluid={ (hasSecond ? secondImage : firstImage).localFile.childImageSharp.fluid }
      alt={ alt }
    >
      <BackgroundImage
        className="item-preview-image transition-on-hover"
        fluid={ firstImage.localFile.childImageSharp.fluid }
        alt={ alt }
      />
    </BackgroundImage>
  ) : ""
}

const ItemPreview = ({
  path,
  image,
  content,
  Action,
  preventTab,
  ...innerProps
}) => {
  const [ pathname, setPathname ] = useState("")

  useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  return (
    <li className="item-preview-container" {...innerProps}>
      <Link to={ path } state={{ from: pathname }} {...preventTab && { tabIndex: "-1" }}>
        <Img {...image} />
        <h3>{ content }</h3>
        { Action && <Action {...preventTab && { tabIndex: "-1" }} /> }
      </Link>
    </li>
  )
}

export const ProductPreview = ({ product, ...innerProps }) => {
  const {
    images: [firstImage, secondImage],
    title,
    handle,
    variants: [{
      shopifyId,
      presentmentPrices
    }]
  } = product

  const prices = useMemo(() => presentmentPrices.edges.reduce((acc, cur) => {
    const { compareAtPrice, price: { amount, currencyCode }} = cur.node
    return {
      ...acc,
      [currencyCode]: [amount, compareAtPrice ? compareAtPrice.amount : null]
    }
  }, {}), [ presentmentPrices ])

  const path = `/shop/${ handle }`
  const image = { firstImage, secondImage, alt: handle }
  const content = (
    <>
      <p>{ title }</p>
      <CurrencyDisplay cost={ prices } />
    </>
  )
  const Action = (props) => (
    <AddToCart
      {...props}
      productId={ shopifyId }
    />
  )

  return (
    <ItemPreview
      {...innerProps}
      {...{ path, image, content, Action }}
    />
  )
}

export const CollectionPreview = ({ collection, ...innerProps }) => {
  const { title, handle, image: firstImage } = collection
  const path = `/shop/collections/${ handle }`
  const image = { firstImage, alt: title }
  const content = <p>{ title }</p>
  
  return (
    <ItemPreview
      {...innerProps}
      {...{ path, image, content }}
    />
  )
}