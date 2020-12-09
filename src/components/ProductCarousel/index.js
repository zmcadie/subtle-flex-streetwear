import React, { useState, useMemo, useEffect } from "react"
import ProductPreview from "../ProductPreview"

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

const ProductCarousel = ({ products, title }) => {
  const [ offset, setOffset ] = useState(0)
  const [ viewWidth, setViewWidth ] = useState(1400)
  const [ availableProducts, productsLength ] = useMemo(() => {
    const available = products.filter(product => product.availableForSale)
    return [ available, available.length ]
  }, [ products ])

  useEffect(() => {
    setViewWidth(window.innerWidth)
  }, [])

  const shiftTo = (mod) => {
    const breakpoint = viewWidth >= 1400 ? 1400 : viewWidth >= 1080 ? 1080 : viewWidth >= 760 ? 760 : null
    const overflow = productsLength - (breakpoint ? overflowMod[breakpoint] : 0)
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
    <div className={`product-carousel-container ${availableProducts.length <= visibleElements() ? "no-overflow" : ""}`}>
      { title ? <h2>{ title }</h2> : "" }
      <button className="shift-carousel carousel-left" onClick={ shiftLeft }><Left /></button>
      <ul className="product-carousel" style={{ left: calcOffset(offset) }}>
        { availableProducts.map((product, i) => (
          <ProductPreview
            key={ product.shopifyId }
            product={ product }
            preventTab={ !inView(i) }
          />
        )) }
      </ul>
      <button className="shift-carousel carousel-right" onClick={ shiftRight }><Right /></button>
    </div>
  )
}

export default ProductCarousel