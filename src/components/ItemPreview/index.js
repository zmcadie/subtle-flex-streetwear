import React, { useMemo, useContext, useEffect, useState } from "react"
import { Link } from "gatsby"
import BackgroundImage from 'gatsby-background-image'
import StoreContext from "../../context/StoreContext"

import AddToCart from "../AddToCart"

import "./styles.scss"

const CurrencyDisplay = ({ cost }) => {
  const { store: { selected_currency: { code, symbol }}} = useContext(StoreContext)
  const price = cost[code]
  const float = Number.parseFloat(price)
  const isRound = Math.round(float) === float
  const displayPrice = (Math.round(float * 100) / 100).toFixed(isRound ? 0 : 2)
  return `${symbol}${displayPrice}`
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

  const path = `/shop/${ handle }`
  const image = { firstImage, secondImage, alt: handle }
  const content = (
    <>
      <p>{ title }</p>
      <p><CurrencyDisplay cost={ prices } /></p>
    </>
  )
  const Action = (props) => (
    <AddToCart
      {...props}
      productId={ variants[0].shopifyId }
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