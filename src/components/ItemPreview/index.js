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
  if (!firstImage || (!firstImage.localFile && !firstImage.src)) return ""
  
  const hasLocal = firstImage.localFile
  const hasSecond = secondImage && (hasLocal ? secondImage.localFile : secondImage.src)

  const Image = hasLocal ? BackgroundImage : "div"
  const firstBg = hasLocal
    ? { fluid: firstImage.localFile.childImageSharp.fluid }
    : { style: { backgroundImage: `url(${firstImage.src})` }}
  const secondBg = hasLocal
    ? { fluid: (hasSecond ? secondImage : firstImage).localFile.childImageSharp.fluid }
    : { style: { backgroundImage: `url(${(hasSecond ? secondImage : firstImage).src})` }}

  return (
    <Image
      className={`item-preview-image ${ !hasSecond ? "zoom-transition" : ""}`}
      alt={ alt }
      {...secondBg}
    >
      <Image
        className="item-preview-image transition-on-hover"
        alt={ alt }
        {...firstBg}
      />
    </Image>
  )
}

const ItemPreview = ({
  path,
  image,
  content,
  Action,
  preventTab,
  from,
  ...innerProps
}) => {
  const [ pathname, setPathname ] = useState("")

  useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  return (
    <li className="item-preview-container" {...innerProps}>
      <Link to={ path } state={{ from: from ? from : pathname }} {...preventTab && { tabIndex: "-1" }}>
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
      id,
      shopifyId,
      presentmentPrices
    }]
  } = product

  const prices = useMemo(() => (presentmentPrices.edges || presentmentPrices).reduce((acc, cur) => {
    const { compareAtPrice, price: { amount, currencyCode }} = (cur.node || cur)
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
      productId={ shopifyId || id }
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