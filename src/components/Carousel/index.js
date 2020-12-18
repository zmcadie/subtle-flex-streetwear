import React, { useState, useMemo, useEffect } from "react"
import { ProductPreview, CollectionPreview } from "../ItemPreview"

import "./styles.scss"

const Left = () => (
  <svg height="50" width="16">
    <path
      d="M 16 0 L 1 25 L 16 50"
      fill="transparent"
      stroke="#444"
      strokeWidth="1.5"
    />
  </svg>
)

const Right = () => (
  <svg height="50" width="16">
    <path
      d="M 0 0 L 15 25 L 0 50"
      fill="transparent"
      stroke="#444"
      strokeWidth="1.5"
    />
  </svg>
)

const overflowMod = {
  1400: 3,
  1080: 2,
  760: 1
}

const Carousel = ({ title, items, ListItem }) => {
  const [ offset, setOffset ] = useState(0)
  const [ viewWidth, setViewWidth ] = useState(1400)

  useEffect(() => {
    setViewWidth(window.innerWidth)
  }, [])

  const shiftTo = (mod) => {
    const breakpoint = viewWidth >= 1400 ? 1400 : viewWidth >= 1080 ? 1080 : viewWidth >= 760 ? 760 : null
    const overflow = items.length - (breakpoint ? overflowMod[breakpoint] : 0)
    const newOffset = (offset + mod + overflow) % overflow
    setOffset(newOffset)
  }

  const shiftLeft = () => {
    shiftTo(-1)
  }
  const shiftRight = () => {
    shiftTo(1)
  }

  const getViewMod = () => {
    const breakpoint = viewWidth >= 1400 ? 1400 : viewWidth >= 1080 ? 1080 : viewWidth >= 760 ? 760 : null
    const viewMod = breakpoint ? overflowMod[breakpoint] : 0
    return viewMod
  }

  const inView = index => {
    const viewMod = getViewMod()
    return index >= offset && index <= offset + viewMod
  }

  const calcOffset = offset => {
    const isSmall = viewWidth < 375
    return offset * -(isSmall ? 280 : 320)
  }

  const visibleElements = () => getViewMod() + 1

  return (
    <div className={`carousel-container ${items.length <= visibleElements() ? "no-overflow" : ""}`}>
      { title ? <h2>{ title }</h2> : "" }
      <button aria-label="shift carousel left" className="shift-carousel carousel-left" onClick={ shiftLeft }><Left /></button>
      <ul className="carousel" style={{ left: calcOffset(offset) }}>
        { items.map((item, i) => (
          <ListItem
            key={ i }
            item={ item }
            isOverflow={ !inView(i) }
          />
        )) }
      </ul>
      <button aria-label="shift carousel left" className="shift-carousel carousel-right" onClick={ shiftRight }><Right /></button>
    </div>
  )
}

export const ProductCarousel = ({ products, title }) => {
  const items = useMemo(() => (
    products.filter(product => product.availableForSale)
  ), [ products ])

  const ListItem = ({ item, isOverflow }) => (
    <ProductPreview
      product={ item }
      preventTab={ isOverflow }
    />
  )

  return <Carousel {...{ title, items, ListItem }} />
}

export const CollectionCarousel = ({ collections: items, title }) => {
  const ListItem = ({ item, isOverflow }) => (
    <CollectionPreview
      collection={ item }
      preventTab={ isOverflow }
    />
  )

  return <Carousel {...{ title, items, ListItem }} />
}